import test from 'node:test'
import assert from 'node:assert/strict'
import {studySeason,studyDoorBlocks,toggleStudyDoor} from '../src/studyLayout.js'
import {movePlayer} from '../src/navigation.js'
import {SEATS} from '../src/seating.js'
test('study door blocks closed passage and clears the central route when open',()=>{
 const door={amount:0,open:false},world={end:45,gateReady:true,entranceOpen:true,studyDoor:door}
 let p={x:0,z:-17,level:0,yaw:0}
 assert.ok(movePlayer(p,0,-5,world).z>-19)
 assert.equal(toggleStudyDoor(door,{x:0,z:-18.5}),false)
 assert.equal(toggleStudyDoor(door,p),true)
 door.amount=1
 assert.equal(studyDoorBlocks(0,-19,door),false)
 assert.ok(Math.abs(movePlayer(p,0,-5,world).z+22)<.001)
})
test('study desk and window seats are reachable along clear circulation routes',()=>{
 const world={end:45,gateReady:true,entranceOpen:true,studyDoor:{amount:1,open:true}}
 for(const id of ['study-desk','study-window']){
  const seat=SEATS.find(s=>s.id===id);let p={x:0,z:-21,level:0,yaw:0}
  const waypoints=id==='study-desk'?[[2.3,-21],[2.3,-28.1],[seat.entry.x,seat.entry.z]]:[[seat.entry.x,-21],[seat.entry.x,seat.entry.z]]
  for(const [x,z] of waypoints){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.01,id)}
 }
})
test('seasonal study details use the month with snow overriding to winter',()=>{
 assert.equal(studySeason(3),'spring');assert.equal(studySeason(6),'summer');assert.equal(studySeason(9),'autumn');assert.equal(studySeason(0),'winter');assert.equal(studySeason(6,'snow'),'winter')
})
