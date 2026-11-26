import test from 'node:test'
import assert from 'node:assert/strict'
import {stampVisit,readMembership,STAMP_DESIGNS,membershipLevel} from '../src/cafeMembership.js'
test('membership awards one stamp per Korean day and renews every nine visits',()=>{
 let record=stampVisit({visits:[]},new Date('2026-11-26T14:59:00Z'))
 assert.deepEqual(stampVisit(record,new Date('2026-11-26T14:59:59Z')),record)
 record=stampVisit(record,new Date('2026-11-26T15:00:00Z'))
 assert.deepEqual(record.visits,['2026-11-26','2026-11-27'])
 for(let i=1;i<20;i++)record=stampVisit(record,new Date(`2026-12-${String(i).padStart(2,'0')}T00:00:00Z`))
 assert.equal(record.visits.length,21)
 assert.equal(new Set(STAMP_DESIGNS.map(s=>s[0])).size,9)
 assert.equal(membershipLevel(8).level,0)
 assert.equal(membershipLevel(9).level,1)
 assert.equal(membershipLevel(9).stamps,0)
 assert.equal(membershipLevel(18).level,2)
})
test('membership tolerates unavailable storage and removes duplicate visit dates',()=>{
 assert.deepEqual(readMembership({getItem(){throw Error('denied')}}),{visits:[]})
 assert.deepEqual(readMembership({getItem:()=>JSON.stringify({visits:['2026-11-26','2026-11-26',null,'bad']})}),{visits:['2026-11-26']})
})
