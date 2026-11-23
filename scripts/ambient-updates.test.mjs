import test from 'node:test'
import assert from 'node:assert/strict'
import {ambientUpdateDue} from '../src/ambientUpdates.js'
test('slow ambient effects stop under hidden ancestors and resume without stale frames',()=>{
 const parent={visible:false},o={visible:true,parent}
 assert.equal(ambientUpdateDue(o,10,null),false)
 parent.visible=true
 assert.equal(ambientUpdateDue(o,10,null),true)
 assert.equal(ambientUpdateDue(o,10.01,10),false)
 assert.equal(ambientUpdateDue(o,10.05,10),true)
 assert.equal(ambientUpdateDue(o,0,10),true)
})
