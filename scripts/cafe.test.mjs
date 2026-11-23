import test from 'node:test'
import assert from 'node:assert/strict'
import {isScreeningDate,screeningDates,validCafeTime} from '../src/cafeData.js'
import {movePlayer,walkHeight} from '../src/navigation.js'
import {zoneAt} from '../src/layout.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('Thursday screening uses the whole date divisible by three',()=>{
 assert.ok(isScreeningDate(2026,11,12));assert.equal(isScreeningDate(2026,11,19),false);assert.equal(isScreeningDate(2026,11,15),false)
 const dates=screeningDates(new Date('2026-11-01T00:00:00Z'));assert.equal(dates[0],'2026-11-12');assert.equal(dates.length,6)
 for(const date of dates){const [y,m,d]=date.split('-').map(Number);assert.ok(isScreeningDate(y,m,d))}
 assert.equal(screeningDates(new Date('2026-11-11T15:00:00Z'))[0],'2026-11-12')
 assert.ok(validCafeTime(''));assert.ok(validCafeTime('20:30'));assert.equal(validCafeTime('17:30'),false)
})
test('garden connects to cafe and cinema via clear door and aisle',()=>{
 let p={x:-11,z:22.25,level:0,yaw:0}
 for(const [x,z] of [[-18,22.25],[-20.8,22.25],[-20.8,25.5],[-25,25.5]]){
  p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.03,JSON.stringify(p))
 }
 assert.equal(zoneAt(p.x,p.z,45),'북카페 미니 극장')
 assert.equal(walkHeight(-30,20,0,world),null);assert.equal(walkHeight(-18,18,0,world),null)
})
