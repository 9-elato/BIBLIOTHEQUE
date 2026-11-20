import test from 'node:test'
import assert from 'node:assert/strict'
import {SEATS,nearbySeat,startSitting,startStanding,advanceSeating,exitForSeat} from '../src/seating.js'
import {walkHeight,movePlayer} from '../src/navigation.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true}
const origin=s=>({...s.entry,level:s.level,yaw:.6})
test('secret passage connects to study seating and back without crossing desk or lamp',()=>{
 const s=SEATS.find(s=>s.id==='study-chair')
 let p={x:0,z:-12,level:0,yaw:0}
 const closed=movePlayer(p,0,-8,{...world,gateReady:false})
 assert.ok(closed.z>-14.1)
 for(const [x,z] of [[0,-20],[s.entry.x,-20],[s.entry.x,s.entry.z]]){
  p=movePlayer(p,x-p.x,z-p.z,world)
  assert.ok(Math.hypot(p.x-x,p.z-z)<.01)
 }
 const result=finish(startStanding(finish(startSitting(p,s)).seating,world))
 p={...p,x:result.pose.x,z:result.pose.z}
 for(const [x,z] of [[s.entry.x,-20],[0,-20],[0,-12]]){
  p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.01)
 }
})
test('both garden benches are reachable from the path and allow walking after standing',()=>{
 for(const s of SEATS.filter(s=>s.id.startsWith('garden-'))){
  let p={x:0,z:s.entry.z-.9,level:0,yaw:Math.PI}
  p=movePlayer(p,s.entry.x,0,world)
  p=movePlayer(p,0,.9,world)
  assert.ok(Math.hypot(p.x-s.entry.x,p.z-s.entry.z)<.01,s.id)
  assert.equal(interactionAt(p,{world,heldBook:'book'}).seat.id,s.id)
  const end=finish(startStanding(finish(startSitting(p,s)).seating,world))
  const walked=movePlayer({...p,x:end.pose.x,z:end.pose.z},0,-1,world)
  assert.ok(Math.abs(walked.z-(s.entry.z-1))<.01,s.id+' can leave')
 }
})
function finish(state){let result;for(let i=0;i<240;i++){result=advanceSeating(state,1/60);state=result.seating;if(!state||state.phase==='seated')return result}throw Error('transition did not finish')}
test('all 27 cushion approaches are reachable and select the correct seat',()=>{
 assert.equal(SEATS.length,27)
 for(const s of SEATS){assert.equal(walkHeight(s.entry.x,s.entry.z,s.level,world),s.level,s.id);assert.equal(nearbySeat(origin(s),world)?.id,s.id)}
})
test('every seat smoothly reaches its cushion and returns to a collision-free origin',()=>{
 for(const s of SEATS){
  const from=origin(s),start=startSitting(from,s),first=advanceSeating(start,1/60)
  assert.ok(first.pose.amount>0&&first.pose.amount<.01)
  assert.ok(Math.hypot(first.pose.x-from.x,first.pose.z-from.z)<.02)
  const seated=finish(start);assert.equal(seated.pose.amount,1);assert.equal(seated.pose.y,s.level+s.height)
  assert.equal(seated.pose.x,s.anchor.x);assert.equal(seated.pose.z,s.anchor.z)
  const leaving=startStanding(seated.seating,world),end=finish(leaving)
  assert.equal(end.seating,null);assert.equal(end.pose.amount,0);assert.equal(end.pose.x,from.x);assert.equal(end.pose.z,from.z)
  assert.equal(walkHeight(end.pose.x,end.pose.z,from.level,world),s.level)
 }
})
test('transition cannot be interrupted by repeated interaction and distant floors cannot sit',()=>{
 const s=SEATS[0],state=startSitting(origin(s),s)
 assert.equal(startStanding(state,world),state)
 assert.equal(interactionAt({...origin(s),seated:state},{world,heldBook:'book'}),null)
 assert.equal(nearbySeat({...origin(s),level:10.6},world),null)
 assert.equal(nearbySeat({x:0,z:23,level:0},world),null)
})
test('held books prioritize sitting and standing; invalid origin falls back to safe approach',()=>{
 const s=SEATS[2],position=origin(s)
 assert.equal(interactionAt(position,{world,heldBook:'book',canPlace:true}).type,'seat')
 const state=finish(startSitting(position,s)).seating
 assert.equal(interactionAt({...position,seated:state},{world,heldBook:'book'}).type,'stand')
 state.origin={x:0,z:1,level:0,yaw:0}
 const exit=exitForSeat(state,world)
 assert.equal(exit.x,s.entry.x);assert.equal(exit.z,s.entry.z)
})
test('upstairs seats have walkable routes from their floor landing without crossing furniture',()=>{
 for(const start of [{x:-6.35,z:-5.7,level:7.2},{x:-11.65,z:5.65,level:10.6}]){
  const targets=SEATS.filter(s=>s.level===start.level),found=new Set(),queue=[start],visited=new Set(['0,0'])
  for(let i=0;i<queue.length&&found.size<targets.length;i++){
   const p=queue[i]
   for(const s of targets)if(Math.hypot(p.x-s.entry.x,p.z-s.entry.z)<.28)found.add(s.id)
   for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]]){
    const q=movePlayer(p,dx,dz,world)
    if(Math.abs(q.level-start.level)>.001||Math.abs(q.x-p.x-dx)+Math.abs(q.z-p.z-dz)>.001)continue
    const key=`${Math.round((q.x-start.x)*5)},${Math.round((q.z-start.z)*5)}`
    if(!visited.has(key)){visited.add(key);queue.push(q)}
   }
  }
  assert.deepEqual([...found].sort(),targets.map(s=>s.id).sort())
 }
})

test('daybed torso clears thick quilt and sits upright before a slow dismount',()=>{
 const bed=SEATS.find(s=>s.id==='attic-daybed')
 let seated=finish(startSitting(origin(bed),bed)).seating
 seated.posture='lying'
 let r
 for(let i=0;i<180;i++){r=advanceSeating(seated,1/60);seated=r.seating}
 assert.ok(r.pose.y-bed.level-.5>1.18,'body underside must clear quilt')
 let leaving=startStanding(seated,world),previous=r.pose
 assert.equal(leaving.duration,2.8)
 for(let i=0;i<75;i++){
  r=advanceSeating(leaving,1/60);leaving=r.seating
  assert.equal(r.pose.amount,1,'sit upright before sliding off bed')
  assert.ok(Math.abs(r.pose.y-previous.y)<.04,'no height snap');previous=r.pose
 }
 assert.ok(r.pose.recline<.01)
 const end=finish(leaving)
 assert.equal(end.seating,null);assert.equal(end.pose.recline,0)
 assert.equal(walkHeight(end.pose.x,end.pose.z,bed.level,world),bed.level)
})
