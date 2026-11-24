import test from 'node:test'
import assert from 'node:assert/strict'
import {walkHeight,movePlayer,ATTIC_HEIGHT,FURNITURE} from '../src/navigation.js'
import {atticX,ATTIC_TERRACE_BOUNDS} from '../src/atticLayout.js'
import {SPRING_CANOPY_HEIGHT} from '../src/basementLayout.js'
import {seatsForWorld,startSitting,startStanding,advanceSeating} from '../src/seating.js'
import {interactionAt} from '../src/interactions.js'
import {stacksPendantX} from '../src/fixtureMounts.js'
const world={end:45,gateReady:true,entranceOpen:true}
function route(start,points){let p=start;for(const [x,z] of points){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.03,`blocked ${x},${z}, got ${p.x},${p.z}`)}return p}

test('twice-wide terrace opens both extensions while keeping rear and edge guards',()=>{
 assert.ok(Math.abs((ATTIC_TERRACE_BOUNDS[1]-ATTIC_TERRACE_BOUNDS[0])-15.8*1.12)<.001)
 route({x:atticX(-15),z:8.9,level:ATTIC_HEIGHT},[[atticX(-21),8.9],[atticX(-15),8.9],[atticX(-10),8.9]])
 for(const x of [-22,-9])assert.equal(walkHeight(atticX(x),6.65,ATTIC_HEIGHT,world),null)
 assert.equal(FURNITURE.some(f=>f.id==='terrace-telescope'),false)
})
test('spring garden is accessible through open long side and returns without crossing water or glass',()=>{
 assert.ok(SPRING_CANOPY_HEIGHT>6)
 const start={x:18.7,z:7,level:-5.2}
 const end=route(start,[[17,7],[17,19],[17,24],[24,24],[24,19],[18.7,19],[18.7,7]])
 assert.equal(end.level,-5.2)
 assert.equal(walkHeight(16,6.55,-5.2,world),null)
 assert.equal(walkHeight(22,8.6,-5.2,world),null)
})
test('all four wing seats support E entry and collision-free exit after shelf growth',()=>{
 for(const end of [45,55]){
 const w={...world,end}
 for(const seat of seatsForWorld(w).filter(s=>s.id.startsWith('wing-'))){
  const p={...seat.entry,level:0,yaw:0}
  assert.equal(walkHeight(p.x,p.z,0,w),0,seat.id)
  const action=interactionAt(p,{world:w},true)
  assert.equal(action.seat?.id,seat.id)
  let state=action.sitting,result
  for(let i=0;i<80;i++){result=advanceSeating(state,.05,w);state=result.seating;if(state.phase==='seated')break}
  assert.equal(state.phase,'seated')
  state=startStanding(state,w);assert.equal(state.phase,'leaving')
  for(let i=0;i<80&&state;i++){result=advanceSeating(state,.05,w);state=result.seating}
  assert.equal(state,null);assert.equal(walkHeight(result.pose.x,result.pose.z,0,w),0)
 }
 }
})
test('prepared E action matches validated sitting and still rejects a changed obstruction',()=>{
 const seat=seatsForWorld(world).find(s=>s.id==='study-chair'),p={...seat.entry,level:0,yaw:.4}
 const action=interactionAt(p,{world},true)
 assert.deepEqual(action.sitting,startSitting(p,seat,world))
 const blocker={id:'new-obstruction',floor:0,rect:[p.x-.1,p.x+.1,p.z-.1,p.z+.1]}
 FURNITURE.push(blocker)
 try{assert.notEqual(interactionAt(p,{world},true)?.type,'seat')}finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
})
test('first stacks pendant and crossbeam sit inside the actual ceiling slab',()=>{
 for(const start of [15.1,20.1,25.1])assert.ok(stacksPendantX(start)-.08>=15.5)
})

test('E preparation removes the repeated path query without changing the sitting pose',()=>{
 const seat=seatsForWorld(world).find(s=>s.id==='study-chair'),p={x:seat.entry.x+.4,z:seat.entry.z,level:0,yaw:.4}
 let checks=0
 const w={...world,get ladders(){checks++;return []}}
 const oldAction=interactionAt(p,{world:w});const oldState=startSitting(p,oldAction.seat,w),oldChecks=checks
 checks=0
 const newAction=interactionAt(p,{world:w},true)
 assert.deepEqual(newAction.sitting,oldState)
 assert.ok(checks<=oldChecks/2,`${checks} versus ${oldChecks} floor probes`)
})
