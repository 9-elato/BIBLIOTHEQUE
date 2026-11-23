import {build} from 'esbuild'
import {execFileSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import {THREE,mountBookcase,visibleMeshes,exportScene} from './bookcase-harness.mjs'
const source=execFileSync('git',['show','b681dcc:src/ForestSpring.jsx'],{encoding:'utf8'})
for(const before of [true,false]){
 const file=path.resolve('outputs/spring-'+(before?'before':'after')+'.mjs')
 await build({entryPoints:['src/ForestSpring.jsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'structural-audit',setup(b){
  if(before)b.onLoad({filter:/ForestSpring\.jsx$/},()=>({contents:source,loader:'jsx',resolveDir:path.resolve('src')}))
  b.onLoad({filter:/(ForestTrees|NaturalRocks)\.jsx$/},()=>({contents:'export default function Empty(){return null}',loader:'jsx'}))
 }}]})
 const Component=(await import(pathToFileURL(file).href)).default
 const mounted=await mountBookcase(Component,{time:'evening',weather:'sunny',active:false},{context:{createRadialGradient:()=>({addColorStop(){}})}})
 try{
  const group=new THREE.Group()
  for(const mesh of visibleMeshes(mounted.scene)){
   if(mesh.isInstancedMesh)continue
   const center=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3())
   if(center.x<18||center.x>26.3||center.z>18.5)continue
   const copy=mesh.clone();copy.matrix.copy(mesh.matrixWorld);copy.matrixAutoUpdate=false
   if(copy.material.isShaderMaterial)copy.material=new THREE.MeshStandardMaterial({color:'#426a57',roughness:.3})
   group.add(copy)
  }
  group.updateMatrixWorld(true)
  await exportScene(group,'outputs/spring-'+(before?'before':'after')+'.scene.json')
 }finally{await mounted.dispose()}
}

