import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {useLibraryModel} from './useLibraryModel'
export default function FacadeModel({visible=true}){
 const {scene}=useLibraryModel(import.meta.env.BASE_URL+'models/manor_estate.glb')
 const glass=useMemo(()=>{
  const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d')
  const sky=x.createLinearGradient(0,0,0,128);sky.addColorStop(0,'#719db9');sky.addColorStop(.44,'#e0e9de');sky.addColorStop(.53,'#8b9b83');sky.addColorStop(1,'#394a43');x.fillStyle=sky;x.fillRect(0,0,256,128)
  x.fillStyle='#edf3e9';x.globalAlpha=.6;for(let i=0;i<5;i++){x.beginPath();x.ellipse(i*58,37,29,5,0,0,Math.PI*2);x.fill()}
  const env=new THREE.CanvasTexture(c);env.colorSpace=THREE.SRGBColorSpace;env.mapping=THREE.EquirectangularReflectionMapping
  const material=new THREE.MeshPhysicalMaterial({color:'#8baeb7',roughness:.13,metalness:.22,clearcoat:1,clearcoatRoughness:.08,envMap:env,envMapIntensity:1.15,transparent:true,opacity:.82,depthWrite:false})
  return {env,material}
 },[])
 const copy=useMemo(()=>{const c=scene.clone(true);c.traverse(o=>{
  if(!o.isMesh)return
  o.castShadow=o.receiveShadow=true
  const replace=m=>/window glass/i.test(m.name)?glass.material:m
  const materials=Array.isArray(o.material)?o.material:[o.material]
  if(materials.some(m=>/window glass/i.test(m.name))){o.material=Array.isArray(o.material)?materials.map(replace):glass.material;o.castShadow=false;o.receiveShadow=false}
 });return c},[scene,glass])
 useEffect(()=>()=>{glass.material.dispose();glass.env.dispose()},[glass])
 return <primitive object={copy} visible={visible}/>
}
