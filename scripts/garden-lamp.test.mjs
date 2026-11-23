import test from 'node:test'
import assert from 'node:assert/strict'
import {gardenLampSupports} from '../src/gardenLampSupports.js'
const bounds=({p,s})=>p.map((v,i)=>[v-s[i]/2,v+s[i]/2])
const meets=(a,b)=>a.every((range,i)=>range[0]<=b[i][1]+1e-9&&range[1]>=b[i][0]-1e-9)
test('low garden light has a continuous support from floor to lantern base',()=>{
 const parts=gardenLampSupports('low',.42).map(bounds)
 assert.ok(Math.abs(parts[0][1][0]+.42)<1e-9,'foot rests on the floor')
 assert.ok(meets(parts[0],parts[1]))
 assert.ok(meets(parts[1],bounds({p:[0,-.15,0],s:[.22,.04,.22]})))
})
test('both wall light brackets meet the existing greenhouse columns and lantern',()=>{
 for(const side of [-1,1]){
  const [plate,arm]=gardenLampSupports('wall',2.8,side).map(bounds)
  const column=bounds({p:[side*.15,0,.1],s:[.12,4,.12]})
  assert.ok(meets(plate,column));assert.ok(meets(plate,arm))
  assert.ok(meets(arm,bounds({p:[0,.15,0],s:[.26,.04,.26]})))
 }
 for(const p of gardenLampSupports('ceiling',5.7)){
  assert.ok(meets(bounds(p),bounds({p:[0,.15,0],s:[.26,.04,.26]})))
  assert.ok(meets(bounds(p),bounds({p:[0,-.15,0],s:[.22,.04,.22]})))
 }
})

// Mount the production component to cover batching and day/evening transitions.
test('garden lamp keeps one live light and updates glow after batching',async()=>{
 const {build}=await import('esbuild')
 const {mkdtemp,rm}=await import('node:fs/promises')
 const path=await import('node:path')
 const {pathToFileURL}=await import('node:url')
 const {mountBookcase,visibleMeshes}=await import('./bookcase-harness.mjs')
 const dir=await mkdtemp(path.resolve('outputs/lamp-test-'))
 let mounted
 try{
  const file=path.join(dir,'lamp.mjs')
  await build({entryPoints:['src/GreenhouseAtmosphere.jsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'})
  const {Lamp}=await import(pathToFileURL(file).href)
  for(const kind of ['low','wall','ceiling']){
   const props={position:[0,kind==='low'?.42:2.8,0],kind,on:false}
   mounted=await mountBookcase(Lamp,props)
   const lights=[];mounted.scene.traverse(n=>{if(n.isPointLight)lights.push(n)})
   assert.equal(lights.length,1);assert.equal(lights[0].intensity,0)
   const globe=()=>visibleMeshes(mounted.scene).find(n=>n.geometry.type==='SphereGeometry')
   assert.equal(globe().material.emissiveIntensity,.05)
   const count=visibleMeshes(mounted.scene).length
   assert.ok(count<4+gardenLampSupports(kind,props.position[1]).length,'batch reduces separate fixture meshes')
   await mounted.render({...props,on:true})
   assert.equal(globe().material.emissiveIntensity,2)
   assert.equal(lights[0].intensity,kind==='low'?1.8:6)
   assert.equal(visibleMeshes(mounted.scene).length,count)
   await mounted.dispose();mounted=null
  }
 }finally{
  if(mounted)await mounted.dispose()
  assert.ok(dir.startsWith(path.resolve('outputs')+path.sep))
  await rm(dir,{recursive:true,force:true})
 }
})
