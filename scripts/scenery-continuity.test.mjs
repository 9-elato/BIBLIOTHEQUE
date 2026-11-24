import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm} from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
import {mountBookcase,THREE} from './bookcase-harness.mjs'
import {coastPoint} from '../src/coastTerrainMath.js'
import {environmentMix} from '../src/environmentAudioMix.js'
import {movePlayer,walkHeight} from '../src/navigation.js'
const dir=await mkdtemp(path.resolve('outputs/scenery-audit-'))
after(()=>rm(dir,{recursive:true,force:true}))
async function component(name){const file=path.join(dir,name+'.mjs');await build({entryPoints:['src/'+name+'.jsx'],outfile:file,bundle:true,packages:'external',platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'rock-fixture',setup(b){b.onLoad({filter:/NaturalRocks\.jsx$/},()=>({contents:'export default function Rocks(){return null}',loader:'jsx'}))}}]});return (await import(pathToFileURL(file).href)).default}
const Ocean=await component('OceanSurface'),Portal=await component('AtticTerracePortal'),Clouds=await component('DriftingClouds'),Sea=await component('SeaWater'),Cosmos=await component('AtticCosmos')
test('ocean time advances, pauses while hidden and resumes without freezing',async()=>{
 const m=await mountBookcase(Ocean,{w:11.5,h:6.2,time:'afternoon',weather:'sunny',motion:1.65})
 try{let water;m.scene.traverse(o=>{if(o.material?.uniforms?.motion)water=o});assert.ok(water.geometry.attributes.position.count>1000);m.advance(1);const first=water.material.uniforms.clock.value;m.advance(2);assert.ok(water.material.uniforms.clock.value>first);water.parent.visible=false;const held=water.material.uniforms.clock.value;m.advance(3);assert.equal(water.material.uniforms.clock.value,held);water.parent.visible=true;m.advance(4);assert.ok(water.material.uniforms.clock.value>held)}finally{await m.dispose()}
})
test('actual terrace gable geometry closes above the opening and keeps doorway clear',async()=>{
 const m=await mountBookcase(Portal,{})
 try{m.scene.updateMatrixWorld(true);const ray=new THREE.Raycaster();const hit=(x,y)=>{ray.set(new THREE.Vector3(x,y,5),new THREE.Vector3(0,0,1));return ray.intersectObjects(m.scene.children,true).filter(h=>h.object.visible)};assert.equal(hit(0,2).length,0);assert.ok(hit(0,6).length>0);assert.ok(hit(4.07,2).length>0)}finally{await m.dispose()}
})
test('shore joins grass to submerged wet rock continuously on both coastal sides',()=>{
 for(const west of [false,true])for(const along of [-20,0,20]){assert.ok(Math.abs(coastPoint(along,0,west)[1])<1e-9);assert.equal(coastPoint(along,1,west)[1],-7.35);let prev=0;for(let i=1;i<=100;i++){const y=coastPoint(along,i/100,west)[1];assert.ok(y<=prev&&prev-y<.12);prev=y}}
})
test('expanded greenhouse rear and east meadow doorway remain walkable',()=>{
 const world={end:45,gateReady:true,entranceOpen:true,glassDoor:{amount:1,open:true}}
 let p={x:0,z:-20,level:7.2};p=movePlayer(p,0,-8.5,world);assert.ok(Math.abs(p.z+28.5)<.02);assert.equal(walkHeight(0,-30.2,7.2,world),null)
 p={x:55,z:0,level:0};p=movePlayer(p,40,0,world);assert.ok(Math.abs(p.x-95)<.02)
})
test('veranda ocean mix is quieter while keeping independent water bands',()=>{
 const mix=environmentMix({x:-15,z:-11},'바다 마루');assert.ok(mix.surf>0&&mix.surf<.04);assert.ok(mix.rocks<mix.surf&&mix.water<mix.surf)
})


test('shared sky cloud shader receives advancing time through side windows and skylights',async()=>{
 const m=await mountBookcase(Clouds,{time:'afternoon',weather:'sunny'})
 try{let sky;m.scene.traverse(o=>{if(o.material?.uniforms?.sunlight)sky=o});m.advance(1);const t=sky.material.uniforms.clock.value;m.advance(2);assert.ok(sky.material.uniforms.clock.value>t)}finally{await m.dispose()}
})


test('world sea waves use shared world coordinates and update surface normals',async()=>{
 const m=await mountBookcase(Sea,{position:[-14.9,-7,-29],size:[16,25],time:'afternoon',weather:'sunny'})
 try{let water;m.scene.traverse(o=>{if(o.material?.onBeforeCompile&&o.userData.noBatch)water=o});assert.ok(water);m.scene.updateMatrixWorld(true);const normal=new THREE.Vector3(0,0,1).transformDirection(water.matrixWorld);assert.ok(normal.y>.99)
 const shader={uniforms:{},vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>',fragmentShader:'#include <color_fragment>'};water.material.onBeforeCompile(shader)
 assert.deepEqual(shader.uniforms.waveOrigin.value.toArray(),[-14.9,-29]);assert.ok(shader.vertexShader.includes('objectNormal=normalize'));assert.ok(shader.vertexShader.includes('transformed.z+=waveHeight'));m.advance(1);const t=shader.uniforms.waveClock.value;m.advance(2);assert.ok(shader.uniforms.waveClock.value>t)
 }finally{await m.dispose()}
})


test('attic far wall closes former horizontal gaps outside the glazed aperture',async()=>{
 const m=await mountBookcase(Portal,{})
 try{m.scene.updateMatrixWorld(true);const ray=new THREE.Raycaster();for(const [x,y] of [[3,2.5],[3,4.5],[0,1.8],[0,6]]){ray.set(new THREE.Vector3(x,y,-8),new THREE.Vector3(0,0,1));assert.ok(ray.intersectObjects(m.scene.children,true).some(h=>h.object.visible&&h.distance<2))}}finally{await m.dispose()}
})


test('attic rear wallpaper is attached below the clear window aperture',async()=>{
 const wallpaper=new THREE.Texture(),m=await mountBookcase(Cosmos,{time:'afternoon',textures:{wallpaper}})
 try{let panel;m.scene.traverse(o=>{if(o.isMesh&&o.material?.map===wallpaper&&o.position.z<-6)panel=o});assert.ok(panel);assert.ok(panel.position.z< -6.45);assert.ok(panel.position.y+panel.geometry.parameters.height/2<2.2)}finally{await m.dispose();wallpaper.dispose()}
})
