import test from 'node:test'
import assert from 'node:assert/strict'
import {CAFE_STAIR,cinemaZ,cafeX,cafeZ,PRIVATE_ROOMS} from '../src/cafeExpansion.js'
import {reserveRoom,hasRoomReservation} from '../src/cafeReservations.js'
import {SEATS} from '../src/seating.js'
import {findClickPath} from '../src/clickNavigation.js'
import {walkHeight} from '../src/navigation.js'
const world={end:45,gateReady:true,entranceOpen:true},p=(x,z,level=0)=>({x:cafeX(x),z:cafeZ(z),level})
test('all three private window seats connect to their own staircase',()=>{
 for(const room of PRIVATE_ROOMS){const seat=SEATS.find(s=>s.id===room.id);assert.ok(findClickPath({x:CAFE_STAIR.to[0],z:CAFE_STAIR.to[2],level:7.2},{...seat.entry,level:7.2},world),room.id)}
})
test('cinema is reached through rear dogleg corridor, not through front sightline or exterior walls',()=>{
 assert.ok(findClickPath(p(-27,25),p(-30,32.5),world))
 assert.ok(findClickPath(p(-30,32.5),p(-23,cinemaZ(37.5)),world))
 for(const [x,z] of [[-23,31],[-34,36],[-16,42],[-25,48]])assert.equal(walkHeight(cafeX(x),cafeZ(z),0,world),null)
})
test('personal reservation validates dates, rejects duplicate slots and expires after two hours',()=>{
 const now=new Date('2026-11-27T01:30:00Z'),r={roomId:PRIVATE_ROOMS[0].id,date:'2026-11-27',time:'10:00'},list=reserveRoom([],r,now)
 assert.equal(hasRoomReservation(list,r.roomId,now),true)
 assert.equal(hasRoomReservation(list,r.roomId,new Date('2026-11-27T03:00:00Z')),false)
 assert.throws(()=>reserveRoom(list,{...r,roomId:PRIVATE_ROOMS[1].id},now))
 assert.throws(()=>reserveRoom([],{...r,date:'2026-02-30'},now))
 assert.throws(()=>reserveRoom([],{...r,time:'20:00'},now))
})
