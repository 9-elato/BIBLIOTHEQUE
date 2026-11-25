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

test('cafe overhanging counter and cinema screen block the avatar while the doorway stays open',()=>{
 assert.equal(walkHeight(-19.4,18,0,world),null)
 assert.equal(walkHeight(-26,24.62,0,world),null)
 assert.equal(walkHeight(-16,22.25,0,world),0)
 let p={x:-20.8,z:25.5,level:0,yaw:0}
 for(const [x,z] of [[-20.8,22.25],[-11,22.25]]){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.03)}
})

import {withCafePoster,posterSource,importPoster} from '../src/cafePoster.js'
test('poster defaults preserve bookkeeper choices and reject unsafe image sources',async()=>{
 const config={filmTitle:'다음 상영작 준비 중',filmPoster:'',startTime:'21:00'}
 const shown=withCafePoster(config)
 assert.equal(shown.filmTitle,'Call Me by Your Name')
 assert.ok(shown.filmPoster.endsWith('/posters/call-me-by-your-name.webp'))
 assert.equal(config.filmPoster,'');assert.equal(shown.startTime,'21:00')
 const custom={...config,filmTitle:'Chosen film'};assert.equal(withCafePoster(custom),custom)
 assert.equal(posterSource('javascript:alert(1)'),'')
 assert.equal(posterSource('data:image/svg+xml;base64,AAAA'),'')
 assert.equal(posterSource('data:image/jpeg;base64,AAAA'),'data:image/jpeg;base64,AAAA')
 await assert.rejects(importPoster({type:'image/svg+xml',size:100}))
 await assert.rejects(importPoster({type:'image/jpeg',size:11*1024*1024}))
})
test('cinema partition blocks both wings but retains the dedicated doorway',()=>{
 assert.equal(walkHeight(-18,24.2,0,world),null)
 assert.equal(walkHeight(-26,24.2,0,world),null)
 assert.equal(walkHeight(-20.8,24.2,0,world),0)
})
