import test from 'node:test'
import assert from 'node:assert/strict'
import {BASEMENT_HEIGHT as H,BASEMENT_OPENING,cutFloor} from '../src/basementLayout.js'
import {movePlayer,walkHeight,floorName} from '../src/navigation.js'
import {SEATS} from '../src/seating.js'
const world={end:45,entranceOpen:true,gateReady:true}
test('basement is reached by a continuous stair and returns to the hall',()=>{
 let p={x:3,z:-4.8,level:0}
 p=movePlayer(p,10.5,0,world);assert.ok(Math.abs(p.x-13.5)<.01);assert.equal(p.level,H)
 for(const [x,z] of [[14,-2],[16,-2],[16,0],[19,0],[22,0]]){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.02)}
 assert.equal(floorName(p.x,p.z,p.level),'숲 전망 욕실')
 for(const [x,z] of [[19,0],[16,0],[16,-2],[14,-2],[13.5,-4.8],[3,-4.8]]){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.02)}
 assert.equal(p.level,0)
})
test('slabs leave the stair aperture open, upper floor above it stays walkable',()=>{
 for(const bounds of [[-7.5,7.5,-6.9,7.2],[7.15,45,-5.825,5.825]]){
  const pieces=cutFloor(bounds),[l,r,b,f]=BASEMENT_OPENING
  for(const [a,c,d,e] of pieces)assert.ok(c<=l||a>=r||e<=b||d>=f)
 }
 assert.equal(walkHeight(6.5,-5.9,7.2,world),7.2)
})
test('basement seating has clear approaches and bath cannot be walked through',()=>{
 for(const seat of SEATS.filter(s=>s.id.startsWith('basement-')))assert.equal(walkHeight(seat.entry.x,seat.entry.z,H,world),H)
 assert.equal(walkHeight(22,3,H,world),null)
 assert.equal(walkHeight(18,3,H,world),null)
 assert.equal(walkHeight(18,0,H,world),H)
 assert.equal(walkHeight(22,7,H,world),null)
})
