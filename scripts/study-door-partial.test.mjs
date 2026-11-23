import test from 'node:test'
import assert from 'node:assert/strict'
import {toggleStudyDoor,advanceStudyDoor,studyDoorBlocks} from '../src/studyLayout.js'

test('partly open study door can close when visitor stands outside its remaining sweep',()=>{
 const door={open:true,amount:.3,swing:-1},player={x:.9,z:-19.8,level:0}
 assert.equal(studyDoorBlocks(player.x,player.z,door),false)
 assert.equal(studyDoorBlocks(player.x,player.z,{...door,amount:.8}),true,'unused far sweep intersects the visitor')
 assert.equal(toggleStudyDoor(door,player),true,'only the current-to-closed path matters')
 for(let i=0;i<20;i++){
  advanceStudyDoor(door,.02,player)
  assert.equal(studyDoorBlocks(player.x,player.z,door),false)
 }
 assert.equal(door.amount,0)
})

test('partial study door still refuses a visitor within the actual closing sweep',()=>{
 const door={open:true,amount:.7,swing:-1},player={x:.55,z:-19.4,level:0}
 assert.equal(toggleStudyDoor(door,player),false)
 assert.equal(door.open,true)
})

test('study toggle and animation consistently ignore visitors on another floor',()=>{
 const door={open:true,amount:1,swing:-1},player={x:0,z:-19,level:7.2}
 assert.equal(toggleStudyDoor(door,player),true)
 advanceStudyDoor(door,1,player)
 assert.equal(door.amount,0)
})

test('closing study door can reverse to opening without rescanning the already cleared arc',()=>{
 const door={open:false,amount:.7,swing:-1},player={x:.5,z:-19.1,level:0}
 assert.equal(studyDoorBlocks(player.x,player.z,door),false)
 assert.equal(studyDoorBlocks(player.x,player.z,{...door,amount:.1}),true)
 assert.equal(toggleStudyDoor(door,player),true)
 assert.equal(door.swing,-1,'mid-animation reversal preserves the hinge direction')
 for(let i=0;i<20;i++){
  advanceStudyDoor(door,.02,player)
  assert.equal(studyDoorBlocks(player.x,player.z,door),false)
 }
 assert.equal(door.amount,1)
})

test('a visitor overlapping the current study panel blocks either toggle direction',()=>{
 const player={x:1.32-.66*Math.cos(.4*Math.PI/2),z:-19-.66*Math.sin(.4*Math.PI/2),level:0}
 for(const open of [false,true]){
  const door={open,amount:.4,swing:-1}
  assert.equal(studyDoorBlocks(player.x,player.z,door),true)
  assert.equal(toggleStudyDoor(door,player),false)
  assert.equal(door.open,open)
  assert.equal(door.amount,.4)
 }
})
