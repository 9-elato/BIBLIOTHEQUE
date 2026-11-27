import React,{useMemo,useEffect} from 'react'
import {RoundedBox} from '@react-three/drei'
import * as THREE from 'three'
import {upholstery} from './cafeUpholstery'
function Piping({s,color}){
 const geometry=useMemo(()=>{const [w,h,d]=s,r=Math.min(w,d)*.12,points=[];for(const [x,z,start] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]])for(let i=0;i<=8;i++){const a=(start+i*90/8)*Math.PI/180;points.push(new THREE.Vector3(x+Math.cos(a)*r,h*.34,z+Math.sin(a)*r))}return new THREE.BufferGeometry().setFromPoints(points)},[...s]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <lineLoop geometry={geometry}><lineBasicMaterial color={color}/></lineLoop>
}
export function SoftPad({p,s,c='#ddd1bc',fabric='linen',seam=false}){return <group position={p}><RoundedBox args={s} radius={Math.min(...s)*.3} smoothness={3}><primitive object={upholstery(c,fabric)} attach="material" dispose={null}/></RoundedBox>{seam&&<Piping s={s} color={fabric==='velvet'?'#687568':'#b4a78f'}/>}</group>}
export default function CafeSoftSeat({floor=false,dark=false}){const c=dark?'#66564c':'#e8dfcf';return <group><mesh position={[0,floor?.025:.115,0]}><boxGeometry args={[1.06,floor?.05:.23,.82]}/><meshStandardMaterial color="#252724" roughness={.8}/></mesh><SoftPad p={[0,floor?.15:.43,0]} s={[1.2,floor?.2:.4,.96]} c={c} seam/><SoftPad p={[0,floor?.38:.95,.35]} s={[1.2,floor?.3:.8,.27]} c={c}/>{!floor&&[-.49,.49].map(x=><SoftPad key={x} p={[x,.70,0]} s={[.22,.35,.9]} c={c}/>)}<SoftPad p={[.19,floor?.33:.85,.17]} s={[.37,.31,.15]} c={dark?'#a18d77':'#eee4d3'}/></group>}
