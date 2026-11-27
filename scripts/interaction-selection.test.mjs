import test from 'node:test'
import assert from 'node:assert/strict'
import {SEATS,nearbySeat} from '../src/seating.js'
import {FURNITURE} from '../src/navigation.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true}

test('nearest seat search retains tie order and rechecks changed obstructions',()=>{
 const original=SEATS.slice(),from={x:3,z:-3,level:0}
 const make=(id,x)=>({id,entry:{x,z:-3},level:0,label:id})
 const left=make('left',2.4),right=make('right',3.5),tie=make('tie',2.5)
 const blocker={floor:0,id:'seat-query-blocker',rect:[3.27,3.30,-3.06,-2.94]}
 try{
  SEATS.splice(0,SEATS.length,left,right,tie)
  assert.equal(nearbySeat(from,world),right,'equal distances keep the earlier seat')
  FURNITURE.push(blocker)
  assert.equal(nearbySeat(from,world),tie,'blocked closest seat falls back to reachable seat')
  FURNITURE.splice(FURNITURE.indexOf(blocker),1)
  assert.equal(nearbySeat(from,world),right,'moving furniture must not leave a stale cached action')
  assert.equal(nearbySeat({...from,level:7.2},world),null)
 }finally{
  if(FURNITURE.includes(blocker))FURNITURE.splice(FURNITURE.indexOf(blocker),1)
  SEATS.splice(0,SEATS.length,...original)
 }
})
test('cafe seat retains priority over cafe menu and unavailable seating returns menu',()=>{
 const seat=SEATS.find(s=>s.id==='cafe-seat-0'),from={...seat.entry,level:0}
 assert.equal(interactionAt(from,{world}).seat,seat)
 assert.equal(interactionAt({...from,x:0,z:23},{world}),null)
 assert.equal(interactionAt({...from,seated:{phase:'seated'}},{world}).type,'stand')
})
