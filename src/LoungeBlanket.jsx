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
   if(lap){
    const v=(.75-y)/1.5,t=Math.max(0,(v-.48)/.52),edge=Math.pow(Math.abs(x)/.675,4)
    const z=v<.48?-.12-v/.48*.56:-.68-.14*Math.sin(t*Math.PI/2)
    const height=v<.48?.58-.1*(v/.48):.48-.92*t
    p.setXYZ(i,x,height-.19*edge+.018*Math.sin(x*22+v*4),z+.025*Math.sin(x*19)*t)
   }else p.setXYZ(i,x,y,.055*Math.sin(x*15+y*5)+.035*Math.cos(y*20)+.12*Math.sin(y*3+x*4))
  }
  g.computeVertexNormals();return g
 },[lap])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 useFrame((_,dt)=>{if(!lap||!ref.current)return;const amount=pose?.current?.amount||0;ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x,amount,10,dt));ref.current.visible=amount>.02})
 return <group ref={ref} position={lap?[0,0,0]:[-16.8,.24,-1.8]} rotation={lap?[0,0,0]:[-Math.PI/2,0,.36]} scale={lap?.001:1} onClick={onClick}>
  <mesh geometry={geometry}><meshStandardMaterial color="#815060" side={THREE.DoubleSide} roughness={1}/></mesh>

 </group>
}
