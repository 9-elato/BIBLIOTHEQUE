import useGraphicsQuality from './useGraphicsQuality'
import React,{useMemo,useLayoutEffect,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {seeded,windMaterial,windStrength,leafDensity,leafScale,easeLeafScale} from './vegetationWind'

export function estateTrees(){return Array.from({length:90},(_,i)=>{
 const east=i<42,bank=i>=64
 return [bank?8+(i*5.17)%33:east?30+(i*7.31)%34:-35+(i*5.17)%67,east||bank?-5.5:0,bank?19+(i*9.21)%26:east?-3+(i*11.67)%47:120+(i*7.13)%18]
})}
function TreeCell({trees,seed,weather,quality}){
 const branches=useRef(),leaves=useRef(),root=useRef(),last=useRef(-1)
 const uniforms=useMemo(()=>({clock:{value:0},strength:{value:0},detail:{value:1}}),[])
 const assets=useMemo(()=>{
  const random=seeded(seed),b=[],l=[],rootsB=[],rootsL=[],colors=[],o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),c=new THREE.Color()
  const segment=(a,end,r,root)=>{const d=end.clone().sub(a);o.position.copy(a).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(up,d.clone().normalize());o.scale.set(r,d.length(),r);o.updateMatrix();b.push(o.matrix.clone());rootsB.push(...root)}
  for(const [x,y,z] of trees){
   const height=4+random()*6,radius=.12+random()*.24,root=[x,y,z,height],lean=(random()-.5)*.7
   segment(new THREE.Vector3(x,y,z),new THREE.Vector3(x+lean,y+height,z),radius,root)
   const branchCount=5+Math.floor(random()*4)
   for(let j=0;j<branchCount;j++){
    const a=j*2.4+random(),level=.36+j/branchCount*.5,length=(.8+random()*1.2)*(1-level*.45)
    const base=new THREE.Vector3(x+lean*level,y+height*level,z),tip=base.clone().add(new THREE.Vector3(Math.cos(a)*length,height*.15,Math.sin(a)*length))
    segment(base,tip,radius*(.25+random()*.2),root)
    const amount=28+Math.floor(random()*28)
    for(let k=0;k<amount;k++){
     const angle=random()*Math.PI*2,r=Math.sqrt(random())*1.25
     o.position.copy(tip).add(new THREE.Vector3(Math.cos(angle)*r,(random()-.4)*1.5,Math.sin(angle)*r))
     o.rotation.set((random()-.5)*1.4,random()*Math.PI*2,(random()-.5)*.8)
     o.scale.set(.16+random()*.22,.23+random()*.28,.7+random()*.6);o.updateMatrix();l.push(o.matrix.clone());rootsL.push(...root)
     c.setHSL(.24+random()*.09,.30+random()*.30,(weather==='snow'?.65:.21)+random()*.17)
     c.multiplyScalar(.72+.28*Math.min(1,r));colors.push(c.clone())
    }
   }
  }
  // Interleave trees so reducing the draw count never erases an entire tree.
  for(let i=l.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[l[i],l[j]]=[l[j],l[i]];[colors[i],colors[j]]=[colors[j],colors[i]];for(let k=0;k<4;k++){const a=i*4+k,b=j*4+k;[rootsL[a],rootsL[b]]=[rootsL[b],rootsL[a]]}}
  const bg=new THREE.CylinderGeometry(.55,1,1,6);bg.setAttribute('plantRoot',new THREE.InstancedBufferAttribute(new Float32Array(rootsB),4))
  // Cupped individual leaf: a raised center vein gives front/back lighting variation.
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute([0,-1,0,-.62,-.2,0,-.48,.45,0,0,1,0,.48,.45,0,.62,-.2,0,0,0,.19],3));lg.setIndex([0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6]);lg.computeVertexNormals();lg.setAttribute('plantRoot',new THREE.InstancedBufferAttribute(new Float32Array(rootsL),4))
  const bm=windMaterial('branch',uniforms),lm=windMaterial('leaf',uniforms),bd=windMaterial('branch',uniforms,true),ld=windMaterial('leaf',uniforms,true)
  return {b,l,colors,bg,lg,bm,lm,bd,ld}
 },[trees,seed,weather,uniforms])
 useLayoutEffect(()=>{
  for(const [ref,matrices] of [[branches,assets.b],[leaves,assets.l]]){matrices.forEach((m,i)=>ref.current.setMatrixAt(i,m));ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();ref.current.boundingSphere.radius+=2}
  assets.colors.forEach((c,i)=>leaves.current.setColorAt(i,c));leaves.current.instanceColor.needsUpdate=true
 },[assets])
 useEffect(()=>()=>{for(const key of ['bg','lg','bm','lm','bd','ld'])assets[key].dispose()},[assets])
 const center=useMemo(()=>new THREE.Vector3(trees.reduce((a,p)=>a+p[0],0)/trees.length,0,trees.reduce((a,p)=>a+p[2],0)/trees.length),[trees]),world=useMemo(()=>new THREE.Vector3(),[])
 useFrame(({clock,camera},dt)=>{
  if(!root.current)return
  if(clock.elapsedTime-last.current>.25){last.current=clock.elapsedTime;root.current.localToWorld(world.copy(center));const d=camera.position.distanceTo(world);leaves.current.castShadow=d<quality.leafShadow;branches.current.castShadow=d<quality.branchShadow;root.current.visible=d<205;leaves.current.userData.target=Math.ceil(assets.l.length*leafDensity(d)*quality.density)}
  const target=leaves.current.userData.target??assets.l.length,delta=Math.ceil(dt*1000)
  leaves.current.count+=Math.sign(target-leaves.current.count)*Math.min(delta,Math.abs(target-leaves.current.count));uniforms.detail.value=easeLeafScale(uniforms.detail.value,leafScale(assets.l.length,leaves.current.count),dt)
  if(root.current.visible){uniforms.clock.value=clock.elapsedTime;uniforms.strength.value=windStrength(weather)}
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
