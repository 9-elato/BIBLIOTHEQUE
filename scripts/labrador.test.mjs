import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {Box3,Vector3,Texture} from 'three'
import {prepareLabrador,animateLabrador} from '../src/labradorMotion.js'
const data=readFileSync(new URL('../public/models/labrador_arsenal.glb',import.meta.url))
// Node validates geometry/animation; embedded image headers are checked separately below.
const loader=new GLTFLoader().register(()=>({name:'node-test-texture',loadTexture:()=>Promise.resolve(new Texture())}))
const gltf=await loader.parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'')
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

test('plush surface normal texture is embedded in the GLB for browser delivery',()=>{
 const jsonLength=data.readUInt32LE(12),json=JSON.parse(data.toString('utf8',20,20+jsonLength))
 assert.ok(json.materials.some(m=>m.normalTexture))
 const image=json.images[0],view=json.bufferViews[image.bufferView]
 assert.equal(image.mimeType,'image/png')
 const offset=20+jsonLength+8+(view.byteOffset||0)
 assert.equal(data.subarray(offset,offset+8).toString('hex'),'89504e470d0a1a0a')
 assert.equal(data.readUInt32BE(offset+16),128)
 assert.equal(data.readUInt32BE(offset+20),128)
 assert.ok(view.byteLength>100)
})

test('fur, knit and jersey retain distinct normal maps and UV scales in the web asset',()=>{
 const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)))
 const materials=['Fur / warm cream','Scarf / red knit','Uniform / red fabric'].map(name=>json.materials.find(m=>m.name===name))
 assert.equal(new Set(materials.map(m=>m.normalTexture.index)).size,3)
 // Fibre colour detail must be delivered to the browser, not just the studio shader.
 assert.equal(new Set(materials.map(m=>m.pbrMetallicRoughness.baseColorTexture.index)).size,3)
 assert.deepEqual(materials[1].normalTexture.extensions.KHR_texture_transform.scale,[3,3])
 assert.deepEqual(materials[2].normalTexture.extensions.KHR_texture_transform.scale,[7,7])
 assert.ok(materials[1].pbrMetallicRoughness.roughnessFactor>materials[2].pbrMetallicRoughness.roughnessFactor)
})
