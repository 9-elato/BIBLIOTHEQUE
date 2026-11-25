import test from 'node:test'
import assert from 'node:assert/strict'
import {walkHeight,movePlayer,GALLERY_HEIGHT as level} from '../src/navigation.js'
import {GREENHOUSE_HEIGHT_SCALE,GREENHOUSE_DOOR_HEIGHT,GREENHOUSE_CEILING_LAMP_Y,greenhouseCeilingAt,GREENHOUSE_SIDE_PANELS as panels,GREENHOUSE_GABLE as g} from '../src/greenhouseLayout.js'
import {gardenRoofY} from '../src/greenhouseClimate.js'
const world={end:45,gateReady:true,entranceOpen:true,glassDoor:{open:true,amount:1}}
test('second-floor gallery connects stair landing, reading aisle and conservatory both ways',()=>{
 const route=[[-6.35,-5.7],[0,-5.7],[6.4,-5.7],[6.4,0],[8.3,0],[8.3,3.7],[13.75,3.7],[13.75,-3.7],[8.3,-3.7],[8.3,0],[6.4,0],[6.4,5.7],[-7.1,5.7]]
 for(const points of [route,[...route].reverse()]){
  let p={x:points[0][0],z:points[0][1],level}
  for(const [x,z] of points.slice(1)){p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.03,`gallery route blocked at ${x},${z}`)}
 }
 let p={x:0,z:-5.7,level};p=movePlayer(p,0,-4.3,world);assert.ok(Math.abs(p.z+10)<.03);p=movePlayer(p,0,4.3,world);assert.ok(Math.abs(p.z+5.7)<.03)
})
test('conservatory side panes close the shell up to alcoves and gable roof',()=>{
 const spans=panels.map(p=>[p.z-p.w/2,p.z+p.w/2])
 assert.ok(Math.abs(spans[0][0]+11)<1e-9)
 assert.ok(Math.abs(spans[0][1]-g.front)<1e-9)
 assert.ok(Math.abs(spans[1][0]-g.back)<1e-9)
 assert.ok(Math.abs(spans[1][1]+17.2)<1e-9)
 assert.ok(Math.abs(g.eave-gardenRoofY(g.halfWidth))<.04)
 assert.ok(Math.abs(g.ridge-gardenRoofY(0))<.04)
})


test('raised conservatory doorway and suspended lighting fit below the glass shell',()=>{
 const doorTop=GREENHOUSE_DOOR_HEIGHT*GREENHOUSE_HEIGHT_SCALE
 assert.ok(doorTop>4.7)
 assert.ok((GREENHOUSE_DOOR_HEIGHT+.644)*GREENHOUSE_HEIGHT_SCALE<g.eave*GREENHOUSE_HEIGHT_SCALE)
 assert.ok(greenhouseCeilingAt(3.4)>GREENHOUSE_CEILING_LAMP_Y+.5)
 assert.ok(GREENHOUSE_CEILING_LAMP_Y>5)
})
test('gallery void and outer edges are blocked while stair landings remain usable',()=>{
 for(const [x,z] of [[0,0],[5,0],[0,4.4],[0,-4.2],[8,6.9],[-6.4,0]])assert.equal(walkHeight(x,z,level,world),null)
 for(const [x,z] of [[6.4,0],[0,-5.7],[0,5.7],[-6.35,-5.7],[-7.1,5.7]])assert.equal(walkHeight(x,z,level,world),level)
})

test('gallery guardrails stop body penetration without blocking parallel sliding',()=>{
 for(const [x,z] of [[0,6.47],[0,4.8],[5.45,0],[0,-4.6],[3,-6.47],[-6.4,5.45]])assert.equal(walkHeight(x,z,level,world),null)
 const p=movePlayer({x:0,z:6.1,level},1,1,world)
 assert.ok(p.z<6.33);assert.ok(Math.abs(p.x-1)<.001)
})
