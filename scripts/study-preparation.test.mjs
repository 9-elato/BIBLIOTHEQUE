import {advance} from '@react-three/fiber'
import test from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {mkdtemp,rm} from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {mountBookcase,visibleMeshes} from './bookcase-harness.mjs'

function assertDoorPoseSameFrame(scene,door){
 const pivots=[]
 scene.traverse(node=>{if(node.isGroup&&Math.abs(node.position.x)===1.32&&node.position.z===-19)pivots.push(node)})
 assert.equal(pivots.length,2)
 door.open=true
 for(let frame=1;frame<=3;frame++){
  const previous=door.amount
  advance(frame/60,false)
  assert.ok(door.amount>previous,'door simulation advances each frame')
  for(const pivot of pivots){
   const expected=-(door.swing??-1)*(pivot.position.x<0?1:-1)*door.amount*Math.PI/2
   assert.ok(Math.abs(pivot.children[0].rotation.y-expected)<1e-12,'visible hinge uses the current frame amount')
  }
 }
}

test('study resources wait for approach, survive closing and reopening, and release on unmount',async()=>{
 const previousWindow=globalThis.window,previousStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
 const spy={finishes:[],textures:[],finishDisposals:0,textureDisposals:0}
 globalThis.__studyPreparationAudit=spy
 globalThis.window=new EventTarget();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>null,setItem(){}}})
 const dir=await mkdtemp(path.resolve('outputs/study-preparation-test-'))
 let mounted
 try{
  const outfile=path.join(dir,'study.mjs')
  await build({entryPoints:['src/StudyRoom.jsx'],outfile,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{
   name:'study-resource-spies',setup(build){
    build.onLoad({filter:/[\\/]studyFinishes\.js$/},()=>({contents:`export function makeStudyFinish(kind){const value={kind};globalThis.__studyPreparationAudit.finishes.push(value);return value} export function disposeStudyFinishes(){globalThis.__studyPreparationAudit.finishDisposals++}`,loader:'js'}))
    build.onLoad({filter:/[\\/]studyTextures\.js$/},()=>({contents:`import {Texture} from 'three';export function studyTexture(kind){const t=new Texture();t.name=kind;globalThis.__studyPreparationAudit.textures.push(t);t.addEventListener('dispose',()=>globalThis.__studyPreparationAudit.textureDisposals++);return t}`,loader:'js'}))
    build.onLoad({filter:/[\\/]CoastalStudy\.jsx$/},()=>({contents:'export default function CoastalStudy(){return null}',loader:'jsx'}))
    build.onLoad({filter:/[\\/]StaticBatch\.jsx$/},()=>({contents:"import React from 'react';export default function StaticBatch({children}){return <group>{children}</group>}",loader:'jsx'}))
    build.onLoad({filter:/[\\/]StorybookDecor\.jsx$/},()=>({contents:`import React from 'react';const Empty=()=>null;export {Empty as CarvedBox,Empty as ReadingChair,Empty as WovenRug,Empty as Folios,Empty as Quill,Empty as WallSconce}`,loader:'jsx'}))
   }
  }]})
  const Component=(await import(pathToFileURL(outfile).href)).default
  const props={open:false,prepare:false,door:{amount:0,open:false,swing:1},time:'afternoon',weather:'sunny',event:'none',onNotes(){},onMusic(){}}
  mounted=await mountBookcase(Component,props)
  assert.equal(spy.finishes.length,0);assert.equal(spy.textures.length,0)
  assert.equal(visibleMeshes(mounted.scene).length,0)
  await mounted.render({...props,prepare:true})
  assert.equal(spy.finishes.length,4);assert.equal(spy.textures.length,2)
  assert.ok(visibleMeshes(mounted.scene).length>0)
  const retained=spy.textures.slice()
  assertDoorPoseSameFrame(mounted.scene,props.door)
  await mounted.render(props)
  assert.equal(visibleMeshes(mounted.scene).length,0)
  assert.equal(spy.finishDisposals,0);assert.equal(spy.textureDisposals,0)
  await mounted.render({...props,open:true,weather:'snow'})
  assert.ok(visibleMeshes(mounted.scene).length>0)
  assert.equal(spy.finishes.length,4);assert.deepEqual(spy.textures,retained)
  await mounted.dispose();mounted=null
  assert.equal(spy.finishDisposals,1);assert.equal(spy.textureDisposals,2)
  const directDoor={amount:0,open:false,swing:-1}
  mounted=await mountBookcase(Component,{...props,open:true,door:directDoor})
  assert.equal(spy.finishes.length,8);assert.equal(spy.textures.length,4)
  assert.ok(visibleMeshes(mounted.scene).length>0,'opening directly also prepares the room')
  assertDoorPoseSameFrame(mounted.scene,directDoor)
  await mounted.dispose();mounted=null
  assert.equal(spy.finishDisposals,2);assert.equal(spy.textureDisposals,4)
 }finally{
  if(mounted)await mounted.dispose()
  globalThis.window=previousWindow
  if(previousStorage)Object.defineProperty(globalThis,'localStorage',previousStorage);else delete globalThis.localStorage
  delete globalThis.__studyPreparationAudit
  const output=path.resolve('outputs')+path.sep
  if(!dir.startsWith(output))throw new Error('Temporary study test directory escaped outputs')
  await rm(dir,{recursive:true,force:true})
 }
})
