import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {paddedCloth,pillowGeometry} from './atticFabric'
export default function AtticTextiles({fabric}){
 const objects=useMemo(()=>{
  const quilt=paddedCloth(2.35,1.7,.19),drape=paddedCloth(.43,1.2,.035,true),pillow=pillowGeometry()
  const points=Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return new THREE.Vector3(Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.4*.46,0,Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.4*.34)})
  const piping=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true),80,.008,5,true)
  return {quilt,drape,pillow,piping}
 },[])
 useEffect(()=>()=>Object.values(objects).forEach(g=>g.dispose()),[objects])
 const cloth=(color)=><meshPhysicalMaterial color={color} map={fabric} bumpMap={fabric} bumpScale={.012} roughness={1} sheen={.65} sheenColor="#e5d5c4" sheenRoughness={.9}/>
 return <group>
  <mesh geometry={objects.quilt} position={[-1.95,1.03,-.43]} castShadow receiveShadow>{cloth('#8d5267')}</mesh>
  {/* Unequal pillows, slightly tilted and indented, with sewn perimeter piping. */}
  {[[-2.76,1.02,.81,1,'#eee1c8',-.13],[-1.77,1.01,.86,.88,'#dfd1bd',.13],[-2.3,1.15,1.02,.66,'#9ca78c',-.23]].map(([x,y,z,s,c,r],i)=><group key={i} position={[x,y,z]} scale={[s,1,s]} rotation={[.12, r, .035*(i-1)]}><mesh geometry={objects.pillow} castShadow receiveShadow>{cloth(c)}</mesh><mesh geometry={objects.piping}><meshStandardMaterial color="#c5b18e" roughness={1}/></mesh></group>)}

 </group>
}
