import test from 'node:test'
import assert from 'node:assert/strict'
import {BASEMENT_HEIGHT as H,BASEMENT_OPENING,BASEMENT_PORTAL,BASEMENT_CEILING,SPRING_CURBS,SPRING_POOL,cutFloor} from '../src/basementLayout.js'
import {movePlayer,walkHeight,floorName} from '../src/navigation.js'
import {SEATS} from '../src/seating.js'
const world={end:45,entranceOpen:true,gateReady:true}
test('basement is reached by a continuous stair and returns to the hall',()=>{
 let p={x:3,z:-4.8,level:0}
 p=movePlayer(p,10.5,0,world);assert.ok(Math.abs(p.x-13.5)<.01);assert.equal(p.level,H)
 for(const [x,z] of [[14,-2],[16,-2],[16,0],[19,0],[22,0]]){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.02)}
 assert.equal(floorName(p.x,p.z,p.level),'숲 온천')
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

test('forest spring dry promenade loops around pool without entering water or garden edges',()=>{
 assert.ok(SPRING_POOL.rx*SPRING_POOL.rz>=2*2.45*3.35)
 let p={x:19,z:0,level:H}
 const route=[[18.7,0],[18.7,17.3],[25.45,17.3],[25.45,.2],[19,.2],[19,0]]
 for(const [x,z] of route){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.03,`spring promenade blocked at ${x},${z}`)}
 for(const [x,z] of [[22,5],[22,8],[22,15.5],[22,18.5],[26.2,9]])assert.equal(walkHeight(x,z,H,world),null)
 const towardWater=movePlayer({x:18.7,z:5,level:H},5,0,world);assert.ok(towardWater.x<19.3)
})

test('stairwell lining blocks underground shortcuts while its landing remains open',()=>{
 for(const z of [-5.74,-3.86])assert.equal(walkHeight(11,z,H,world),null)
 let p={x:13.6,z:-4.8,level:H};p=movePlayer(p,0,2.5,world);assert.ok(Math.abs(p.z+2.3)<.01)
 assert.ok(BASEMENT_PORTAL.clearHeight>=4.65)
 assert.ok(H+BASEMENT_PORTAL.clearHeight<BASEMENT_CEILING)
})
test('spring curb collision matches the visible stone boundary and leaves the loop clear',()=>{
 for(const curb of SPRING_CURBS){const [l,r,b,f]=curb.rect;assert.equal(walkHeight((l+r)/2,(b+f)/2,H,world),null)}
 const p=movePlayer({x:22,z:17.3,level:H},0,3,world);assert.ok(p.z<18.12)
 for(const [x,z] of [[18.7,17.3],[25.45,17.3]])assert.equal(walkHeight(x,z,H,world),H)
})
