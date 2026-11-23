import {CAFE_SEATS} from './cafeLayout.js'
import {GARDEN_SEATING,GARDEN_LEVEL} from './greenhouseLayout.js'
import {atticX} from './atticLayout.js'
import {READING_CHAIRS,CHAIR_HEIGHT,STUDY_CHAIR} from './roomFurniture.js'
import {SOFAS} from './layout.js'
import {walkHeight,movePlayer} from './navigation.js'
import {GARDEN_BENCHES} from './gardenLayout.js'
import {findSeatExitPath} from './seatExitPath.js'

function point(x,z,turn,side,front){
  return {x:x+Math.cos(turn)*side+Math.sin(turn)*front,z:z-Math.sin(turn)*side+Math.cos(turn)*front}
}
function seat(id,label,x,z,turn,level,height,side=0,front=.24,approach=1.12){
  return {id,label,turn,level,height,anchor:point(x,z,turn,side,front),entry:point(x,z,turn,side,approach)}
}
const sofaNames=['버건디 긴 소파','딥그린 소파','가죽 소파','독서 안락의자']
export const SEATS=[
 seat('basement-sofa-west','지하 크림 소파',9.7,4.4,Math.PI,-5.2,.68,0,.14,1.25),
 seat('basement-sofa-east','지하 숲 전망 소파',14,4.4,Math.PI,-5.2,.68,0,.14,1.25),
 seat('forest-sofa-west','숲 전망 소파',9.3,4.05,Math.PI,0,.75,0,.16,1.15),
 seat('forest-sofa-center','숲 전망 소파 가운데',10.7,4.05,Math.PI,0,.75,0,.16,1.15),
 seat('veranda-west','바다 마루 서쪽 방석',-17.5,-11.8,Math.PI,0,.24,0,0,1.12),
 seat('veranda-east','바다 마루 동쪽 방석',-12.5,-11.8,Math.PI,0,.24,0,0,1.12),
 ...GARDEN_SEATING.map(s=>seat(s.id,s.label,s.x,s.z,s.turn,GARDEN_LEVEL,s.height,s.side||0,.1,1.15)),
 seat('study-window','작업실 창가 벤치',-5.4,-19.85,Math.PI,0,.67,0,.10,1.13),
 {...seat('study-desk','작업실 집필 의자',0,-26.65,Math.PI,0,.62,0,.1,1.13),entry:{x:1.85,z:-25.52}},
  seat(STUDY_CHAIR.id,STUDY_CHAIR.label,STUDY_CHAIR.x,STUDY_CHAIR.z,0,0,CHAIR_HEIGHT,0,.10,1.13),
  ...SOFAS.flatMap((s,index)=>Array.from({length:s.seats},(_,i)=>seat(`lounge-${index}-${i}`,`${sofaNames[index]}${s.seats>1?' · '+(i+1)+'번 자리':''}`,s.x,s.z,s.turn,0,.70,(i-(s.seats-1)/2)*.72))),
  ...READING_CHAIRS.map(s=>seat(s.id,s.label,s.x,s.z,s.turn,s.level,s.level===10.6?.53:CHAIR_HEIGHT,0,.10,s.level===10.6?1.26:1.13)),
  seat('attic-daybed','다락 데이베드',-17.55,-.4,Math.PI/2,10.6,.84,0,.87,1.95),
  seat('terrace-sofa','테라스 소파',-18.5,7.85,Math.PI/2,10.6,.76,0,.14,1.2),
  ...GARDEN_BENCHES.map(([x,z],i)=>seat(`garden-${i}`,i===0?'서쪽 정원 벤치':'동쪽 정원 벤치',x,z,Math.PI,0,.71,0,.08,1.25)),
 ...CAFE_SEATS.map(([x,z],i)=>seat(`cafe-seat-${i}`,i<2?'북카페 독서 의자':'미니 극장 의자',x,z,Math.PI,0,.63,0,.1,1.2)),
]
const bed=SEATS.find(s=>s.id==='attic-daybed')
bed.anchor.x=atticX(bed.anchor.x);bed.entry.x=atticX(bed.entry.x)
const terrace=SEATS.find(s=>s.id==='terrace-sofa')
terrace.anchor.x=atticX(terrace.anchor.x);terrace.entry.x=atticX(terrace.entry.x)
export function seatGroundPathClear(from,to,level,world){
 if(!Number.isFinite(from.x+from.z+to.x+to.z+level))return false
 const distance=Math.hypot(to.x-from.x,to.z-from.z)
 if(distance>1.05)return false
 const initial=walkHeight(from.x,from.z,level,world)
 if(initial===null||Math.abs(initial-level)>.08)return false
 const steps=Math.max(1,Math.ceil(distance/.05))
 let previous={x:from.x,z:from.z,level}
 for(let i=1;i<=steps;i++){
  const x=from.x+(to.x-from.x)*i/steps,z=from.z+(to.z-from.z)*i/steps
  // movePlayer already samples collision and floor height every 5.5 cm.
  // Do not repeat those complete world queries for each exit-path probe.
  const moved=movePlayer(previous,x-previous.x,z-previous.z,world)
  if(Math.hypot(moved.x-x,moved.z-z)>.001||Math.abs(moved.level-level)>.08)return false
  previous={x,z,level}
 }
 return true
}
export function nearbySeat(position,world){
  let nearest=null,best=.88*.88
  for(const seat of SEATS){
    if(Math.abs(position.level-seat.level)>=.08)continue
    const d=(position.x-seat.entry.x)**2+(position.z-seat.entry.z)**2
    if(d>=best)continue
    if(world&&!seatGroundPathClear(position,seat.entry,seat.level,world))continue
    nearest=seat;best=d
  }
  return nearest
}
const smooth=t=>t*t*(3-2*t)
const lerp=(a,b,t)=>a+(b-a)*t
const angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t
export function startSitting(position,chosen,world){
  if(world&&(Math.abs(position.level-chosen.level)>.08||!seatGroundPathClear(position,chosen.entry,chosen.level,world)))return null
  return {seat:chosen,posture:chosen.posture||'sitting',phase:'entering',elapsed:0,duration:1.05,
    origin:{x:position.x,z:position.z,level:position.level,yaw:position.yaw,bodyYaw:position.bodyYaw??-position.yaw}}
}
export function exitForSeat(sitting,world){
  const {seat:s,origin}=sitting
  const candidates=[origin,{...s.entry,level:s.level,yaw:origin.yaw},...[-.35,.35].map(offset=>({...point(s.entry.x,s.entry.z,s.turn,offset,.3),level:s.level,yaw:origin.yaw}))]
  return candidates.find(p=>Math.abs(p.level-s.level)<.08&&seatGroundPathClear(s.entry,p,s.level,world))||null
}
export function startStanding(sitting,world){
  if(sitting.phase!=='seated')return sitting
  const s=sitting.seat,o=sitting.origin
  const path=Math.abs(o.level-s.level)<.08?findSeatExitPath(s.entry,o,(a,b)=>seatGroundPathClear(a,b,s.level,world)):null
  if(path&&path.length>2)return {...sitting,origin:{...s.entry,level:s.level,yaw:o.yaw},floorExit:path,exitBlocked:false,phase:'leaving',elapsed:0,duration:['attic-daybed','meadow-rest'].includes(s.id)?2.8:.9,exitRecline:sitting.recline||0}
  const exit=exitForSeat(sitting,world)
  return exit?{...sitting,origin:exit,exitBlocked:false,phase:'leaving',elapsed:0,duration:['attic-daybed','meadow-rest'].includes(sitting.seat.id)?2.8:.9,exitRecline:sitting.recline||0}:{...sitting,exitBlocked:true}
}
function sampleSeating(sitting,dt){
  const next={...sitting,elapsed:Math.min(sitting.duration,sitting.elapsed+Math.max(0,Math.min(dt,.1)))}
  if(next.phase==='entering'&&next.elapsed>=next.duration)next.phase='seated'
  const bedExit=next.phase==='leaving'&&['attic-daybed','meadow-rest'].includes(next.seat.id)
  const t=next.elapsed/next.duration
  const progress=next.phase==='seated'?1:smooth(bedExit?Math.max(0,(t-.45)/.55):t)
  const routeAmount=next.phase==='leaving'?1-progress:progress
  const {seat:s,origin:o}=next
  next.recline=(sitting.recline||0)+((next.posture==='lying'&&next.phase!=='leaving'?Math.PI/2:0)-(sitting.recline||0))*(1-Math.exp(-5*Math.max(0,Math.min(dt,.1))))
  if(bedExit)next.recline=(next.exitRecline||0)*(1-smooth(Math.min(1,t/.45)))
  const lie=next.recline/(Math.PI/2)
  // Follow the clear floor connector before moving onto the owning cushion.
  // Reversing this route avoids a diagonal shortcut across adjacent furniture.
  const anchor={x:s.anchor.x-.22*lie,z:s.anchor.z}
  const groundDistance=Math.hypot(o.x-s.entry.x,o.z-s.entry.z)
  const cushionDistance=Math.hypot(anchor.x-s.entry.x,anchor.z-s.entry.z)
  const split=groundDistance>.001?Math.min(.65,groundDistance/(groundDistance+cushionDistance||1)):0
  const amount=split?Math.max(0,(routeAmount-split)/(1-split)):routeAmount
  const groundProgress=split?Math.min(1,routeAmount/split):1
  const pose={x:routeAmount<split?lerp(o.x,s.entry.x,groundProgress):lerp(s.entry.x,anchor.x,amount),z:routeAmount<split?lerp(o.z,s.entry.z,groundProgress):lerp(s.entry.z,anchor.z,amount),
    // Rotation is around the avatar's feet, not its body centre. Lift the
    // horizontal torso above the thick quilt (top ~1.18m, body radius ~.5m).
    y:s.level+s.height*amount+.10*Math.sin(Math.PI*amount)+(s.id==='attic-daybed'?.85*lie*amount:0),
    rotation:angle(o.bodyYaw??-o.yaw,s.turn+Math.PI,amount),amount,recline:next.recline,
    walking:split>0&&routeAmount<split&&next.phase!=='seated'}
  return {seating:next.phase==='leaving'&&next.elapsed>=next.duration?null:next,pose}
}

