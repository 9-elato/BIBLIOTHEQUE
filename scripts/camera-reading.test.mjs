import test from 'node:test'
import assert from 'node:assert/strict'
import {movementVector,facingForMovement} from '../src/cameraMovement.js'
import {atticX} from '../src/atticLayout.js'
import {SEATS,startSitting,advanceSeating,startStanding} from '../src/seating.js'
import {walkHeight} from '../src/navigation.js'
test('orbit does not change stationary facing; movement follows the camera and turns toward travel',()=>{
 assert.equal(facingForMovement(.7,0,0,1/60),.7)
 const d=movementVector(Math.PI/2,1,0)
 assert.ok(Math.abs(d.x-1)<1e-9&&Math.abs(d.z)<1e-9)
 let facing=0;for(let i=0;i<120;i++)facing=facingForMovement(facing,d.x,d.z,1/60)
 assert.ok(Math.abs(facing+Math.PI/2)<.001)
 assert.ok(Math.abs(Math.hypot(...Object.values(movementVector(0,1,1)))-1)<1e-9)
})
test('attic expands west while its stair landing remains fixed',()=>{
 assert.equal(atticX(-11.45),-11.45)
 assert.ok(atticX(-19.5)<-20.4)
})
test('daybed reclines smoothly and standing returns to a safe floor position',()=>{
 const bed=SEATS.find(s=>s.id==='attic-daybed'),world={end:45,entranceOpen:true,gateReady:true}
 let state=startSitting({...bed.entry,level:bed.level,yaw:0,bodyYaw:.8},bed),result
 for(let i=0;i<240;i++)state=advanceSeating(state,1/60).seating
 state={...state,posture:'lying'}
 for(let i=0;i<150;i++){result=advanceSeating(state,1/60);state=result.seating}
 assert.ok(Math.abs(result.pose.recline-Math.PI/2)<.001)
 state=startStanding(state,world)
 for(let i=0;i<240&&state;i++){result=advanceSeating(state,1/60);state=result.seating}
 assert.equal(state,null)
 assert.equal(walkHeight(result.pose.x,result.pose.z,bed.level,world),bed.level)
})
