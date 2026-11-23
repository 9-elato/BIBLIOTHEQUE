import React,{act} from 'react'
import {createRoot,extend} from '@react-three/fiber'
import {build} from 'esbuild'
import {createRequire} from 'node:module'
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import path from 'node:path'

// Use the same Three constructor registry as Fiber's Node/CJS renderer.
// No browser, canvas pixels or WebGL are used: this mounts the production JSX
// and its real layout effects into a Three scene for geometry/picking tests.
export const THREE=createRequire(import.meta.url)('three')
extend(THREE)
export async function bookcaseComponents(){
 const output=path.resolve('outputs');await mkdir(output,{recursive:true})
 const dir=await mkdtemp(path.join(output,'bookcase-test-'))
 const compile=async(unbatched)=>{
  const file=path.join(dir,unbatched?'before.mjs':'after.mjs')
  await build({entryPoints:['src/GroundFloor.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,logLevel:'silent',plugins:unbatched?[{
   name:'reference-without-batching',setup(build){build.onLoad({filter:/[\\/]StaticBatch\.jsx$/},()=>({contents:"import React from 'react';export default function StaticBatch({children}){return <group>{children}</group>}",loader:'jsx'}))}
  }]:[]})
  return (await import(pathToFileURL(file).href)).Bookcase
 }
 return {before:await compile(true),after:await compile(false),dispose:()=>rm(dir,{recursive:true,force:true})}
}
export async function mountBookcase(Component,props,{context={},browser=false}={}){
 const previousDocument=globalThis.document,previousAct=globalThis.IS_REACT_ACT_ENVIRONMENT,previousWindow=globalThis.window
 globalThis.IS_REACT_ACT_ENVIRONMENT=true
 globalThis.document={addEventListener(){},removeEventListener(){},createElement(){return {getContext:()=>({fillRect(){},strokeRect(){},fillText(){},...context})}}}
 if(browser&&!globalThis.window)globalThis.window={addEventListener(){},removeEventListener(){}}
 const canvas={width:400,height:400,addEventListener(){},removeEventListener(){}}
 const gl={domElement:canvas,render(){},setSize(){},setPixelRatio(){},shadowMap:{},xr:{addEventListener(){},removeEventListener(){}},getContext(){return {}}}
 const root=createRoot(canvas);let state
 await root.configure({gl,frameloop:'never',dpr:1,size:{width:400,height:400},onCreated:s=>{state=s}})
 const render=async(next)=>{await act(async()=>root.render(React.createElement(Component,next)));state.scene.updateMatrixWorld(true)}
 await render(props)
 return {scene:state.scene,render,advance:seconds=>state.advance(seconds,false),async dispose(){await act(async()=>root.unmount());globalThis.document=previousDocument;globalThis.IS_REACT_ACT_ENVIRONMENT=previousAct;globalThis.window=previousWindow}}
}
export function visibleMeshes(scene){const result=[];scene.traverseVisible(n=>{if(n.isMesh)result.push(n)});return result}
export function batches(scene){return visibleMeshes(scene).filter(n=>n.name==='Static decoration batch')}
export function clickables(scene){const result=[];scene.traverseVisible(n=>{if(n.__r3f?.handlers?.onClick)result.push(n)});return result}
export function pick(scene,target){
 scene.updateMatrixWorld(true)
 const center=target.getWorldPosition(new THREE.Vector3()),forward=new THREE.Vector3(0,0,1).transformDirection(target.matrixWorld)
 const ray=new THREE.Raycaster(center.clone().addScaledVector(forward,3),forward.clone().negate())
 const hit=ray.intersectObjects(visibleMeshes(scene),false)[0]
 if(!hit)return null
 for(let n=hit.object;n;n=n.parent)if(n.__r3f?.handlers?.onClick){n.__r3f.handlers.onClick({stopPropagation(){}});return n}
 return null
}
export function surfaceVertices(scene){
 const result=[],p=new THREE.Vector3(),normal=new THREE.Vector3(),normalMatrix=new THREE.Matrix3()
 for(const mesh of visibleMeshes(scene)){
  const g=mesh.geometry,m=mesh.material
  if(m.map||m.isMeshBasicMaterial)continue // canvas lettering isn't pixel-rendered by this harness
  normalMatrix.getNormalMatrix(mesh.matrixWorld)
  const count=g.index?g.index.count:g.attributes.position.count
  for(let i=0;i<count;i++){
   const j=g.index?g.index.getX(i):i
   p.fromBufferAttribute(g.attributes.position,j).applyMatrix4(mesh.matrixWorld)
   normal.fromBufferAttribute(g.attributes.normal,j).applyNormalMatrix(normalMatrix)
   const colors=m.vertexColors&&g.attributes.color,tuple=[p.x,p.y,p.z,normal.x,normal.y,normal.z,m.color.r*(colors?colors.getX(j):1),m.color.g*(colors?colors.getY(j):1),m.color.b*(colors?colors.getZ(j):1),m.roughness,m.metalness,m.opacity]
   result.push(tuple)
  }
 }
 return result
}
export async function exportScene(scene,file){
 const meshes=visibleMeshes(scene).filter(n=>!n.material.map&&!n.material.isMeshBasicMaterial).map(n=>({
  name:n.name,position:Array.from(n.geometry.attributes.position.array),normal:Array.from(n.geometry.attributes.normal.array),index:n.geometry.index?Array.from(n.geometry.index.array):null,color:n.geometry.attributes.color?Array.from(n.geometry.attributes.color.array):null,matrixWorld:Array.from(n.matrixWorld.elements),material:{color:n.material.color.toArray(),roughness:n.material.roughness,metalness:n.material.metalness,opacity:n.material.opacity,vertexColors:n.material.vertexColors}
 }))
 await writeFile(file,JSON.stringify({note:'Actual mounted production JSX geometry; canvas text/image planes excluded. Not a screenshot.',meshes}))
}
