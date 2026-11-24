import {interactionAt} from '../src/interactions.js'
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
 assert.ok(p.ladder.blocked);assert.equal(p.level,6.3)
 for(let i=0;i<200&&p.ladder;i++)advanceRider(p,.05,0,0,clear);assert.equal(p.ladder,null);assert.equal(clear(p.x,p.z),true)
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
  for(const target of [[end+5,-10],[end+5,10],[end+15,0],[end+15,-9]]){
   let p={x:end-2,z:0,level:0}
   p=movePlayer(p,7,0,world)
   if(target[0]>end+12)p=movePlayer(p,target[0]-p.x,0,world)
   p=movePlayer(p,target[0]-p.x,target[1]-p.z,world)
   assert.ok(Math.hypot(p.x-target[0],p.z-target[1])<.01)
  }
  assert.equal(walkHeight(end+12,6,0,world),null)
  assert.equal(walkHeight(end+11.5,9,0,world),null)
 }
})


test('ladder boarding pauses before a newly blocked floor segment and resumes without snapping',()=>{
 const l={x:5,z:0,min:4,max:8,climb:{maxHeight:6.3}},p={x:4,z:1.2,level:0}
 assert.equal(boardLadder(p,l,()=>true),true)
 advanceRider(p,.05,0,0,()=>true)
 const before={x:p.x,z:p.z,progress:p.ladder.progress}
 let probes=0
 const blocked=x=>{probes++;return x<4.09||x>4.14}
 assert.ok(blocked(p.x)&&blocked(4.15625),'both ends of the next step are clear')
 for(let i=0;i<5;i++)advanceRider(p,.05,0,0,blocked)
 assert.equal(p.x,before.x);assert.equal(p.z,before.z)
 assert.equal(p.ladder.progress,before.progress);assert.equal(p.ladder.blocked,true)
 const action=interactionAt(p,{world:{}});assert.equal(action.type,'ladderExit');assert.match(action.label,/탑승 경로.*E 취소/)
 assert.ok(probes<30,'boarding checks remain bounded to its short floor segment')
 advanceRider(p,.05,0,0,()=>true)
 assert.equal(p.ladder.blocked,false);assert.ok(p.x>before.x&&p.x<4.2)
 for(let i=0;i<20&&p.ladder.phase==='boarding';i++)advanceRider(p,.05,0,0,()=>true)
 assert.equal(p.ladder.phase,'climbing');assert.equal(p.x,5);assert.equal(p.z,1.2)
})
test('E during ladder boarding cancels in place instead of snapping to the entry',()=>{
 const l={x:5,z:0,min:4,max:8,climb:{maxHeight:6.3}},p={x:4,z:1.2,level:0}
 boardLadder(p,l,()=>true)
 advanceRider(p,.05,0,0,()=>true)
 const before={x:p.x,z:p.z,level:p.level}
 const action=interactionAt(p,{world:{}});assert.equal(action.type,'ladderExit')
 p.ladder.phase='descending'
 advanceRider(p,.05,0,0,()=>true)
 assert.equal(p.ladder,null);assert.equal(l.occupied,false)
 assert.deepEqual({x:p.x,z:p.z,level:p.level},before)
})

test('manual descent waits above a blocked landing and resumes gradually',()=>{
 const l={x:5,z:0,min:4,max:8,climb:{maxHeight:6.3}},p={x:5,z:1.2,level:0}
 boardLadder(p,l,()=>true)
 for(let i=0;i<40;i++)advanceRider(p,.05,1,0,()=>true)
 const height=p.level
 for(let i=0;i<10;i++)advanceRider(p,.05,-1,0,()=>false)
 assert.equal(p.level,height);assert.equal(p.ladder.blocked,true)
 advanceRider(p,.05,-1,0,()=>true)
 assert.ok(p.level<height&&p.level>height-.07)
})
