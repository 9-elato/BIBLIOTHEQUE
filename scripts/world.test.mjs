import test from 'node:test'
import assert from 'node:assert/strict'
import {interactionAt} from '../src/interactions.js'
import {makeStacks, canWalk, ROOM_SPOTS} from '../src/layout.js'

test('door can be operated from both sides, but never sweeps through the visitor',()=>{
 for(const z of [9.5,13])for(const entranceOpen of [false,true])
  assert.equal(interactionAt({x:0,z,level:0},{entranceOpen}).type,'door')
 assert.equal(interactionAt({x:0,z:11,level:0},{entranceOpen:true}),null)
 assert.equal(interactionAt({x:1,z:11,level:0},{entranceOpen:false}),null)
 assert.equal(interactionAt({x:0,z:11,level:0},{entranceOpen:false}).type,'door')
})

test('standing and nearby objects take precedence over a held book',()=>{
  assert.equal(interactionAt({x:0,z:12,level:0,seated:true},{heldBook:'b1'}).type,'stand')
  assert.equal(interactionAt({x:0,z:12,level:0},{heldBook:'b1'}).type,'door')
  assert.equal(interactionAt({x:0,z:0,level:0},{heldBook:'b1'}).type,'read')
  assert.equal(interactionAt({x:0,z:0,level:0},{}),null)
})
test('opened secret gate no longer offers key collection',()=>{
  assert.equal(interactionAt({x:0,z:-12,level:0},{gateReady:false}).type,'key')
  assert.equal(interactionAt({x:0,z:-12,level:0},{gateReady:true}),null)
})
test('shelf growth preserves all books and extends walkable space',()=>{
  const books=Array.from({length:49},(_,id)=>({id,category:'소설'}))
  const empty=makeStacks([]), full=makeStacks(books)
  assert.equal(full.sections[0].cases.length,4)
  assert.equal(full.sections[0].cases.flatMap(c=>c.books).length,49)
  assert.ok(full.end>empty.end)
  assert.equal(canWalk(full.end-1.1,0,{end:full.end}),true)
  assert.equal(canWalk(full.end-.5,0,{end:full.end}),true)
  assert.equal(canWalk(full.end+.5,0,{end:full.end}),true)
})
test('closed entrance prevents walking through the door',()=>{
  assert.equal(canWalk(0,12,{end:45,entranceOpen:false}),false)
  assert.equal(canWalk(0,12,{end:45,entranceOpen:true}),true)
})
