import test from 'node:test'
import assert from 'node:assert/strict'
import {advanceGuardedDoor,entranceDoorBlocks,verandaDoorBlocks,toggleVerandaDoor} from '../src/doorMotion.js'
import {advanceStudyDoor,studyDoorBlocks} from '../src/studyLayout.js'
import {movePlayer} from '../src/navigation.js'

test('study closing reverses for a late visitor without crossing their body',()=>{
 const door={open:false,amount:1,swing:-1},player={x:.5,z:-19.7,level:0}
 assert.equal(studyDoorBlocks(player.x,player.z,door),false)
 advanceStudyDoor(door,1,player)
 assert.equal(door.open,true);assert.equal(door.amount,1)
})
test('sliding veranda door cannot close through a visitor even over a long frame',()=>{
 const door={open:true,amount:1},player={x:-10.2,z:-6.7,level:0}
 assert.equal(toggleVerandaDoor(door,player),false)
 door.open=false;advanceGuardedDoor(door,1,player,verandaDoorBlocks)
 assert.equal(door.open,true);assert.equal(door.amount,1)
})
test('entrance uses its current leaf position, not just an open flag',()=>{
 const door={open:true,amount:0},world={end:45,entranceOpen:true,entranceDoor:door}
 let p={x:0,z:13,level:0}
 const stopped=movePlayer(p,0,-3,world)
 assert.ok(stopped.z>11.66)
 advanceGuardedDoor(door,1,p,entranceDoorBlocks)
 assert.equal(door.amount,1)
 const entered=movePlayer(p,0,-3,world)
 assert.ok(Math.abs(entered.z-10)<.01)
})
test('entrance reopens when someone enters its closing arc',()=>{
 const door={open:false,amount:1},player={x:.5,z:11.2,level:0}
 assert.equal(entranceDoorBlocks(player.x,player.z,door),false)
 advanceGuardedDoor(door,1,player,entranceDoorBlocks)
 assert.equal(door.open,true);assert.equal(door.amount,1)
})
test('doors ignore a visitor on another floor and complete without drift',()=>{
 for(const blocks of [entranceDoorBlocks,verandaDoorBlocks]){
  const door={open:false,amount:1}
  advanceGuardedDoor(door,1,{x:0,z:11.66,level:7.2},blocks)
  assert.equal(door.amount,0)
 }
})
