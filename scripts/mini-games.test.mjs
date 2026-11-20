import test from 'node:test'
import assert from 'node:assert/strict'
import {cipherFeedback,swapBooks,ordered,shuffled,HERBS,GAME_SPOTS} from '../src/miniGames.js'
import {advanceGate,gatePose,GATE_SECONDS} from '../src/secretGate.js'
import {interactionAt} from '../src/interactions.js'
import {walkHeight} from '../src/navigation.js'

test('memory deck keeps all four pairs and shelf swap can solve the puzzle',()=>{
 assert.deepEqual(shuffled([...HERBS,...HERBS]).sort(),[...HERBS,...HERBS].sort())
 assert.equal(ordered(swapBooks([2,1,3,4,5],0,1)),true)
 assert.equal(ordered([4,2,5,1,3]),false)
})
test('cipher handles exact, displaced, repeated and invalid guesses',()=>{
 assert.deepEqual(cipherFeedback('123','123'),{exact:3,near:0,won:true})
 assert.deepEqual(cipherFeedback('312','123'),{exact:0,near:3,won:false})
 assert.deepEqual(cipherFeedback('111','123'),{exact:1,near:0,won:false})
 assert.ok(cipherFeedback('12','123').error)
})
test('secret bookcase opens on time at low and high frame rates and closes fully',()=>{
 for(const fps of [10,30,60,144]){
  let progress=0
  for(let i=0;i<Math.ceil(GATE_SECONDS*fps)+1;i++)progress=advanceGate(progress,true,1/fps)
  assert.equal(progress,1)
  assert.equal(gatePose(progress,1).x,1.53)
  assert.equal(advanceGate(progress,false,GATE_SECONDS),0)
 }
})
test('each new game has a walkable approach with its own E hint',()=>{
 const world={end:45,gateReady:true,entranceOpen:true,studyDoor:{open:true,amount:1}}
 for(const g of GAME_SPOTS){
  let found=false
  for(let x=g.x-1.5;x<=g.x+1.5;x+=.25)for(let z=g.z-1.5;z<=g.z+1.5;z+=.25){
   if(walkHeight(x,z,g.level,world)===null)continue
   const action=interactionAt({x,z,level:g.level},{world,gateReady:true,entranceOpen:true})
   if(action?.type==='minigame'&&action.game===g.id)found=true
  }
  assert.ok(found,g.id+' must be reachable')
 }
})
test('opening bookcase gives feedback without retriggering the key',()=>{
 assert.equal(interactionAt({x:0,z:-12.7,level:0},{gateReady:false,gateOpening:true})?.type,'wait')
})
test('blanket can be reached without entering furniture and door hint reaches safe approach',()=>{
 const world={end:45,gateReady:true,entranceOpen:true,studyDoor:{open:false,amount:0}}
 assert.notEqual(walkHeight(-16,-1.8,0,world),null)
 assert.equal(interactionAt({x:-16,z:-1.8,level:0},{world})?.type,'blanket')
 assert.equal(interactionAt({x:0,z:-16.2,level:0},{world})?.type,'studyDoor')
})
