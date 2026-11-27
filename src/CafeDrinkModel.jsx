import React from 'react'
export default function CafeDrinkModel({drink}){
 const iced=drink.vessel==='glass',h=iced?.38:.23,r=iced?.105:.13
 return <group>
 <mesh position={[0,h/2,0]}><cylinderGeometry args={[r,r*.82,h,24,1,true]}/><meshStandardMaterial color={iced?'#d4e7e0':'#f1e7d4'} transparent={iced} opacity={iced?.28:1} depthWrite={!iced} roughness={iced?.13:.35} side={2}/></mesh>
 <mesh position={[0,.015,0]}><cylinderGeometry args={[r*.82,r*.82,.03,24]}/><meshStandardMaterial color={iced?'#c9dcd6':'#e2d6bf'} roughness={.3}/></mesh>
 <mesh position={[0,h*.45,0]}><cylinderGeometry args={[r*.9,r*.76,h*.8,24]}/><meshStandardMaterial color={drink.color} roughness={.35}/></mesh>
 {!iced?<mesh position={[r+.035,h*.52,0]}><torusGeometry args={[.065,.018,8,20]}/><meshStandardMaterial color="#eee3cd" roughness={.35}/></mesh>:<>{[0,1,2].map(i=><mesh key={i} position={[Math.cos(i*2.1)*.045,h*.86,Math.sin(i*2.1)*.045]} rotation={[.2,i,.3]}><boxGeometry args={[.07,.06,.07]}/><meshStandardMaterial color="#e1f1e6" transparent opacity={.65} roughness={.12}/></mesh>)}<mesh position={[.055,h*.85,0]} rotation={[0,0,-.13]}><cylinderGeometry args={[.009,.009,h*.7,8]}/><meshStandardMaterial color="#393d35"/></mesh></>}
 </group>
}
