import test from 'node:test'
import assert from 'node:assert/strict'
import {createFurnitureTour,advanceFurnitureTour} from '../src/furnitureTour.js'
import {advanceSeating} from '../src/seating.js'
import {walkHeight} from '../src/navigation.js'
for(const gateReady of [true,false])test(`automated furniture tour completes all seats (secret open: ${gateReady})`,()=>{
 const s={x:0,z:23,level:0,yaw:0,bodyYaw:0,pitch:0,keys:new Set()},t=createFurnitureTour(s)
 const world={end:45,gateReady,entranceOpen:true}
 for(let i=0;i<30000&&t.running;i++){
  advanceFurnitureTour(t,s,world,1/60)
  if(s.seated){const r=advanceSeating(s.seated,1/60,world);s.seated=r.seating;s.x=r.pose.x;s.z=r.pose.z}
 }
 assert.equal(t.running,false);assert.equal(t.results.length,41)
 assert.equal(t.results.filter(r=>r.result.startsWith('실패')).length,0,JSON.stringify(t.results))
 assert.equal(t.results.filter(r=>r.result.startsWith('건너뜀')).length,gateReady?0:3)
})
test('tour timeout returns to a verified floor position instead of dropping inside a cushion',()=>{
 const s={x:0,z:23,level:0,yaw:0,bodyYaw:0,pitch:0,keys:new Set()}
 const t=createFurnitureTour(s),world={end:45,gateReady:true,entranceOpen:true}
 advanceFurnitureTour(t,s,world,1/60)
 s.seated={seat:t.seat,phase:'entering'}
 s.x=t.seat.anchor.x;s.z=t.seat.anchor.z
 t.phase='sit';t.elapsed=13
 advanceFurnitureTour(t,s,world,1/60)
 assert.equal(s.seated,null)
 assert.equal(s.x,t.safePosition.x);assert.equal(s.z,t.safePosition.z)
 assert.equal(walkHeight(s.x,s.z,s.level,world),s.level)
 assert.match(t.results[0].result,/실패/)
})
