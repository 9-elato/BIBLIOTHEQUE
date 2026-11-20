import test from 'node:test'
import assert from 'node:assert/strict'
import {glassDoorBlocks,toggleGlassDoor,FOUNTAIN,POND} from '../src/greenhouseLayout.js'
import {walkHeight,movePlayer,GALLERY_HEIGHT as level} from '../src/navigation.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true,glassDoor:{open:true,amount:1}}
test('winter garden water, front glazing and outer edges block walking',()=>{
 for(const p of [FOUNTAIN,POND]){assert.equal(walkHeight(p.x,p.z,level,world),null);assert.equal(walkHeight(p.x+p.radius+.3,p.z,level,world),level)}
 assert.equal(walkHeight(3,-6.95,level,world),null)
 assert.equal(walkHeight(0,-24.1,level,world),null)
 assert.equal(walkHeight(8.4,-14,level,world),null)
})
test('glass door opens from both approaches and never closes on a visitor',()=>{
 const door={open:false,amount:0};assert.ok(glassDoorBlocks(0,-6.95,door));assert.ok(toggleGlassDoor(door,{x:0,z:-5.7}));door.amount=1
 assert.equal(glassDoorBlocks(0,-6.95,door),false)
 assert.equal(toggleGlassDoor(door,{x:0,z:-7.6}),false);assert.equal(door.open,true)
 assert.ok(toggleGlassDoor(door,{x:0,z:-9.3}))
 for(const z of [-5.7,-9.3])assert.equal(interactionAt({x:0,z,level},{world:{...world,glassDoor:door}}).type,'glassDoor')
})
test('central garden circuit reaches tropical planting and both side bays',()=>{
 let p={x:0,z:-5.7,level}
 for(const [x,z] of [[0,-10],[1.9,-10],[1.9,-16.8],[0,-16.8],[0,-20],[0,-18.9],[-2,-18.9],[-2,-15.7],[-4.8,-15.7],[-4.8,-13],[-4.8,-11.8],[-1.8,-11.8],[0,-10],[1.9,-10],[1.9,-14.7],[5.7,-14.7],[5.7,-13],[5.7,-14.7],[1.9,-14.7],[1.9,-10],[0,-10],[0,-5.7]]){
 p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.02,`blocked at ${x},${z}: ${p.x},${p.z}`)
 }
})
