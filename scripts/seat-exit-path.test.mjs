import test from 'node:test'
import assert from 'node:assert/strict'
import {findSeatExitPath} from '../src/seatExitPath.js'
test('bounded seat search rejects sealed, distant and invalid landings',()=>{
 assert.equal(findSeatExitPath({x:0,z:0},{x:2,z:0},()=>true),null)
 let calls=0
 assert.equal(findSeatExitPath({x:0,z:0},{x:.8,z:0},(a,b)=>{calls++;return a.x===b.x&&a.z===b.z}),null)
 assert.ok(calls<700,'search stays bounded')
 assert.equal(findSeatExitPath({x:0,z:0},{x:.8,z:0},()=>false),null)
})
