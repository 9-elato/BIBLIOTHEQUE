import {build} from 'esbuild'
import {execFileSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import {THREE,mountBookcase,visibleMeshes,exportScene} from './bookcase-harness.mjs'
import {atticRoofY} from '../src/atticLayout.js'
const beforeSource=execFileSync('git',['show','95c2add:src/AtticCosmos.jsx'],{encoding:'utf8'})
for(const before of [true,false]){
 const file=path.resolve('outputs/comet-'+(before?'before':'after')+'.mjs')
 await build({entryPoints:['src/AtticCosmos.jsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:before?[{name:'baseline',setup(b){b.onLoad({filter:/AtticCosmos\.jsx$/},()=>({contents:beforeSource,loader:'jsx',resolveDir:path.resolve('src')}))}}]:[]})
 const Component=(await import(pathToFileURL(file).href)).default
 const mounted=await mountBookcase(Component,{time:'evening',textures:{}})
 try{
  const group=new THREE.Group()
  for(const mesh of visibleMeshes(mounted.scene)){
   const center=mesh.getWorldPosition(new THREE.Vector3())
   if(center.y<4.5||Math.abs(center.z-1.3)>.01)continue
   const copy=mesh.clone();copy.matrix.copy(mesh.matrixWorld);copy.matrixAutoUpdate=false;group.add(copy)
  }
  group.updateMatrixWorld(true)
  if(!before){
   const meshes=visibleMeshes(group),rod=meshes.find(n=>n.material.color.getHexString()==='ac9161')
   assert.ok(rod)
   const box=new THREE.Box3().setFromObject(rod),center=box.getCenter(new THREE.Vector3())
   assert.ok(Math.abs(box.max.y-atticRoofY(center.x))<1e-5,'rod reaches roof')
   const tube=meshes.find(n=>n.geometry.type==='TubeGeometry')
   const anchor=new THREE.Vector3(center.x,box.min.y,center.z)
   let closest=Infinity
   const a=tube.geometry.attributes.position
   for(let i=0;i<a.count;i++)closest=Math.min(closest,anchor.distanceTo(new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(tube.matrixWorld)))
   assert.ok(closest<.04,'rod joins actual comet tube surface')
  }
  await exportScene(group,'outputs/comet-'+(before?'before':'after')+'.scene.json')
 }finally{await mounted.dispose()}
}