export function advanceSeating(sitting,dt,world){
 if(sitting.phase==='floorExit')return advanceFloorExit(sitting,dt,world)
 const result=sampleSeating(sitting,dt)
 if(!world||sitting.phase==='seated')return result
 const previous=sampleSeating(sitting,0).pose
 const {seat:s,origin:o}=sitting
 // The cushion belongs to the seat and is intentionally solid. Only validate
 // the public floor connector, including its landing, against navigation.
 const from=previous.amount===0?previous:s.entry
 const to=sitting.phase==='leaving'?o:s.entry
 const needsCheck=sitting.phase==='leaving'||previous.amount===0
 if(needsCheck&&!seatGroundPathClear(from,to,s.level,world)){
  let retry=Math.max(0,(sitting.retry||0)-Math.max(0,Math.min(dt,.1)))
  if(sitting.phase==='leaving'&&previous.amount===0&&retry===0){
   const route=findSeatExitPath(previous,o,(a,b)=>seatGroundPathClear(a,b,s.level,world))
   if(route)return {seating:{...sitting,phase:'floorExit',floorExit:route,floorPose:previous,routeIndex:1,retry:0,transitionBlocked:false},pose:{...previous,walking:false}}
   retry=.3
  }
  return {seating:{...sitting,retry,transitionBlocked:true},pose:{...previous,walking:false}}
 }
 if(result.seating)result.seating.transitionBlocked=false
 if(!result.seating&&sitting.floorExit){
  result.seating={...sitting,phase:'floorExit',floorPose:result.pose,transitionBlocked:false,routeIndex:1,retry:0}
 }
 return result
}

