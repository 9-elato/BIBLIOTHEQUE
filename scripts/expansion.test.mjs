import test from 'node:test'
import assert from 'node:assert/strict'
import {makeLadders,toggleLadder,advanceLadders,ladderBlocks} from '../src/ladderSystem.js'
import {makeStacks,ROOM_SPOTS} from '../src/layout.js'
import {movePlayer,walkHeight,GALLERY_HEIGHT} from '../src/navigation.js'
import {boardResult,playBoard} from '../src/boardGame.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('rail ladder reaches both stops, stops for a visitor and blocks walking',()=>{
 const [l]=makeLadders(makeStacks([]));toggleLadder(l)
 for(let i=0;i<100;i++)advanceLadders([l],.1,{x:0,z:0,level:0})
 assert.equal(l.x,l.max);assert.equal(l.moving,false);assert.equal(l.climb.enabled,false)
 toggleLadder(l);for(let i=0;i<100;i++)advanceLadders([l],.1,{x:0,z:0,level:0})
 assert.equal(l.x,l.min)
 toggleLadder(l);advanceLadders([l],.1,{x:l.x+.4,z:l.z,level:0})
 assert.equal(l.moving,false);assert.ok(ladderBlocks(l,l.x,l.z))
 assert.equal(walkHeight(l.x,l.z,0,{...world,ladders:[l]}),null)
 assert.equal(interactionAt({x:l.x,z:l.z+1.2,level:0},{world:{...world,ladders:[l]}}).type,'ladder')
})
test('greenhouse connects to the north gallery and has safe floor edges',()=>{
 let p={x:-6.35,z:-5.7,level:GALLERY_HEIGHT}
 for(const [x,z] of [[0,-5.7],[0,-8.5],[0,-11.9],[1.9,-11.9],[1.9,-8.5],[0,-8.5],[0,-5.7]]){
  p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.01)
 }
 assert.equal(walkHeight(8.5,-14,GALLERY_HEIGHT,world),null)
 assert.equal(walkHeight(0,-14.2,GALLERY_HEIGHT,world),null)
 const [x,z,level]=ROOM_SPOTS.greenhouse;assert.equal(walkHeight(x,z,level,world),GALLERY_HEIGHT)
})
test('board game blocks winning threats and never plays after game end',()=>{
 const b=['star','star',null,null,'moon',null,null,null,null]
 const n=playBoard(b,6);assert.equal(n[2],'moon')
 const won=['star','star','star','moon','moon',null,null,null,null]
 assert.equal(boardResult(won),'star');assert.equal(playBoard(won,5),won)
 const first=playBoard(Array(9).fill(null),0);assert.equal(first.filter(Boolean).length,2)
 assert.equal(playBoard(first,0),first)
 assert.equal(boardResult(['star','moon','star','star','moon','moon','moon','star','star']),'draw')
})
