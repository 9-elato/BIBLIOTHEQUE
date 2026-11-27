import test from 'node:test'
import assert from 'node:assert/strict'
import {CAFE_SCALE,cafeX,cafeZ} from '../src/cafeExpansion.js'
import {CAFE_LOCAL_SEATS,CAFE_DISPLAY_Z} from '../src/cafeLayout.js'
import {SEATS} from '../src/seating.js'
import {findClickPath,clearClickSegment} from '../src/clickNavigation.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('cafe footprint is half-sized and all seating is beyond the display zone',()=>{
 assert.ok(Math.abs((CAFE_SCALE/(2.2/1.5))**2-.5)<1e-9)
 for(const [x,z] of CAFE_LOCAL_SEATS){
  assert.ok(z-.7>Math.max(...CAFE_DISPLAY_Z)+.35)
  assert.ok((z-.7-16.3)*CAFE_SCALE>6,'goods and seating have a separate circulation zone')
 }
})
test('all relocated cafe seats remain connected to the entrance',()=>{
 const start={x:cafeX(-18.2),z:cafeZ(22.25),level:0}
 for(const seat of SEATS.filter(s=>s.id.startsWith('cafe-seat-'))){
  const path=findClickPath(start,{...seat.entry,level:0},world)
  assert.ok(path,seat.id)
  let previous=start
  for(const next of path){assert.ok(clearClickSegment(previous,next,world),seat.id);previous=next}
 }
})
