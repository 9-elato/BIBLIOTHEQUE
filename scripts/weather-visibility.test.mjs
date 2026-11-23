import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdir,mkdtemp,rm} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import {build} from 'esbuild'
import {mountBookcase,THREE} from './bookcase-harness.mjs'

await mkdir('outputs',{recursive:true})
const dir=await mkdtemp(path.resolve('outputs/weather-test-')),file=path.join(dir,'weather.mjs')
await build({entryPoints:['src/Weather.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,logLevel:'silent'})
const {default:Weather}=await import(pathToFileURL(file).href)
after(()=>rm(dir,{recursive:true,force:true}))

test('hidden rain and snow perform no buffer writes and resume the original clamped movement',async()=>{
 for(const weather of ['rain','snow']){
  const mounted=await mountBookcase(Weather,{weather})
  try{
   const particles=mounted.scene.children[0],position=particles.geometry.attributes.position,speed=weather==='rain'?12:1.3
   mounted.advance(1/60)
   const snapshot=position.array.slice(),version=position.version
   mounted.scene.visible=false
   for(let i=2;i<602;i++)mounted.advance(i/60)
   assert.equal(position.version,version);assert.deepEqual(position.array,snapshot)
   mounted.scene.visible=true;mounted.advance(20)
   assert.equal(position.version,version+1)
   for(let i=0;i<position.count;i++){
    let expected=snapshot[i*3+1]-.1*speed;if(expected<.1)expected=14
    assert.ok(Math.abs(position.getY(i)-expected)<1e-6)
    assert.equal(position.getX(i),snapshot[i*3]);assert.equal(position.getZ(i),snapshot[i*3+2])
   }
   assert.equal(particles.material.fog,true);assert.equal(particles.material.sizeAttenuation,true)
  }finally{await mounted.dispose()}
 }
})

test('visible weather keeps per-frame motion, and changing weather preserves particle locations',async()=>{
 const mounted=await mountBookcase(Weather,{weather:'rain'})
 try{
  const particles=mounted.scene.children[0],position=particles.geometry.attributes.position
  const expected=position.array.slice(),version=position.version
  for(let frame=1;frame<=60;frame++){
   for(let i=1;i<expected.length;i+=3){let y=expected[i]-12/60;if(y<.1)y=14;expected[i]=y}
   mounted.advance(frame/60)
  }
  assert.equal(position.version,version+60)
  position.array.forEach((value,i)=>assert.ok(Math.abs(value-expected[i])<1e-5))
  const before=position.array.slice()
  await mounted.render({weather:'snow'})
  assert.equal(mounted.scene.children[0],particles);assert.deepEqual(position.array,before)
  mounted.advance(1+1/60)
  for(let i=0;i<position.count;i++){
   let y=before[i*3+1]-1.3/60;if(y<.1)y=14
   assert.ok(Math.abs(position.getY(i)-y)<1e-6)
  }
  await mounted.render({weather:'sunny'})
  assert.equal(mounted.scene.children.length,0)
  mounted.advance(2)
 }finally{await mounted.dispose()}
})


test('culling bounds include every particle at the top and bottom of its falling path',async()=>{
 const mounted=await mountBookcase(Weather,{weather:'rain'})
 try{
  const geometry=mounted.scene.children[0].geometry,positions=geometry.attributes.position
  for(let i=0;i<positions.count;i++)for(const y of [positions.getY(i),.1,14])assert.ok(geometry.boundingSphere.containsPoint(new THREE.Vector3(positions.getX(i),y,positions.getZ(i))))
  const sphere=geometry.boundingSphere
  for(let i=0;i<600;i++)mounted.advance(i/60)
  assert.equal(geometry.boundingSphere,sphere)
  for(let i=0;i<positions.count;i++)assert.ok(sphere.containsPoint(new THREE.Vector3().fromBufferAttribute(positions,i)))
 }finally{await mounted.dispose()}
})

