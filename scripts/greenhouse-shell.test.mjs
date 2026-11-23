import test from 'node:test'
import assert from 'node:assert/strict'
import {GREENHOUSE_ALCOVE_PANELS,GREENHOUSE_ALCOVE_BACK,GREENHOUSE_ALCOVE_FRONT} from '../src/greenhouseLayout.js'
import {walkHeight,movePlayer,GALLERY_HEIGHT as level} from '../src/navigation.js'
const world={end:45,gateReady:true,entranceOpen:true,glassDoor:{open:true,amount:1}}

test('both greenhouse side walls have unbroken glazing between the return walls',()=>{
 const panels=GREENHOUSE_ALCOVE_PANELS.slice().sort((a,b)=>a.z-b.z)
 let edge=GREENHOUSE_ALCOVE_BACK
 for(const {z,w} of panels){
  assert.ok(w>0)
  assert.ok(Math.abs(z-w/2-edge)<1e-9,'panels must meet without a gap')
  edge=z+w/2
 }
 assert.ok(Math.abs(edge-GREENHOUSE_ALCOVE_FRONT)<1e-9,'glazing meets the final return')
 for(let z=-17.1;z<-11.1;z+=.1)for(const side of [-1,1]){
  assert.equal(walkHeight(side*8.5,z,level,world),null,'visible glass also remains a collision boundary')
 }
})

test('closing the rear side-bay glazing leaves the interior garden route accessible',()=>{
 let p={x:1.9,z:-14.7,level}
 for(const [x,z] of [[5.7,-14.7],[5.7,-13],[5.7,-14.7],[1.9,-14.7]]){
  p=movePlayer(p,x-p.x,z-p.z,world)
  assert.ok(Math.hypot(p.x-x,p.z-z)<.02)
 }
})
