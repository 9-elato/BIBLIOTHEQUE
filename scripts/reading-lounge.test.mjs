import test from 'node:test'
import assert from 'node:assert/strict'
import {movePlayer} from '../src/navigation.js'
import {SEATS,nearbySeat} from '../src/seating.js'
import {READING_SOFA_SEATS} from '../src/readingLoungeLayout.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('central reading sofa seats are reachable through the open west side',()=>{
 for(const item of READING_SOFA_SEATS){
  const seat=SEATS.find(s=>s.id===item.id);let p={x:8.3,z:0,level:7.2}
  for(const [x,z] of [[9.2,0],[9.2,seat.entry.z],[seat.entry.x,seat.entry.z]]){
   p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.02,item.id)
  }
  assert.equal(nearbySeat(p,world)?.id,item.id)
 }
})
