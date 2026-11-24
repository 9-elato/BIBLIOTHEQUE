import {SEATS,seatsForWorld,startSitting,startStanding} from './seating.js'
import {walkHeight,movePlayer} from './navigation.js'
export function createFurnitureTour(player,onlyBed=false,world){return {seats:onlyBed?SEATS.filter(s=>s.id==='attic-daybed'):seatsForWorld(world),index:-1,phase:'next',elapsed:0,results:[],saved:{x:player.x,z:player.z,level:player.level,yaw:player.yaw,bodyYaw:player.bodyYaw,pitch:player.pitch},running:true}}
export function advanceFurnitureTour(t,s,world,dt){
 if(!t.running)return
 t.elapsed+=Math.min(dt,.1)
 const record=result=>{
  t.results.push({id:t.seat.id,label:t.seat.label,result})
  if(result.startsWith('실패')&&s.seated){
   const safe=[t.safePosition,t.saved].find(p=>p&&walkHeight(p.x,p.z,p.level,world)!==null)
   if(!safe){t.running=false;t.preservePosition=true;t.label='점검 중지 · 안전한 복귀 위치 없음';return}
   Object.assign(s,safe,{seated:null})
  }
  t.phase='next';t.elapsed=0
 }
 if(t.phase==='next'){
  t.seat=t.seats[++t.index]
  if(!t.seat){t.running=false;t.label='점검 완료 · 결과를 확인하세요';return}
  if(t.seat.id.startsWith('study-')&&!world.gateReady){record('건너뜀: 비밀 책장을 먼저 여세요');return}
  const seat=t.seat
  const origin={...seat.entry,level:seat.level,yaw:-seat.turn-.4,bodyYaw:seat.turn+Math.PI,pitch:0}
  const start=[[-.3,0],[.3,0],[0,-.3],[0,.3]].map(([dx,dz])=>({...origin,x:origin.x+dx,z:origin.z+dz})).find(p=>walkHeight(p.x,p.z,p.level,world)!==null&&Math.hypot(movePlayer(p,origin.x-p.x,origin.z-p.z,world).x-origin.x,movePlayer(p,origin.x-p.x,origin.z-p.z,world).z-origin.z)<.01)
  if(!start){record('실패: 접근 경로 막힘');return}
  t.safePosition={...start}
  Object.assign(s,start,{seated:null});s.keys?.clear();t.phase='approach';t.elapsed=0;t.label=seat.label
 }else if(t.phase==='approach'){
  const dx=t.seat.entry.x-s.x,dz=t.seat.entry.z-s.z,d=Math.hypot(dx,dz),step=Math.min(d,Math.min(dt,.1)*.6)
  if(d>.01)Object.assign(s,movePlayer(s,dx/d*step,dz/d*step,world))
  else {s.seated=startSitting(s,t.seat,world);if(!s.seated){record('실패: 착석 직전 접근 경로 막힘');return}t.phase='sit';t.elapsed=0}
  if(t.elapsed>4)record('실패: 접근 시간 초과')
 }else if(t.phase==='sit'&&s.seated?.phase==='seated'){
  if(t.seat.id==='attic-daybed')s.seated.posture='lying'
  t.phase='rest';t.elapsed=0
 }else if(t.phase==='rest'&&t.elapsed>4){s.seated=startStanding(s.seated,world);t.phase='leave';t.elapsed=0}
 else if(t.phase==='leave'&&!s.seated){record(walkHeight(s.x,s.z,s.level,world)!==null?'통과: 접근·착석·하차':'실패: 하차 위치 충돌')}
 else if(t.elapsed>12){record('실패: 동작 시간 초과')}
}
