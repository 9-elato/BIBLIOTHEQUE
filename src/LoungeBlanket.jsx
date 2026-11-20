import React,{useMemo,useEffect,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

// A single low-poly cloth mesh; no cloth physics, lights or external textures.
export default function LoungeBlanket({lap=false,pose,onClick}){
 const ref=useRef()
 const geometry=useMemo(()=>{
  const g=new THREE.PlaneGeometry(1.35,1.5,20,22),p=g.attributes.position
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i)
   p.setXYZ(i,x,y,.055*Math.sin(x*15+y*5)+.035*Math.cos(y*20)+(!lap?.12*Math.sin(y*3+x*4):-.25*Math.max(0,-y)))
  }
  g.computeVertexNormals();return g
 },[lap])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 useFrame((_,dt)=>{if(!lap||!ref.current)return;const amount=pose?.current?.amount||0;ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x,amount,10,dt));ref.current.visible=amount>.02})
 return <group ref={ref} position={lap?[0,.45,-.25]:[-16.8,.24,-1.8]} rotation={lap?[-Math.PI/2,0,0]:[-Math.PI/2,0,.36]} scale={lap?.001:1} onClick={onClick}>
  <mesh geometry={geometry}><meshStandardMaterial color="#815060" side={THREE.DoubleSide} roughness={1}/></mesh>
  {[-1,1].map(side=><mesh key={side} position={[side*.59,0,.012]}><planeGeometry args={[.045,1.45]}/><meshStandardMaterial color="#cbb68e" side={THREE.DoubleSide} roughness={1}/></mesh>)}
 </group>
}
