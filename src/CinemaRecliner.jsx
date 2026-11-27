import React,{useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Box as B} from './GroundFloor'
import {SoftPad} from './CafeSoftSeat'
import {cinemaSeatMotion} from './cinemaActions.js'
export default function CinemaRecliner({id}){
 const back=useRef(),foot=useRef()
 useFrame((_,dt)=>{const angle=cinemaSeatMotion.get(id)||0,k=1-Math.exp(-7*Math.min(dt,.1));back.current.rotation.x+=(-angle-back.current.rotation.x)*k;foot.current.position.y+=(.27+angle*.35-foot.current.position.y)*k;foot.current.position.z+=(.96+angle*.12-foot.current.position.z)*k})
 return <group><B p={[0,.115,0]} s={[1.4,.23,1.5]} c="#222323"/>
 <SoftPad p={[0,.48,0]} s={[1.6,.5,1.7]} c="#55483f" fabric="velvet" seam/>
 <group ref={back} position={[0,.65,-.58]}><SoftPad p={[0,.4,0]} s={[1.5,1.25,.4]} c="#66574b" fabric="velvet"/></group>
 <group ref={foot} position={[0,.27,.96]}><SoftPad p={[0,0,0]} s={[1.3,.24,.6]} c="#66574b" fabric="velvet"/></group>
 {[-.69,.69].map(x=><group key={x}><SoftPad p={[x,.82,0]} s={[.22,.45,1.7]} c="#4d4138"/><mesh position={[x,1.05,.48]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.055,.075,16]}/><meshStandardMaterial color="#1e211f"/></mesh></group>)}
 </group>
}
