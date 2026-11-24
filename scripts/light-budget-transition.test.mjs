import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {readFile,mkdtemp,rm} from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {mountBookcase} from './bookcase-harness.mjs'
const dir=await mkdtemp(path.resolve('outputs/light-budget-')),file=path.join(dir,'budget.mjs')
after(()=>rm(dir,{recursive:true,force:true}))
await build({entryPoints:['src/SceneBudget.jsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'audit',setup(b){
 b.onLoad({filter:/useGraphicsQuality\.js$/},()=>({contents:'const profile={maxDpr:1,shadowInterval:.125};export default ()=>profile',loader:'js'}))
 b.onLoad({filter:/SceneBudget\.jsx$/},async args=>({contents:(await readFile(args.path,'utf8'))+`\nimport React from 'react';export function Fixture({show=true,blue=true,cameraX=0}){const {camera}=useThree();useLayoutEffect(()=>{camera.position.set(cameraX,0,0)},[cameraX]);return <group><SceneBudget/><group visible={show}>{[0,1,2,3,4,5].map(i=><pointLight key={i} color="red" intensity={10} position={[0,i*.1,0]}/>)}</group>{blue&&<pointLight color="blue" intensity={10} position={[30,0,0]}/>}</group>}`,loader:'jsx',resolveDir:path.resolve('src')}))
}}]})
const {Fixture}=await import(pathToFileURL(file).href)
const slots=scene=>{const a=[];scene.traverse(n=>{if(n.userData.budgetLight)a.push(n)});return a}
test('room hide and light removal clear stale light slots on the very next frame',async()=>{
 const mounted=await mountBookcase(Fixture,{})
 try{
  mounted.advance(.001);assert.equal(slots(mounted.scene).filter(n=>n.intensity&&n.color.getHex()===0xff0000).length,6)
  await mounted.render({show:false});mounted.advance(.002)
  assert.equal(slots(mounted.scene).filter(n=>n.intensity&&n.color.getHex()===0xff0000).length,0)
  assert.equal(slots(mounted.scene).filter(n=>n.intensity>0).length,1)
  await mounted.render({show:false,blue:false});mounted.advance(.003)
  assert.ok(slots(mounted.scene).every(n=>n.intensity===0))
 }finally{await mounted.dispose()}
})
test('teleport selects the new room lighting without the 200ms polling wait',async()=>{
 const mounted=await mountBookcase(Fixture,{})
 try{
  mounted.advance(.001)
  await mounted.render({cameraX:30});mounted.advance(.002)
  assert.ok(slots(mounted.scene).some(n=>n.intensity&&n.color.getHex()===0x0000ff))
  assert.equal(slots(mounted.scene).length,6)
 }finally{await mounted.dispose()}
})
