import test from 'node:test'
import assert from 'node:assert/strict'
import {SPRING_BATH as bath,SPRING_POOL as pool,BASEMENT_HEIGHT as H,cutFloor,BASEMENT_BOUNDS} from '../src/basementLayout.js'
import {startSitting,advanceSeating,startStanding} from '../src/seating.js'
import {interactionAt} from '../src/interactions.js'
import {walkHeight,FURNITURE} from '../src/navigation.js'
const world={end:45,entranceOpen:true,gateReady:true}
test('half bath steps above the rim before lowering and returns to a dry exit',()=>{
 const origin={...bath.entry,level:H,yaw:0}
 assert.match(interactionAt(origin,{world}).label,/반신욕/)
 assert.equal(walkHeight(bath.entry.x,bath.entry.z,H,world),H)
 let state=startSitting(origin,bath,world),previous={...origin,y:H},pose
 const step=()=>{const result=advanceSeating(state,1/60,world);state=result.seating;pose=result.pose;assert.ok(Math.hypot(pose.x-previous.x,pose.y-previous.y,pose.z-previous.z)<.09);if(pose.x>pool.x+pool.rx-.25&&pose.x<pool.x+pool.rx+.4)assert.ok(pose.y>=H+.3,'feet clear stone rim');previous=pose}
 for(let i=0;i<200;i++)step()
 assert.equal(state.phase,'seated');assert.ok(Math.abs(pose.y-(H+bath.height))<1e-8)
 assert.ok(pose.y<H+.13&&pose.y+1.65>H+.13,'body partially submerged, head above water')
 assert.match(interactionAt({...origin,seated:state},{world}).label,/나오기/)
 state=startStanding(state,world)
 for(let i=0;i<220&&state;i++)step()
 assert.equal(state,null);assert.equal(walkHeight(pose.x,pose.z,H,world),H)
})
test('blocked bath exit remains in the water rather than emerging into furniture',()=>{
 const origin={...bath.entry,level:H,yaw:0}
 let state=startSitting(origin,bath,world)
 for(let i=0;i<200;i++)state=advanceSeating(state,1/60,world).seating
 const blocker={floor:H,id:'bath-exit-test',rect:[25.0,25.7,7.7,9.5]};FURNITURE.push(blocker)
 try{const next=startStanding(state,world);assert.equal(next.exitBlocked,true);assert.equal(next.phase,'seated')}finally{FURNITURE.splice(FURNITURE.indexOf(blocker),1)}
 assert.equal(startStanding(state,world).phase,'leaving')
})
test('submerged bath has no dry floor slab cutting through it',()=>{
 const hole=[pool.x-pool.rx,pool.x+pool.rx,pool.z-pool.rz,pool.z+pool.rz]
 for(const [l,r,b,f] of cutFloor(BASEMENT_BOUNDS,hole))assert.ok(r<=hole[0]||l>=hole[1]||f<=hole[2]||b>=hole[3])
})
