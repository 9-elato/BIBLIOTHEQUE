import React,{useRef} from 'react'
import {useFrame} from '@react-three/fiber'
const planets=[['Mercury',.035,.34,'#a99c8d'],['Venus',.065,.49,'#ddb075'],['Earth',.072,.66,'#377fc1'],['Mars',.05,.83,'#be6445'],['Jupiter',.17,1.10,'#d4ac87'],['Saturn',.14,1.46,'#d6c18b'],['Uranus',.095,1.78,'#86c8c7'],['Neptune',.09,2.02,'#456cce']]
export default function SolarMobile(){
 const orbit=useRef()
 useFrame((_,dt)=>{if(orbit.current)orbit.current.rotation.y+=Math.min(dt,.05)*.035})
 return <group position={[0,4.35,-.6]} userData={{noBatch:true}}>
  <mesh position={[0,.8,0]}><cylinderGeometry args={[.014,.014,1.6,8]}/><meshStandardMaterial color="#ad8b56" metalness={.65}/></mesh>
  <mesh><sphereGeometry args={[.24,24,16]}/><meshStandardMaterial color="#ffd067" emissive="#ffb438" emissiveIntensity={1.3} roughness={.65}/></mesh>
  <group ref={orbit}>{planets.map(([name,r,radius,color],i)=>{
   const a=i*2.4,p=[Math.cos(a)*radius,-.12-(i%3)*.10,Math.sin(a)*radius]
   return <group key={name} name={'Solar mobile '+name}>
    <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[radius,.008,4,64]}/><meshStandardMaterial color="#af925e" metalness={.55} roughness={.5}/></mesh>
    <group position={p}>
     <mesh position={[0,-p[1]/2,0]}><cylinderGeometry args={[.003,.003,-p[1],5]}/><meshStandardMaterial color="#beaa7d"/></mesh>
     <mesh><sphereGeometry args={[r,20,12]}/><meshStandardMaterial color={color} roughness={.8}/></mesh>
     {name==='Earth'&&<>{[[0,.025,r*.91],[-.025,-.03,r*.85]].map((p,j)=><mesh key={j} position={p} scale={[1,1.5,.3]}><sphereGeometry args={[.025,10,8]}/><meshStandardMaterial color="#77a66b"/></mesh>)}<mesh position={[.12,0,0]}><sphereGeometry args={[.018,10,8]}/><meshStandardMaterial color="#dedacb"/></mesh></>}
     {name==='Jupiter'&&[-.06,0,.06].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[Math.sqrt(r*r-y*y),.008,4,32]}/><meshStandardMaterial color="#ae7958"/></mesh>)}
     {name==='Saturn'&&<mesh rotation={[1.12,.25,0]}><ringGeometry args={[r*1.3,r*2,48]}/><meshStandardMaterial color="#ccb38b" side={2} roughness={.9}/></mesh>}
    </group>
   </group>
  })}</group>
 </group>
}
