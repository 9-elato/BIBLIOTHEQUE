import test from 'node:test'
import assert from 'node:assert/strict'
import {cafeX,cafeZ,PRIVATE_ROOMS} from '../src/cafeExpansion.js'
import {cafeBrowseAction} from '../src/cafeInteractionPoints.js'
import {readCinemaKit} from '../src/cinemaKitState.js'
import {walkHeight} from '../src/navigation.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true}
const position=(x,z,level=0)=>({x:cafeX(x),z:cafeZ(z),level})
test('visitor-side cafe approach zones are walkable and open the matching object',()=>{
 for(const [x,z,type] of [[-18.2,22.25,'cafe'],[-20,20.8,'cafeMenu'],[-23,16.7,'cafeGoods'],[-30.7,18,'cafeBooks']]){
  const p=position(x,z)
  assert.equal(walkHeight(p.x,p.z,0,world),0,type)
  assert.equal(cafeBrowseAction(p).type,type)
  assert.equal(interactionAt(p,{world}).type,type)
  assert.equal(interactionAt({...p,seated:{phase:'seated'}},{world}).type,'stand')
 }
 assert.equal(cafeBrowseAction(position(-26.5,20)),null)
 assert.equal(cafeBrowseAction(position(-20.7,20,10.6)),null)
})
test('each private-room doorway offers its own reservation notebook',()=>{
 for(const r of PRIVATE_ROOMS){
  const p=position(r.x,22.8,7.2)
  assert.equal(walkHeight(p.x,p.z,p.level,world),7.2)
  assert.equal(interactionAt(p,{world}).roomId,r.id)
 }
})
test('cinema preparations tolerate corrupt saved data and only accept explicit selections',()=>{
 for(const raw of ['null','[]','broken','false','{"popcorn":"false"}'])assert.ok(Object.values(readCinemaKit(raw)).every(v=>v===false))
 assert.deepEqual(readCinemaKit('{"popcorn":true,"cola":true,"unknown":true}'),{slippers:false,blanket:false,cushion:false,popcorn:true,cola:true})
})
