import test from 'node:test'
import assert from 'node:assert/strict'
import {CAFE_SCALE,cinemaZ,CAFE_STAIR,cafeX,cafeZ,cinemaCurtain} from '../src/cafeExpansion.js'
import {representativeDisplays} from '../src/cafeDisplays.js'
import {movePlayer,walkHeight,stairPoint} from '../src/navigation.js'
import {SEATS} from '../src/seating.js'
import {findClickPath} from '../src/clickNavigation.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('four genre displays each contain eight unique representative books',()=>{
 const groups=representativeDisplays([])
 assert.equal(groups.length,4)
 for(const group of groups){assert.equal(group.books.length,8);assert.equal(new Set(group.books.map(b=>b.title)).size,8)}
 assert.ok(Math.abs(CAFE_SCALE-2.2/1.5/Math.sqrt(2))<1e-9)
})
test('cafe stair reaches the upper lobby continuously and returns to ground',()=>{
 assert.ok(findClickPath({x:cafeX(-20.8),z:22.25,level:0},{x:CAFE_STAIR.from[0],z:CAFE_STAIR.from[2]+.5,level:0},world),'entrance aisle reaches stair approach')
 let p={x:CAFE_STAIR.from[0],z:CAFE_STAIR.from[2],level:0}
 for(const direction of [1,-1])for(let i=1;i<=400;i++){
  const t=direction===1?i/400:1-i/400,q=stairPoint(CAFE_STAIR,t)
  p=movePlayer(p,q[0]-p.x,q[2]-p.z,world)
  assert.ok(Math.abs(p.level-7.2*t)<.03,JSON.stringify({t,p}))
 }
})
test('curtain blocks closed entrance and all five private seats connect to lobby when open',()=>{
 const seats=SEATS.filter(s=>s.id.startsWith('cinema-recliner-'))
 assert.equal(seats.length,5)
 assert.equal(walkHeight(cafeX(-23),cafeZ(cinemaZ(38.85)),0,world),null)
 cinemaCurtain.clear=true
 try{
  const start={x:cafeX(-23),z:cafeZ(cinemaZ(37.5)),level:0}
  for(const seat of seats){assert.ok(findClickPath(start,{...seat.entry,level:seat.level},world),seat.id)}
 }finally{cinemaCurtain.clear=false}
})
