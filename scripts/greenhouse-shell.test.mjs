import {MEADOW_STAIRS} from '../src/eastMeadowLayout.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import {GREENHOUSE_ALCOVE_PANELS,GREENHOUSE_EAST_ALCOVE_PANELS,GREENHOUSE_MEADOW_PORTAL,GREENHOUSE_ALCOVE_BACK,GREENHOUSE_ALCOVE_FRONT} from '../src/greenhouseLayout.js'
import {walkHeight,movePlayer,stairPoint,GALLERY_HEIGHT as level} from '../src/navigation.js'
const world={end:45,gateReady:true,entranceOpen:true,glassDoor:{open:true,amount:1}}

test('west greenhouse wall has unbroken glazing; east glazing remains solid outside the stair opening',()=>{
 const panels=GREENHOUSE_ALCOVE_PANELS.slice().sort((a,b)=>a.z-b.z)
 let edge=GREENHOUSE_ALCOVE_BACK
 for(const {z,w} of panels){
  assert.ok(w>0)
  assert.ok(Math.abs(z-w/2-edge)<1e-9,'panels must meet without a gap')
  edge=z+w/2
 }
 assert.ok(Math.abs(edge-GREENHOUSE_ALCOVE_FRONT)<1e-9,'glazing meets the final return')
 for(let z=-17.1;z<-11.1;z+=.1)for(const side of [-1,1]){
  if(side>0&&Math.abs(z-GREENHOUSE_MEADOW_PORTAL.z)<=GREENHOUSE_MEADOW_PORTAL.width/2)continue
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

test('east greenhouse glazing and framed stair opening exactly fill the return-wall span',()=>{
 const portal=GREENHOUSE_MEADOW_PORTAL
 const spans=[...GREENHOUSE_EAST_ALCOVE_PANELS,{z:portal.z,w:portal.width}].sort((a,b)=>a.z-b.z)
 let edge=GREENHOUSE_ALCOVE_BACK
 for(const {z,w} of spans){assert.ok(w>0);assert.ok(Math.abs(z-w/2-edge)<1e-9);edge=z+w/2}
 assert.ok(Math.abs(edge-GREENHOUSE_ALCOVE_FRONT)<1e-9)
 assert.equal(portal.z,MEADOW_STAIRS.to[2])
 assert.ok(portal.width>=MEADOW_STAIRS.width)
 assert.ok(portal.height>=3,'stair doorway retains camera and character headroom')
})

test('outdoor stair crosses the visible greenhouse opening in both directions without intersecting glass',()=>{
 const portal=GREENHOUSE_MEADOW_PORTAL
 const t=(portal.x-MEADOW_STAIRS.from[0])/(MEADOW_STAIRS.to[0]-MEADOW_STAIRS.from[0])
 for(const side of [-.6,0,.6]){
  const [x,y,z]=stairPoint(MEADOW_STAIRS,t,side)
  assert.ok(Math.abs(z-portal.z)<portal.width/2-.23)
  for(const pane of GREENHOUSE_EAST_ALCOVE_PANELS)assert.ok(Math.abs(z-pane.z)>pane.w/2+.23,'avatar clears each glass pane')
  assert.ok(Math.abs(walkHeight(x,z,y,world)-y)<1e-9)
  for(const reverse of [false,true]){
   const a=stairPoint(MEADOW_STAIRS,reverse?1.02:.94,side),b=stairPoint(MEADOW_STAIRS,reverse?.94:1.02,side)
   const p={x:a[0],level:reverse?level:a[1],z:a[2]}
   const q=movePlayer(p,b[0]-p.x,b[2]-p.z,world)
   assert.ok(Math.hypot(q.x-b[0],q.z-b[2])<.01,'stair landing is continuous')
  }
 }
})
