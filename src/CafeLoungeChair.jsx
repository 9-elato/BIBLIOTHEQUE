import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'

// A continuous horseshoe back encloses a deep oval seat, on a dark swivel plinth.
export default function CafeLoungeChair(){
 const back=useMemo(()=>{
  const shape=new THREE.Shape(),steps=28
  for(let i=0;i<=steps;i++){const a=i/steps*Math.PI,x=.64*Math.cos(a),y=.53*Math.sin(a);i?shape.lineTo(x,y):shape.moveTo(x,y)}
  for(let i=steps;i>=0;i--){const a=i/steps*Math.PI;shape.lineTo(.48*Math.cos(a),.36*Math.sin(a))}shape.closePath()
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.58,bevelEnabled:true,bevelThickness:.075,bevelSize:.065,bevelSegments:3,steps:1,curveSegments:24});geo.rotateX(Math.PI/2);geo.translate(0,1.23,0);geo.computeVertexNormals();return geo
 },[]);useEffect(()=>()=>back.dispose(),[back])
 return <group>
  <mesh position={[0,.17,0]}><cylinderGeometry args={[.38,.43,.30,24]}/><meshStandardMaterial color="#282725" roughness={.72}/></mesh>
  <mesh position={[0,.45,0]} scale={[.64,.19,.52]}><sphereGeometry args={[1,24,16]}/><meshPhysicalMaterial color="#e0d4bf" roughness={.95} sheen={1} sheenColor="#f2e8d5"/></mesh>
  <mesh geometry={back}><meshPhysicalMaterial color="#d5c7ae" roughness={.94} sheen={1} sheenColor="#f2e8d5"/></mesh>
  <mesh position={[0,.93,.27]} scale={[.34,.24,.12]} rotation={[-.12,0,0]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color="#eee5d3" roughness={1}/></mesh>
 </group>
}
export function CafeSideTable({p,s}){
 const [w,h,d]=s
 const top=useMemo(()=>{const shape=new THREE.Shape();shape.moveTo(-w*.46,0);shape.bezierCurveTo(-w*.46,-d*.47,w*.30,-d*.47,w*.46,-d*.12);shape.bezierCurveTo(w*.49,d*.20,-w*.05,d*.48,-w*.29,d*.34);shape.bezierCurveTo(-w*.42,d*.24,-w*.46,d*.12,-w*.46,0);const geo=new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:18});geo.rotateX(Math.PI/2);return geo},[w,d]);useEffect(()=>()=>top.dispose(),[top])
 return <group position={p}>
 <mesh geometry={top} position={[0,h/2-.012,0]}><meshStandardMaterial color="#a68b65" roughness={.7}/></mesh>
 <mesh position={[w*.12,-.02,0]} rotation={[0,0,-.12]}><cylinderGeometry args={[w*.13,w*.22,h-.10,16]}/><meshStandardMaterial color="#292826" roughness={.7}/></mesh>
 <mesh position={[0,-h/2+.035,0]} scale={[1,1,d/w]}><cylinderGeometry args={[w*.34,w*.37,.07,24]}/><meshStandardMaterial color="#292826" roughness={.7}/></mesh>
 </group>
}
