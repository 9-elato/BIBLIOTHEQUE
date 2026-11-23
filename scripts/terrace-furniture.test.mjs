import test from 'node:test'
import assert from 'node:assert/strict'
import {movePlayer,walkHeight} from '../src/navigation.js'
import {atticX} from '../src/atticLayout.js'
import {TERRACE_FURNITURE} from '../src/terraceFurniture.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('cozy terrace keeps the doorway and central sky-view aisle clear',()=>{
 let p={x:atticX(-12.8),z:6.9,level:10.6}
 for(const [x,z] of [[-13.2,8],[-14.1,9.5],[-13.2,8],[-12.8,6.9]]){
  const target={x:atticX(x),z}
  p=movePlayer(p,target.x-p.x,target.z-p.z,world)
  assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.01)
 }
 for(const {rect:[l,r,b,f],id} of TERRACE_FURNITURE){
  assert.equal(walkHeight(atticX((l+r)/2),(b+f)/2,10.6,world),null,id)
 }
})
