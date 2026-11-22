import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
export default function GameSparkle(){
 const ref=useRef(),mat=useRef()
 const shape=useMemo(()=>{const s=new THREE.Shape();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?.08:.32;const x=Math.sin(a)*r,y=Math.cos(a)*r;i?s.lineTo(x,y):s.moveTo(x,y)}s.closePath();return s},[])
 useFrame(({clock,camera})=>{if(!ref.current)return;ref.current.position.y=1.05+Math.sin(clock.elapsedTime*1.8)*.08;ref.current.quaternion.copy(camera.quaternion);mat.current.opacity=.7+.25*Math.sin(clock.elapsedTime*2.7)})
 return <group ref={ref} position={[0,1.05,0]} userData={{noBatch:true}}>
  <mesh><shapeGeometry args={[shape]}/><meshBasicMaterial ref={mat} color="#ffe7a0" transparent opacity={.9} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/></mesh>
  {[[.35,.22],[-.28,-.15]].map(([x,y],i)=><mesh key={i} position={[x,y,0]} scale={.28}><shapeGeometry args={[shape]}/><meshBasicMaterial color="#fff6d5" transparent opacity={.75} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/></mesh>)}
 </group>
}
