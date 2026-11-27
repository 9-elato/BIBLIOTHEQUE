import test from 'node:test'
import assert from 'node:assert/strict'
import {applyCinemaAction,advanceCinemaSnack} from '../src/cinemaActions.js'
import {SEATS,startSitting,startStanding,advanceSeating} from '../src/seating.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('cinema actions require settled seating, selected snacks and prevent overlapping gestures',()=>{
 const s={seat:{recliner:true},phase:'entering'}
 assert.equal(applyCinemaAction(s,'popcorn',{popcorn:true}),false)
 s.phase='seated'
 assert.equal(applyCinemaAction(s,'popcorn',{}),false)
 assert.equal(applyCinemaAction(s,'popcorn',{popcorn:true}),true)
 assert.equal(applyCinemaAction(s,'cola',{cola:true}),false)
 let snack=s.snack;for(let i=0;i<20;i++)snack=advanceCinemaSnack(snack,.1)
 assert.equal(snack,null)
 assert.equal(applyCinemaAction({seat:{},phase:'seated'},'recline',{}),false)
})
test('all recliners tilt smoothly, toggle upright and allow safe standing',()=>{
 for(const seat of SEATS.filter(s=>s.recliner)){
 let s=startSitting({...seat.entry,level:seat.level,yaw:0},seat,world)
 for(let i=0;i<100;i++)s=advanceSeating(s,.05,world).seating
 assert.equal(s.phase,'seated');assert.equal(s.recline,0)
 assert.equal(applyCinemaAction(s,'recline',{}),true)
 for(let i=0;i<60;i++)s=advanceSeating(s,.05,world).seating
 assert.ok(s.recline>.41&&s.recline<=.42)
 applyCinemaAction(s,'recline',{});for(let i=0;i<60;i++)s=advanceSeating(s,.05,world).seating
 assert.ok(s.recline<.001)
 s=startStanding(s,world);for(let i=0;i<100&&s;i++)s=advanceSeating(s,.05,world).seating
 assert.equal(s,null)
 }
})
