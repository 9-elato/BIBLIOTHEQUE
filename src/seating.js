import {GARDEN_SEATING,GARDEN_LEVEL} from './greenhouseLayout.js'
import {atticX} from './atticLayout.js'
import {READING_CHAIRS,CHAIR_HEIGHT,STUDY_CHAIR} from './roomFurniture.js'
import {SOFAS} from './layout.js'
import {walkHeight} from './navigation.js'
import {GARDEN_BENCHES} from './gardenLayout.js'

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
 seat('study-window','작업실 창가 벤치',6.25,-20.7,-Math.PI/2,0,.67,0,.10,1.13),
 {...seat('study-desk','작업실 집필 의자',0,-26.65,Math.PI,0,.62,0,.1,1.13),entry:{x:1.85,z:-25.52}},
  seat(STUDY_CHAIR.id,STUDY_CHAIR.label,STUDY_CHAIR.x,STUDY_CHAIR.z,0,0,CHAIR_HEIGHT,0,.10,1.13),
  ...SOFAS.flatMap((s,index)=>Array.from({length:s.seats},(_,i)=>seat(`lounge-${index}-${i}`,`${sofaNames[index]}${s.seats>1?' · '+(i+1)+'번 자리':''}`,s.x,s.z,s.turn,0,.70,(i-(s.seats-1)/2)*.72))),
  ...READING_CHAIRS.map(s=>seat(s.id,s.label,s.x,s.z,s.turn,s.level,s.level===10.6?.53:CHAIR_HEIGHT,0,.10,s.level===10.6?1.26:1.13)),
  seat('attic-daybed','다락 데이베드',-17.55,-.4,Math.PI/2,10.6,.84,0,.87,1.95),
  ...GARDEN_BENCHES.map(([x,z],i)=>seat(`garden-${i}`,i===0?'서쪽 정원 벤치':'동쪽 정원 벤치',x,z,Math.PI,0,.71,0,.08,1.25)),
]
const bed=SEATS.find(s=>s.id==='attic-daybed')
bed.anchor.x=atticX(bed.anchor.x);bed.entry.x=atticX(bed.entry.x)
export function nearbySeat(position,world){
  let nearest=null,best=.88*.88
  for(const seat of SEATS){
    if(Math.abs(position.level-seat.level)>=.08)continue
    const d=(position.x-seat.entry.x)**2+(position.z-seat.entry.z)**2
    if(d>=best)continue
    if(world&&walkHeight(seat.entry.x,seat.entry.z,seat.level,world)===null)continue
    nearest=seat;best=d
  }
  return nearest
}
const smooth=t=>t*t*(3-2*t)
const lerp=(a,b,t)=>a+(b-a)*t
const angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t
export function startSitting(position,chosen){
  return {seat:chosen,posture:chosen.posture||'sitting',phase:'entering',elapsed:0,duration:1.05,
    origin:{x:position.x,z:position.z,level:position.level,yaw:position.yaw,bodyYaw:position.bodyYaw??-position.yaw}}
}
export function exitForSeat(sitting,world){
  const {seat:s,origin}=sitting
  const candidates=[origin,{...s.entry,level:s.level,yaw:origin.yaw},...[-.35,.35].map(offset=>({...point(s.entry.x,s.entry.z,s.turn,offset,.3),level:s.level,yaw:origin.yaw}))]
  return candidates.find(p=>walkHeight(p.x,p.z,p.level,world)!==null)||null
}
export function startStanding(sitting,world){
  if(sitting.phase!=='seated')return sitting
  const exit=exitForSeat(sitting,world)
  return exit?{...sitting,origin:exit,phase:'leaving',elapsed:0,duration:['attic-daybed','meadow-rest'].includes(sitting.seat.id)?2.8:.9,exitRecline:sitting.recline||0}:sitting
}
export function advanceSeating(sitting,dt){
  const next={...sitting,elapsed:Math.min(sitting.duration,sitting.elapsed+Math.max(0,Math.min(dt,.1)))}
  if(next.phase==='entering'&&next.elapsed>=next.duration)next.phase='seated'
  const bedExit=next.phase==='leaving'&&['attic-daybed','meadow-rest'].includes(next.seat.id)
  const t=next.elapsed/next.duration
  const progress=next.phase==='seated'?1:smooth(bedExit?Math.max(0,(t-.45)/.55):t)
  const amount=next.phase==='leaving'?1-progress:progress
  const {seat:s,origin:o}=next
  next.recline=(sitting.recline||0)+((next.posture==='lying'&&next.phase!=='leaving'?Math.PI/2:0)-(sitting.recline||0))*(1-Math.exp(-5*Math.max(0,Math.min(dt,.1))))
  if(bedExit)next.recline=(next.exitRecline||0)*(1-smooth(Math.min(1,t/.45)))
  const lie=next.recline/(Math.PI/2)
  const pose={x:lerp(o.x,s.anchor.x-.22*lie,amount),z:lerp(o.z,s.anchor.z,amount),
    // Rotation is around the avatar's feet, not its body centre. Lift the
    // horizontal torso above the thick quilt (top ~1.18m, body radius ~.5m).
    y:s.level+s.height*amount+.10*Math.sin(Math.PI*amount)+(s.id==='attic-daybed'?.85*lie*amount:0),
    rotation:angle(o.bodyYaw??-o.yaw,s.turn+Math.PI,amount),amount,recline:next.recline}
  return {seating:next.phase==='leaving'&&next.elapsed>=next.duration?null:next,pose}
}
