import test from 'node:test'
import assert from 'node:assert/strict'
import {steerSpirit,spiritClearance} from '../src/spiritAvoidance.js'
test('spirit turns away before crossing a visitor, including coincident positions',()=>{
 for(const s of [{x:.9,z:0,level:0},{x:0,z:0,level:0}]){
  const p={x:0,z:0,level:0},v=steerSpirit(s,[-4,0],p,1/60)
  assert.ok(Number.isFinite(v.x)&&Number.isFinite(v.z))
  assert.ok(v.x>0)
 }
 assert.equal(spiritClearance({x:.5,z:0,level:0},{x:0,z:0,level:0}),false)
 assert.equal(spiritClearance({x:.5,z:0,level:7.2},{x:0,z:0,level:0}),true)
})
test('a visitor on another floor does not change the route',()=>{
 const s={x:0,z:0,level:7.2}
 assert.deepEqual(steerSpirit(s,[4,0],{x:0,z:0,level:0},.016),steerSpirit(s,[4,0],null,.016))
})
