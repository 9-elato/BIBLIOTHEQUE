import AvatarCafeAccessories from './AvatarCafeAccessories'
import {useSyncExternalStore} from 'react'
import {subscribeDrink,drinkSnapshot} from './cafeDrink'
import React,{useEffect,useMemo,useRef} from 'react'
import {useLibraryModel} from './useLibraryModel'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {FloatingBook} from './GhostGLB'
import {detailedAvatarMaterial} from './avatarSurface'
const url=import.meta.env.BASE_URL+'models/fox_librarian.glb'
export default function FoxAvatar({moving,book,pose,player}){
 const drink=useSyncExternalStore(subscribeDrink,drinkSnapshot,drinkSnapshot)
 const {scene}=useLibraryModel(url),root=useRef()
 const model=useMemo(()=>{
  const copy=scene.clone(true),box=new THREE.Box3().setFromObject(copy),scale=1.7/(box.max.y-box.min.y)
  const parts=[],materials=new Map()
  copy.traverse(o=>{
   if(!o.isMesh)return
   o.castShadow=true
   const sources=Array.isArray(o.material)?o.material:[o.material]
   const refined=sources.map(source=>{
    const kind=/frames/i.test(source.name)?'metal':/black|Espresso|smile/i.test(source.name)?'leather':'fur'
    if(!materials.has(source))materials.set(source,detailedAvatarMaterial(source,'fox',kind))
    return materials.get(source)
   })
   o.material=Array.isArray(o.material)?refined:refined[0]
   if(/Boot|forepaw|Plume|Sculpted ear|^Eye/.test(o.name))parts.push({o,p:o.position.clone(),r:o.rotation.clone(),s:o.scale.clone()})
  })
  copy.scale.set(scale,scale,scale*1.25);copy.position.y=-box.min.y*scale
  return {copy,parts,scale,materials,walk:0}
 },[scene])
 useEffect(()=>()=>model.materials.forEach(material=>material.dispose()),[model])
 useFrame(({clock},dt)=>{
  const t=clock.elapsedTime,a=pose?.current?.amount||0
  const walk=model.walk=THREE.MathUtils.damp(model.walk,moving.current?1:0,9,dt)
  root.current.position.y=.025+Math.sin(t*10)*.025*walk
  model.copy.scale.y=THREE.MathUtils.damp(model.copy.scale.y,model.scale*(1-a*.18),8,dt)
  for(const {o,p,r,s} of model.parts){
   const sign=o.name.endsWith(' L')?1:-1
   o.position.copy(p);o.rotation.copy(r);o.scale.copy(s)
   if(/Boot/.test(o.name)){o.position.z+=Math.sin(t*10)*.15*walk*sign+a*.3;o.position.y+=Math.max(0,Math.cos(t*10)*sign)*.09*walk}
   if(/forepaw/.test(o.name)){if(sign===1&&pose?.current?.ritual?.stage==='sipping'){o.position.y+=.4*Math.sin(Math.PI*pose.current.ritual.elapsed/2.4);o.position.z+=.16;}if(pose?.current?.snack&&sign===1){o.position.y+=.45*Math.sin(Math.PI*pose.current.snack.elapsed/1.8);o.position.z+=.18*Math.sin(Math.PI*pose.current.snack.elapsed/1.8)}o.position.z+=((book||drink)?.16:0);o.position.y+=((book||drink)?.13:0);if(pose?.current?.climbing){o.position.y+=.55;o.position.z+=.3;o.rotation.x-=.8}}
   if(o.name.startsWith('Plume')){o.rotation.y+=Math.sin(t*(2+walk))*(.07+.04*walk);o.scale.z=s.z*(1-a*.22)}
   if(o.name.startsWith('Sculpted ear'))o.rotation.z+=sign*Math.sin(t*3+sign)*(.012+.018*walk)
   if(o.name.startsWith('Eye'))o.scale.y=s.y*(1-Math.max(0,1-Math.abs(t%4.9-4.72)/.105)**2*.9)
  }
 })
 return <group ref={root} rotation={[0,Math.PI,0]}><primitive object={model.copy}/><AvatarCafeAccessories model={model.copy} character="fox" player={player} pose={pose}/>{book&&!drink&&<FloatingBook book={book} pose={pose}/>}</group>
}
