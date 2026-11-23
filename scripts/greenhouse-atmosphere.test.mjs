import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import {build} from 'esbuild'
import {mountBookcase,THREE} from './bookcase-harness.mjs'
import {roofDrop,skyFlake} from '../src/greenhouseClimate.js'

await mkdir('outputs',{recursive:true})
const dir=await mkdtemp(path.resolve('outputs/greenhouse-test-')),file=path.join(dir,'atmosphere.mjs')
await build({entryPoints:['src/GreenhouseAtmosphere.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,logLevel:'silent'})
const {default:Atmosphere}=await import(pathToFileURL(file).href)
after(()=>rm(dir,{recursive:true,force:true}))
const props={time:'afternoon',weather:'rain',active:true}
const find=(scene,predicate)=>{let found;scene.traverse(n=>{if(predicate(n))found=n});return found}
const near=(actual,expected)=>actual.forEach((value,i)=>assert.ok(Math.abs(value-expected[i])<1e-5,`${value} ~= ${expected[i]}`))
const stats=[]

test('roof precipitation skips hidden updates, caps visible uploads and resumes at current time',async()=>{
 for(const weather of ['rain','snow']){
  const mounted=await mountBookcase(Atmosphere,{...props,weather})
  try{
   const object=find(mounted.scene,n=>weather==='rain'?n.isInstancedMesh&&n.count===100:n.isPoints&&n.geometry.attributes.position.count===180)
   const attribute=weather==='rain'?object.instanceMatrix:object.geometry.attributes.position
   const initial=attribute.version
   for(let i=0;i<60;i++)mounted.advance(i/60)
   const uploads=attribute.version-initial
   assert.ok(uploads>=18&&uploads<=24,weather+' visible uploads '+uploads)
   const snapshot=Array.from(attribute.array),version=attribute.version
   mounted.scene.visible=false
   for(let i=60;i<660;i++)mounted.advance(i/60)
   assert.equal(attribute.version,version);assert.deepEqual(Array.from(attribute.array),snapshot)
   mounted.scene.visible=true;mounted.advance(20)
   assert.equal(attribute.version,version+1)
   const actual=weather==='rain'?new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(attribute.array)).toArray():Array.from(attribute.array.slice(0,3))
   near(actual,weather==='rain'?roofDrop(0,20):skyFlake(0,20))
   stats.push({weather,frames:60,visibleUploads:uploads,hiddenFrames:600,hiddenUploads:0})
  }finally{await mounted.dispose()}
 }
 await writeFile('outputs/greenhouse-animation-updates.json',JSON.stringify({note:'Actual R3F frame callbacks and Three buffer versions; no GPU rendering/FPS measurement',stats},null,2))
})

test('switching rain to snow initializes the new buffer without waiting for the old budget',async()=>{
 const mounted=await mountBookcase(Atmosphere,props)
 try{
  mounted.advance(1)
  await mounted.render({...props,weather:'snow'})
  const snow=find(mounted.scene,n=>n.isPoints&&n.geometry.attributes.position.count===180)
  mounted.advance(1.001)
  assert.ok(snow.geometry.attributes.position.version>0)
  near(Array.from(snow.geometry.attributes.position.array.slice(0,3)),skyFlake(0,1.001))
 }finally{await mounted.dispose()}
})

test('butterflies and dust pause beneath hidden parents and resume continuous clock phases',async()=>{
 const mounted=await mountBookcase(Atmosphere,{...props,weather:'sunny'})
 try{
  const dust=find(mounted.scene,n=>n.isPoints&&n.geometry.attributes.position.count===80)
  const butterflies=find(mounted.scene,n=>n.isGroup&&n.children.length===4&&n.children.every(c=>c.isGroup&&c.children.length===2&&c.children.every(wing=>wing.isGroup)))
  assert.ok(butterflies&&dust)
  const butterfly=butterflies.children[0],set=butterfly.position.set
  let updates=0;butterfly.position.set=function(...args){updates++;return set.apply(this,args)}
  for(let i=0;i<60;i++)mounted.advance(i/60)
  assert.ok(updates>=18&&updates<=24)
  const before={updates,position:butterfly.position.toArray(),wing:butterfly.children[0].rotation.y,dust:dust.position.x}
  mounted.scene.visible=false
  for(let i=60;i<660;i++)mounted.advance(i/60)
  assert.equal(updates,before.updates);assert.deepEqual(butterfly.position.toArray(),before.position)
  assert.equal(butterfly.children[0].rotation.y,before.wing);assert.equal(dust.position.x,before.dust)
  mounted.scene.visible=true;mounted.advance(20)
  assert.equal(updates,before.updates+1)
  near(butterfly.position.toArray(),[Math.sin(20*.22)*2.8,1.3+Math.sin(20*.7)*.4,-10+Math.cos(20*.3)*.5])
  assert.equal(butterfly.children[0].rotation.y,Math.sin(20*9)*.9)
  assert.equal(dust.position.x,Math.sin(20*.14)*.13)
  await mounted.render({...props,weather:'sunny',time:'evening'})
  const old=dust.position.x;mounted.advance(21)
  assert.equal(dust.visible,false);assert.equal(dust.position.x,old)
 }finally{await mounted.dispose()}
})
