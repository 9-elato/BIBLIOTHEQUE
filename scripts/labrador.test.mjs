import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {Box3,Vector3} from 'three'
import {prepareLabrador,animateLabrador} from '../src/labradorMotion.js'
const data=readFileSync(new URL('../public/models/labrador_arsenal.glb',import.meta.url))
const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'')
test('labrador export contains animated parts within a real-time mesh budget',()=>{
 const model=prepareLabrador(gltf.scene)
 assert.equal(Object.keys(model.parts).length,6)
 const size=new Box3().setFromObject(model.copy).getSize(new Vector3())
 assert.ok(Math.abs(size.y-1.7)<.001)
 let triangles=0,calls=0
 model.copy.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;calls+=o.geometry.groups.length||1}})
 assert.ok(triangles<65000,`${triangles} triangles`);assert.ok(calls<65,`${calls} material draws`)
 console.log(`Labrador budget: ${triangles} triangles / ${calls} material draws / ${data.length} bytes`)
})
test('labrador walking, reading, sitting and returning to idle do not accumulate transforms',()=>{
 const model=prepareLabrador(gltf.scene),leg=model.parts.LegL
 animateLabrador(model,1,1/60,true,false,0)
 assert.notEqual(leg.node.rotation.x,leg.rotation.x)
 for(let i=0;i<180;i++)animateLabrador(model,i/60,1/60,false,true,1)
 assert.equal(model.parts.Football.node.visible,false)
 assert.ok(model.copy.scale.y<model.scale*.85)
 assert.ok(model.parts.ArmL.node.rotation.x<model.parts.ArmL.rotation.x-.4)
 for(let i=0;i<240;i++)animateLabrador(model,i/60,1/60,false,false,0)
 assert.equal(model.parts.Football.node.visible,true)
 assert.ok(Math.abs(model.copy.scale.y-model.scale)<.0001)
 assert.ok(leg.node.position.distanceTo(leg.position)<.0001)
 assert.equal(leg.node.rotation.x,leg.rotation.x)
 assert.ok(Math.abs(model.parts.ArmL.node.rotation.x-model.parts.ArmL.rotation.x)<.0001)
 // Cached geometry and transforms remain reusable when switching characters.
 const again=prepareLabrador(gltf.scene)
 assert.equal(again.parts.LegL.node.rotation.x,leg.rotation.x)
})
