import {nextVegetationPoll} from './vegetationSchedule.js'
import {meadowHeight} from './meadowLayout'
import {createForestTreeAssets} from './forestTreeAssets.js'
import useGraphicsQuality from './useGraphicsQuality'
import React,{useMemo,useLayoutEffect,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {windStrength,windEnvelope,leafDensity,leafScale,easeLeafScale} from './vegetationWind'

export function estateTrees(){return Array.from({length:90},(_,i)=>{
 const east=i<42,bank=i>=64
 const x=bank?8+(i*5.17)%33:east?30+(i*7.31)%34:-35+(i*5.17)%67,z=bank?19+(i*9.21)%26:east?-3+(i*11.67)%47:120+(i*7.13)%18
 return [x,z>=34?meadowHeight(x,z):x<28.2&&z>6.7&&z<27.1?-5.5:0,z]
})}
function TreeCell({trees,seed,weather,quality}){
 const branches=useRef(),leaves=useRef(),root=useRef(),last=useRef(-1)
 const uniforms=useMemo(()=>({clock:{value:0},strength:{value:0},gust:{value:0},detail:{value:1}}),[])
 const assets=useMemo(()=>createForestTreeAssets(trees,seed,uniforms),[trees,seed,uniforms])
 const snow=weather==='snow'
 useLayoutEffect(()=>{
  for(const [ref,matrices] of [[branches,assets.b],[leaves,assets.l]]){matrices.forEach((m,i)=>ref.current.setMatrixAt(i,m));ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();ref.current.boundingSphere.radius+=2}
 },[assets])
 useLayoutEffect(()=>{
  const mesh=leaves.current
  if(!mesh.instanceColor)mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(assets.colors.length),3)
  mesh.instanceColor.array.set(snow?assets.snowColors:assets.colors);mesh.instanceColor.needsUpdate=true
 },[assets,snow])
 useEffect(()=>()=>{for(const key of ['bg','lg','bm','lm','bd','ld'])assets[key].dispose()},[assets])
 const center=useMemo(()=>new THREE.Vector3(trees.reduce((a,p)=>a+p[0],0)/trees.length,0,trees.reduce((a,p)=>a+p[2],0)/trees.length),[trees]),world=useMemo(()=>new THREE.Vector3(),[])
 useFrame(({clock,camera},dt)=>{
  if(!root.current)return
  if(clock.elapsedTime>=last.current){last.current=nextVegetationPoll(clock.elapsedTime,center.x,center.z,.25);root.current.localToWorld(world.copy(center));const d=camera.position.distanceTo(world);leaves.current.castShadow=d<quality.leafShadow;branches.current.castShadow=d<quality.branchShadow;root.current.visible=d<205;leaves.current.userData.target=Math.ceil(assets.l.length*leafDensity(d)*quality.density)}
  const target=leaves.current.userData.target??assets.l.length,delta=Math.ceil(dt*1000)
  leaves.current.count+=Math.sign(target-leaves.current.count)*Math.min(delta,Math.abs(target-leaves.current.count));uniforms.detail.value=easeLeafScale(uniforms.detail.value,leafScale(assets.l.length,leaves.current.count),dt)
  if(root.current.visible){uniforms.clock.value=clock.elapsedTime;uniforms.strength.value=windStrength(weather);uniforms.gust.value=windEnvelope(clock.elapsedTime,uniforms.strength.value)}
 })
 return <group ref={root} userData={{noBatch:true,noCameraCollision:true}}>
  <instancedMesh ref={branches} args={[assets.bg,assets.bm,assets.b.length]} customDepthMaterial={assets.bd} receiveShadow/>
  <instancedMesh ref={leaves} args={[assets.lg,assets.lm,assets.l.length]} customDepthMaterial={assets.ld} receiveShadow/>
 </group>
}
export default function ForestTrees({positions,weather='sunny'}){
 const quality=useGraphicsQuality()
 const cells=useMemo(()=>{const cells=new Map();positions.forEach(p=>{const key=`${Math.floor(p[0]/18)},${Math.floor(p[2]/18)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p)});return [...cells.values()]},[positions])
 return <group>{cells.map((trees,i)=><TreeCell key={i} trees={trees} seed={824+i*173} weather={weather} quality={quality}/>)}</group>
}
