import test from 'node:test'
import assert from 'node:assert/strict'
import {stampVisit,readVisits,localDateKey,activityCounts} from '../src/activityRecords.js'
import {movePlayer,walkHeight} from '../src/navigation.js'
import {SEATS,nearbySeat} from '../src/seating.js'
test('attendance is idempotent per local day and survives reload',()=>{
 const day=localDateKey(new Date(2026,10,25,0,1)),days=stampVisit([],day)
 assert.equal(day,'2026-11-25');assert.equal(stampVisit(days,day),days)
 assert.deepEqual(readVisits({getItem:()=>JSON.stringify(days)}),days)
 assert.equal(stampVisit(days,'2026-11-26').length,2)
 assert.throws(()=>readVisits({getItem:()=>'{invalid'}))
 assert.throws(()=>readVisits({getItem:()=>JSON.stringify([1])}))
})
test('library ledgers use existing book status instead of duplicating books',()=>{
 assert.deepEqual(activityCounts([{status:'완독'},{status:'읽고 싶음'},{status:'읽는 중'}]),{registered:1,orders:1,reading:1})
})
test('forest sofa can be reached from the stacks entrance and has two valid seats',()=>{
 const world={end:45,gateReady:true,entranceOpen:true}
 for(const seat of SEATS.filter(s=>s.id.startsWith('forest-'))){
  let p={x:8.4,z:0,level:0}
  for(const [x,z] of [[8.9,0],[8.9,2.9],[seat.entry.x,seat.entry.z]]){
   p=movePlayer(p,x-p.x,z-p.z,world)
   assert.ok(Math.hypot(p.x-x,p.z-z)<.02)
  }
  assert.equal(nearbySeat(p,world)?.id,seat.id)
  assert.equal(walkHeight(seat.anchor.x,seat.anchor.z,0,world),null)
 }
})
