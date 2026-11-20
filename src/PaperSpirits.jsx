import React,{useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {movePlayer} from './navigation'
import {atticX} from './atticLayout'

// Appearance is intentionally replaceable when the user's reference arrives.
export function PaperSpiritAppearance({bookmark=false}){
 return <group>
  <mesh rotation={[0,0,bookmark?-.12:.1]}><boxGeometry args={[bookmark?.17:.34,bookmark?.55:.3,.035]}/><meshStandardMaterial color={bookmark?'#9e5363':'#efe3bc'} roughness={.95}/></mesh>
  {[-1,1].map(a=><group key={a}>
   <mesh position={[a*.055,.025,.025]}><sphereGeometry args={[.018,8,6]}/><meshStandardMaterial color="#453c3a"/></mesh>
   {!bookmark&&<mesh position={[a*.21,.04,0]} rotation={[0,a*.6,a*.35]}><planeGeometry args={[.18,.22]}/><meshStandardMaterial color="#e6d5b2" side={THREE.DoubleSide}/></mesh>}
  </group>)}
  <mesh position={[0,-.3,0]} rotation={[0,0,.15]}><boxGeometry args={[.025,.16,.02]}/><meshStandardMaterial color="#b9975b"/></mesh>
 </group>
}
const paths=[
 {floor:0,points:[[-3.6,5],[-3.6,-3],[-1,-8],[0,-11]],bookmark:false},
 {floor:0,points:[[-10.3,5.8],[-14,5.8],[-17.7,5.8]],bookmark:true},
 {floor:7.2,points:[[8.2,3.8],[12.6,3.8],[12.6,-3.8]],bookmark:false},
 {floor:10.6,points:[[atticX(-15.6),3.5],[atticX(-15.6),-.8],[atticX(-13.6),-.8]],bookmark:true},
]
function Wanderer({route,index}){
 const ref=useRef(),state=useRef({x:route.points[0][0],z:route.points[0][1],level:route.floor,target:1,pause:0})
 useFrame(({clock},dt)=>{
  const s=state.current,[x,z]=route.points[s.target],distance=Math.hypot(x-s.x,z-s.z),step=Math.min(.48*Math.min(dt,.05),distance)
  if(s.pause>0)s.pause-=dt
  else if(distance<.08){s.target=(s.target+1)%route.points.length;s.pause=2.5}
  else{
   const next=movePlayer(s,(x-s.x)/distance*step,(z-s.z)/distance*step,{end:45,gateReady:false,entranceOpen:false})
   if(Math.hypot(next.x-s.x,next.z-s.z)<step*.1){s.target=(s.target+1)%route.points.length;s.pause=.5}
   else {s.x=next.x;s.z=next.z}
  }
  ref.current.position.set(s.x,s.level+1.2+Math.sin(clock.elapsedTime*2+index)*.13,s.z)
  ref.current.rotation.set(0,Math.atan2(x-s.x,z-s.z),Math.sin(clock.elapsedTime*2.4+index)*.08)
 })
 return <group ref={ref} userData={{player:true}}><PaperSpiritAppearance bookmark={route.bookmark}/></group>
}
export default function PaperSpirits(){return <group>{paths.map((route,i)=><Wanderer key={i} route={route} index={i}/>)}</group>}
