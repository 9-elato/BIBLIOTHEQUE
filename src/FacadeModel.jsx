import {surfaceRelief} from './surfaceRelief'
import {natureMood} from './natureMood'
import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {useLibraryModel} from './useLibraryModel'
export default function FacadeModel({visible=true,time,weather}){
 const mood=natureMood(time,weather)
 const {scene}=useLibraryModel(import.meta.env.BASE_URL+'models/manor_estate.glb')
 const glass=useMemo(()=>{
  const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d')
  const sky=x.createLinearGradient(0,0,0,128);sky.addColorStop(0,mood.sky);sky.addColorStop(.44,mood.horizon);sky.addColorStop(.53,mood.mid);sky.addColorStop(1,mood.near);x.fillStyle=sky;x.fillRect(0,0,256,128)
  x.fillStyle='#edf3e9';x.globalAlpha=.6;for(let i=0;i<5;i++){x.beginPath();x.ellipse(i*58,37,29,5,0,0,Math.PI*2);x.fill()}
  const env=new THREE.CanvasTexture(c);env.colorSpace=THREE.SRGBColorSpace;env.mapping=THREE.EquirectangularReflectionMapping
  const material=new THREE.MeshPhysicalMaterial({color:mood.evening?'#77949a':'#a9c5c2',roughness:mood.wet?.08:.17,metalness:.22,clearcoat:1,clearcoatRoughness:.08,envMap:env,envMapIntensity:1.15,transparent:true,opacity:.82,depthWrite:false})
  return {env,material}
 },[time,weather])
 const relief=useMemo(()=>({stone:surfaceRelief('stone'),wood:surfaceRelief('wood')}),[])
 useEffect(()=>()=>Object.values(relief).forEach(t=>t.dispose()),[relief])
 const copy=useMemo(()=>{const c=scene.clone(true),materialsById=new Map();c.traverse(o=>{
  if(!o.isMesh)return
  o.castShadow=o.receiveShadow=true
  const replace=m=>{if(/window glass/i.test(m.name))return glass.material;if(!materialsById.has(m.uuid)){const next=m.clone();next.side=THREE.DoubleSide;if(/limestone|ivory|paving/i.test(m.name)){next.bumpMap=relief.stone;next.bumpScale=.045;next.roughness=mood.wet?.64:.88}else if(/walnut/i.test(m.name)){next.bumpMap=relief.wood;next.bumpScale=.018;next.roughness=.73}else if(/slate/i.test(m.name))next.roughness=mood.wet?.38:.78;materialsById.set(m.uuid,next)}return materialsById.get(m.uuid)}
  const materials=Array.isArray(o.material)?o.material:[o.material]
  o.material=Array.isArray(o.material)?materials.map(replace):replace(o.material);if(materials.some(m=>/window glass/i.test(m.name))){o.castShadow=false;o.receiveShadow=false}
 });c.userData.ownedMaterials=[...materialsById.values()];return c},[scene,glass,relief])
 useEffect(()=>()=>copy.userData.ownedMaterials.forEach(m=>m.dispose()),[copy])
 useEffect(()=>()=>{glass.material.dispose();glass.env.dispose()},[glass])
 return <primitive object={copy} visible={visible}/>
}
