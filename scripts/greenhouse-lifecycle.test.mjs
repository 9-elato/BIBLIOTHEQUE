import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdir,mkdtemp,rm,readFile,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import {performance} from 'node:perf_hooks'
import {build} from 'esbuild'
import {mountBookcase,batches} from './bookcase-harness.mjs'

await mkdir('outputs',{recursive:true})
const dir=await mkdtemp(path.resolve('outputs/greenhouse-lifecycle-test-'))
after(()=>rm(dir,{recursive:true,force:true}))
async function compile(baseline){
 const file=path.join(dir,baseline?'before.mjs':'after.mjs')
 await build({entryPoints:['src/Greenhouse.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,logLevel:'silent',plugins:baseline?[{
  name:'original-shell-revision',setup(build){build.onLoad({filter:/[\\/]Greenhouse\.jsx$/},async({path:file})=>({contents:(await readFile(file,'utf8')).replace('active={active}/><StaticBatch>','active={active}/><StaticBatch revision={`${time}:${weather}:${event}`}>'),loader:'jsx'}))}
 }]:[]})
 return (await import(pathToFileURL(file).href)).default
}
const before=await compile(true),updated=await compile(false)
const context={beginPath(){},moveTo(){},lineTo(){},bezierCurveTo(){},quadraticCurveTo(){},stroke(){},fill(){},ellipse(){},createLinearGradient(){return {addColorStop(){}}}}
const options={context,browser:true},initial={time:'afternoon',weather:'sunny',event:'none',active:false}
// Outside trees and atmosphere precede the separately mounted static room.
const shell=scene=>scene.children[0].children[2]
function sameBatchSurfaces(a,b){
 assert.equal(a.length,b.length)
 for(let i=0;i<a.length;i++){
  for(const attribute of ['position','normal','color','uv'])assert.deepEqual(a[i].geometry.attributes[attribute]?.array,b[i].geometry.attributes[attribute]?.array)
  assert.deepEqual(a[i].matrixWorld.elements,b[i].matrixWorld.elements)
  assert.equal(a[i].castShadow,b[i].castShadow);assert.equal(a[i].receiveShadow,b[i].receiveShadow)
  for(const key of ['roughness','metalness','opacity','emissiveIntensity','side'])assert.equal(a[i].material[key],b[i].material[key])
  assert.deepEqual(a[i].material.color.toArray(),b[i].material.color.toArray())
  assert.deepEqual(a[i].material.emissive.toArray(),b[i].material.emissive.toArray())
 }
}

test('winter garden keeps static surfaces through time, weather and event changes',async()=>{
 const baseline=await mountBookcase(before,initial,options),next=await mountBookcase(updated,initial,options)
 try{
  const original=batches(shell(next.scene)),geometry=original.map(n=>n.geometry)
  sameBatchSurfaces(original,batches(shell(baseline.scene)))
  assert.ok(original.length>30)
  for(const condition of [{time:'evening'},{weather:'rain'},{weather:'snow'},{event:'halloween'},{event:'christmas'}]){
   const p={...initial,...condition}
   await baseline.render(p);await next.render(p)
   assert.deepEqual(batches(shell(next.scene)),original)
   assert.deepEqual(batches(shell(next.scene)).map(n=>n.geometry),geometry)
   sameBatchSurfaces(batches(shell(next.scene)),batches(shell(baseline.scene)))
  }
  // Weather and lighting still react outside the unchanged shell geometry.
  await next.render({...initial,weather:'rain'})
  const rain=[];next.scene.traverse(n=>{if(n.isInstancedMesh&&n.count===100)rain.push(n)})
  assert.equal(rain.length,1)
  next.advance(1);assert.ok(rain[0].instanceMatrix.version>0)
 }finally{await next.dispose();await baseline.dispose()}
})

test('static room batching is not repeated on event changes',async()=>{
 const baseline=await mountBookcase(before,initial,options),next=await mountBookcase(updated,initial,options)
 try{
  let old=batches(shell(baseline.scene)),newBatches=batches(shell(next.scene)),recreated=0,newRecreated=0
  const a=[],b=[]
  for(let i=0;i<14;i++){
   const p={...initial,event:i%2?'halloween':'christmas'}
   let t=performance.now();await baseline.render(p);const oldTime=performance.now()-t
   t=performance.now();await next.render(p);const newTime=performance.now()-t
   if(i>=2){a.push(oldTime);b.push(newTime)}
   const oldNext=batches(shell(baseline.scene)),newNext=batches(shell(next.scene))
   recreated+=oldNext.filter(n=>!old.includes(n)).length;newRecreated+=newNext.filter(n=>!newBatches.includes(n)).length
   old=oldNext;newBatches=newNext
  }
  assert.ok(recreated>0);assert.equal(newRecreated,0)
  const median=a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)]
  await writeFile('outputs/greenhouse-shell-lifecycle.json',JSON.stringify({note:'Production JSX mounted with no-op canvas/renderer; event-update CPU time, not browser FPS. First two warmups excluded.',eventChanges:14,baselineRecreatedBatches:recreated,updatedRecreatedBatches:newRecreated,baselineMedianMs:median(a),updatedMedianMs:median(b)},null,2))
 }finally{await next.dispose();await baseline.dispose()}
})
