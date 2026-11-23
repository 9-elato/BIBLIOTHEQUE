import test from 'node:test'
import assert from 'node:assert/strict'
import {SEATS,nearbySeat,startSitting,startStanding,advanceSeating,exitForSeat,seatGroundPathClear} from '../src/seating.js'
import {walkHeight,movePlayer,FURNITURE} from '../src/navigation.js'
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
test('all 40 seat and bath approaches are reachable and select the correct seat',()=>{
 assert.equal(SEATS.length,40)
 for(const s of SEATS){assert.equal(walkHeight(s.entry.x,s.entry.z,s.level,world),s.level,s.id);assert.equal(nearbySeat(origin(s),world)?.id,s.id)}
})
test('every seat smoothly reaches its cushion and returns to a collision-free origin',()=>{
 for(const s of SEATS){
  const from=origin(s),start=startSitting(from,s),first=advanceSeating(start,1/60)
  assert.ok(first.pose.amount>0&&first.pose.amount<.01)
  assert.ok(Math.hypot(first.pose.x-from.x,first.pose.z-from.z)<.02)
  const seated=finish(start);assert.equal(seated.pose.amount,1);assert.equal(seated.pose.y,s.level+s.height)
  assert.ok(Math.abs(seated.pose.x-s.anchor.x)<1e-9);assert.ok(Math.abs(seated.pose.z-s.anchor.z)<1e-9)
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

test('attic beanbags preserve a wide aisle to the shelves and clear cabinet fronts',()=>{
 const a=SEATS.find(s=>s.id==='attic-0'),b=SEATS.find(s=>s.id==='attic-1')
 assert.equal(a.height,.53);assert.equal(b.height,.53)
 const gap=b.anchor.x-a.anchor.x-1.60
 assert.ok(gap>=.9,'at least 90cm between conservative furniture bounds')
 const x=(a.anchor.x+b.anchor.x)/2
 let p={x,z:3,level:10.6,yaw:0}
 for(let i=0;i<74;i++){const next=movePlayer(p,0,-.1,world);assert.ok(Math.abs(next.z-(p.z-.1))<.001,'central aisle remains walkable');p=next}
})

test('free endpoints do not allow sitting through furniture between them',()=>{
 const s=SEATS[1],from={...origin(s),x:s.entry.x+.7}
 const blocker={floor:s.level,id:'test-approach-barrier',rect:[s.entry.x+.32,s.entry.x+.38,s.entry.z-.1,s.entry.z+.1]}
 FURNITURE.push(blocker)
 try{
  assert.equal(walkHeight(from.x,from.z,s.level,world),s.level)
  assert.equal(walkHeight(s.entry.x,s.entry.z,s.level,world),s.level)
  assert.equal(seatGroundPathClear(from,s.entry,s.level,world),false)
  assert.notEqual(nearbySeat(from,world)?.id,s.id)
  assert.equal(startSitting(from,s,world),null)
  const seated={...startSitting(from,s),phase:'seated'}
  assert.deepEqual(exitForSeat(seated,world),{...s.entry,level:s.level,yaw:from.yaw})
 }finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
})

test('off-axis approach and exit pass through the entry before the cushion',()=>{
 const s=SEATS[1],from={...origin(s),x:s.entry.x+.7}
 let state=startSitting(from,s,world),floorFrames=0,seated
 assert.ok(state)
 for(let i=0;i<100;i++){
  const r=advanceSeating(state,1/60);state=r.seating
  if(r.pose.amount===0){floorFrames++;assert.equal(r.pose.z,s.entry.z);assert.equal(r.pose.y,s.level);assert.equal(r.pose.walking,true)}
  else assert.ok(Math.abs(r.pose.x-s.entry.x)<1e-8,'no diagonal shortcut to cushion')
  if(state.phase==='seated'){seated=state;break}
 }
 assert.ok(floorFrames>0);assert.ok(seated)
 const end=finish(startStanding(seated,world))
 assert.equal(end.pose.x,from.x);assert.equal(end.pose.z,from.z)
})

test('blocked dismount stays seated, explains why and can be retried',()=>{
 const s=SEATS[0],state=finish(startSitting(origin(s),s)).seating
 const blocker={floor:s.level,id:'test-exit-barrier',rect:[s.entry.x-.2,s.entry.x+.2,s.entry.z-.2,s.entry.z+.2]}
 FURNITURE.push(blocker)
 let blocked
 try{
  blocked=startStanding(state,world)
  assert.equal(blocked.phase,'seated');assert.equal(blocked.exitBlocked,true)
  assert.match(interactionAt({...origin(s),seated:blocked},{world}).label,/막혀/)
 }finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
 const retry=startStanding(blocked,world)
 assert.equal(retry.phase,'leaving');assert.equal(retry.exitBlocked,false)
})

test('a distant valid origin cannot pull the seated character across the room',()=>{
 const s=SEATS[0],state=finish(startSitting(origin(s),s)).seating
 state.origin={x:12,z:0,level:s.level,yaw:0}
 assert.equal(walkHeight(12,0,s.level,world),s.level)
 assert.equal(exitForSeat(state,world).x,s.entry.x)
})

test('an obstacle arriving during approach pauses without a jump and resumes when clear',()=>{
 const s=SEATS[1],from={...origin(s),x:s.entry.x+.7}
 let state=startSitting(from,s,world)
 const before=advanceSeating(state,.02,world);state=before.seating
 const blocker={floor:s.level,id:'late-approach',rect:[s.entry.x+.32,s.entry.x+.38,s.entry.z-.1,s.entry.z+.1]}
 FURNITURE.push(blocker)
 try{
  for(let i=0;i<20;i++){
   const r=advanceSeating(state,.1,world)
   assert.equal(r.seating.elapsed,state.elapsed)
   assert.equal(r.pose.x,before.pose.x);assert.equal(r.pose.y,before.pose.y)
   assert.equal(r.pose.walking,false);assert.equal(r.seating.transitionBlocked,true)
   state=r.seating
  }
  assert.equal(interactionAt({...from,seated:state},{world}).type,'wait')
 }finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
 const resumed=advanceSeating(state,1/60,world)
 assert.equal(resumed.seating.transitionBlocked,false)
 assert.ok(Math.hypot(resumed.pose.x-before.pose.x,resumed.pose.z-before.pose.z)<.05)
 assert.equal(finish(resumed.seating).seating.phase,'seated')
})

test('a newly blocked landing pauses dismount and retains recline and height',()=>{
 const s=SEATS.find(s=>s.id==='attic-daybed')
 let seated=finish(startSitting(origin(s),s)).seating
 seated.posture='lying'
 for(let i=0;i<180;i++)seated=advanceSeating(seated,1/60,world).seating
 let state=startStanding(seated,world)
 const before=advanceSeating(state,.1,world);state=before.seating
 const blocker={floor:s.level,id:'late-landing',rect:[s.entry.x-.2,s.entry.x+.2,s.entry.z-.2,s.entry.z+.2]}
 FURNITURE.push(blocker)
 try{
  const r=advanceSeating(state,10,world)
  assert.equal(r.seating.elapsed,state.elapsed)
  assert.equal(r.seating.recline,state.recline)
  assert.equal(r.pose.x,before.pose.x);assert.equal(r.pose.y,before.pose.y)
  assert.equal(r.seating.transitionBlocked,true);state=r.seating
 }finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
 const resumed=advanceSeating(state,1/60,world)
 assert.equal(resumed.seating.transitionBlocked,false)
 assert.ok(Math.abs(resumed.pose.y-before.pose.y)<.04)
 assert.equal(finish(resumed.seating).seating,null)
})

test('all seat transitions pass live floor validation without false blocking',()=>{
 for(const s of SEATS){
  let state=startSitting(origin(s),s,world)
  for(let i=0;i<Math.ceil(state.duration*60)+2;i++){
   const r=advanceSeating(state,1/60,world);state=r.seating
   assert.notEqual(state.transitionBlocked,true,s.id)
  }
  assert.equal(state.phase,'seated',s.id)
  state=startStanding(state,world)
  for(let i=0;i<200&&state;i++){
   state=advanceSeating(state,1/60,world).seating
   assert.notEqual(state?.transitionBlocked,true,s.id)
  }
  assert.equal(state,null,s.id)
 }
})

test('dismount follows a clear detour around an obstacle instead of cutting across it',()=>{
 const s=SEATS[1],from={...origin(s),x:s.entry.x+.7}
 const seated=finish(startSitting(from,s,world)).seating
 const blocker={floor:s.level,id:'exit-detour',rect:[s.entry.x+.32,s.entry.x+.38,s.entry.z-.1,s.entry.z+.1]}
 FURNITURE.push(blocker)
 try{
  let state=startStanding(seated,world),floorFrames=0,last
  assert.ok(state.floorExit?.length>2,'find a path around the divider')
  for(let i=0;i<600&&state;i++){
   const r=advanceSeating(state,1/60,world)
   if(state.phase==='floorExit'){
    floorFrames++;assert.equal(walkHeight(r.pose.x,r.pose.z,s.level,world),s.level)
    assert.ok(Math.hypot(r.pose.x-state.floorPose.x,r.pose.z-state.floorPose.z)<.02)
   }
   state=r.seating;last=r.pose
  }
  assert.equal(state,null);assert.ok(floorFrames>0)
  assert.ok(Math.hypot(last.x-from.x,last.z-from.z)<.001)
 }finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
})

test('floor exit replans a newly blocked segment without changing the current position',()=>{
 const s=SEATS[1],start={...s.entry},goal={x:start.x+.7,z:start.z}
 const floorPose={...start,y:s.level,amount:0,recline:0,rotation:0}
 let state={...startSitting(origin(s),s),phase:'floorExit',floorPose,floorExit:[start,goal],routeIndex:1,retry:0}
 const blocker={floor:s.level,id:'late-detour',rect:[start.x+.32,start.x+.38,start.z-.1,start.z+.1]}
 FURNITURE.push(blocker)
 try{
  let r=advanceSeating(state,1/60,world)
  assert.equal(r.pose.x,start.x);assert.equal(r.pose.z,start.z)
  assert.ok(r.seating.floorExit.length>2);state=r.seating
  for(let i=0;i<600&&state;i++){
   r=advanceSeating(state,1/60,world);state=r.seating
   assert.equal(walkHeight(r.pose.x,r.pose.z,s.level,world),s.level)
  }
  assert.equal(state,null);assert.ok(Math.hypot(r.pose.x-goal.x,r.pose.z-goal.z)<.001)
 }finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
})

test('standing reuses the verified direct connector instead of testing it twice',()=>{
 const s=SEATS[1],from={...origin(s),x:s.entry.x+.7}
 let accesses=0
 const measuredWorld=new Proxy(world,{get(target,key){accesses++;return target[key]}})
 assert.equal(seatGroundPathClear(s.entry,from,s.level,measuredWorld),true)
 const singleQueryAccesses=accesses
 assert.ok(singleQueryAccesses>0)
 accesses=0
 const state={...startSitting(from,s),phase:'seated'}
 const leaving=startStanding(state,measuredWorld)
 assert.equal(leaving.phase,'leaving');assert.deepEqual(leaving.origin,state.origin)
 assert.equal(accesses,singleQueryAccesses,'one direct navigation query per E press')
 accesses=0
 startStanding(state,measuredWorld)
 assert.equal(accesses,singleQueryAccesses,'later E presses revalidate the live world')
})
