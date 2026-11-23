import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
export default function GameSparkle(){
 const ref=useRef(),mat=useRef()
 const shapes=useMemo(()=>[[-.19,-.07],[0,.12],[.19,-.03]].map(([cx,cy])=>{
  const shape=new THREE.Shape()
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4,r=i%2?.024:.09
   const x=cx+Math.sin(angle)*r,y=cy+Math.cos(angle)*r
   i?shape.lineTo(x,y):shape.moveTo(x,y)
  }
  shape.closePath()
  return shape
 }),[])
 useFrame(({clock,camera})=>{if(!ref.current)return;ref.current.position.y=1.05+Math.sin(clock.elapsedTime*1.8)*.08;ref.current.quaternion.copy(camera.quaternion);mat.current.opacity=.7+.25*Math.sin(clock.elapsedTime*2.7)})
 return <mesh ref={ref} position={[0,1.05,0]} userData={{noBatch:true,noCameraCollision:true}}>
  <shapeGeometry args={[shapes]}/>
  <meshBasicMaterial ref={mat} color="#fff1bf" transparent opacity={.9} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/>
 </mesh>
}
