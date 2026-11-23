import test from 'node:test'
import assert from 'node:assert/strict'
import {makeLadders,boardLadder,advanceRider} from '../src/ladderSystem.js'
import {makeStacks} from '../src/layout.js'
import {movePlayer,walkHeight} from '../src/navigation.js'
test('rider climbs, travels along rail, descends and waits for a blocked landing',()=>{
 const [l]=makeLadders(makeStacks([])),world={end:45,ladders:[l],gateReady:true,entranceOpen:true}
 const p={x:l.x,z:l.z+1.2,level:0},clear=(x,z)=>walkHeight(x,z,0,world)===0
 assert.equal(boardLadder(p,l,clear),true)
 for(let i=0;i<200;i++)advanceRider(p,.05,1,1,clear)
 assert.equal(p.level,6.3);assert.equal(l.x,l.max);assert.equal(p.x,l.x)
 p.ladder.phase='descending'
 for(let i=0;i<200;i++)advanceRider(p,.05,0,0,()=>false)
 assert.ok(p.ladder.blocked);assert.equal(p.level,0)
 advanceRider(p,.05,0,0,clear);assert.equal(p.ladder,null);assert.equal(clear(p.x,p.z),true)
})
test('blocked or distant boarding is refused without moving the character',()=>{
 const [l]=makeLadders(makeStacks([])),p={x:l.x,z:l.z+1.2,level:0}
 assert.equal(boardLadder(p,l,()=>true,()=>false),false)
 assert.equal(p.ladder,undefined)
 assert.equal(boardLadder({...p,x:p.x+4},l,()=>true),false)
})
test('T gallery reaches both arms and the centered east meadow arch without crossing shelves',()=>{
 for(const end of [43.1,50]){
  const world={end,entranceOpen:true,gateReady:true}
  for(const target of [[end+3,-10],[end+3,10],[end+11,0],[end+11,-9]]){
   let p={x:end-2,z:0,level:0}
   p=movePlayer(p,5,0,world)
   if(target[0]>end+8)p=movePlayer(p,target[0]-p.x,0,world)
   p=movePlayer(p,target[0]-p.x,target[1]-p.z,world)
   assert.ok(Math.hypot(p.x-target[0],p.z-target[1])<.01)
  }
  assert.equal(walkHeight(end+8,6,0,world),null)
  assert.equal(walkHeight(end+7.5,9,0,world),null)
 }
})