function advanceFloorExit(state,dt,world){
 const next={...state},pose={...state.floorPose,walking:false}
 const goal=state.floorExit.at(-1),target=state.floorExit[state.routeIndex]
 const clear=(a,b)=>seatGroundPathClear(a,b,state.seat.level,world)
 if(!clear(pose,target)){
  next.retry=Math.max(0,(state.retry||0)-Math.min(dt,.1))
  if(next.retry===0){
   const route=findSeatExitPath(pose,goal,clear)
   next.retry=.3
   if(route){next.floorExit=route;next.routeIndex=1;next.transitionBlocked=false}
   else next.transitionBlocked=true
  }
  return {seating:next,pose}
 }
 next.transitionBlocked=false;next.retry=0
 const dx=target.x-pose.x,dz=target.z-pose.z,d=Math.hypot(dx,dz)
 const step=Math.min(d,Math.max(0,Math.min(dt,.1))*.85)
 if(d>0){pose.x+=dx/d*step;pose.z+=dz/d*step;pose.walking=true;pose.rotation=angle(pose.rotation,Math.atan2(dx,dz),1-Math.exp(-8*Math.min(dt,.1)))}
 next.floorPose=pose
 if(d<=step+.00001)next.routeIndex++
 return {seating:next.routeIndex>=next.floorExit.length?null:next,pose}
}
