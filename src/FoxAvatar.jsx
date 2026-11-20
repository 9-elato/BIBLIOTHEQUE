import React,{useMemo,useRef} from 'react'
import {useLibraryModel} from './useLibraryModel'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {FloatingBook} from './GhostGLB'
const url=import.meta.env.BASE_URL+'models/fox_librarian.glb'
export default function FoxAvatar({moving,book,pose}){
 const {scene}=useLibraryModel(url),root=useRef()
 const model=useMemo(()=>{
  const copy=scene.clone(true),box=new THREE.Box3().setFromObject(copy),scale=1.7/(box.max.y-box.min.y)
  const parts=[];copy.traverse(o=>{if(o.isMesh){o.castShadow=true;if(/Boot|forepaw|Plume/.test(o.name))parts.push({o,p:o.position.clone(),r:o.rotation.clone()})}})
  copy.scale.set(scale,scale,scale*1.25);copy.position.y=-box.min.y*scale
  return {copy,parts,scale}
 },[scene])
 useFrame(({clock},dt)=>{
  const t=clock.elapsedTime,a=pose?.current?.amount||0,walk=moving.current?1:0
  root.current.position.y=.025+Math.sin(t*10)*.025*walk
  model.copy.scale.y=THREE.MathUtils.damp(model.copy.scale.y,model.scale*(1-a*.18),8,dt)
  for(const {o,p} of model.parts){
   const sign=/L/.test(o.name)?1:-1
   o.position.copy(p)
   if(/Boot/.test(o.name)){o.position.z+=Math.sin(t*10)*.15*walk*sign+a*.3;o.position.y+=Math.max(0,Math.cos(t*10)*sign)*.09*walk}
   if(/forepaw/.test(o.name)){o.position.z+=(book?.16:0);o.position.y+=(book?.13:0)}
   if(/Plume/.test(o.name)){o.position.x+=Math.sin(t*2)*.06*(1-a);o.scale.z=1-a*.35}
  }
 })
 return <group ref={root} rotation={[0,Math.PI,0]}><primitive object={model.copy}/>{book&&<FloatingBook book={book} pose={pose}/>}</group>
}
