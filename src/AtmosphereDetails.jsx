import React,{useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Box as B} from './GroundFloor'
import {WindowLandscape} from './WindowLandscape'
export default function AtmosphereDetails({time,weather,event,secretOpen}){
 const ring=useRef(),dark=['night','evening'].includes(time)
 useFrame((_,dt)=>{if(ring.current)ring.current.rotation.y+=Math.min(dt,.1)*.08})
 return <group>
 {[-7,-3.5,0,3.5,7].map(x=><mesh key={x} position={[x,8.8,12.29]}><planeGeometry args={[1.88,2.12]}/><meshStandardMaterial color={dark?'#c5ab71':'#7f9d9f'} emissive={dark?'#dcad60':'#000000'} emissiveIntensity={dark?.8:0}/></mesh>)}

  {/* Upper hall clerestory: architectural height is independent of furniture. */}
  {[-1,1].map(a=><group key={a}>
   <group position={[a*4.5,9.2,7.08]} rotation={[0,Math.PI,0]}><WindowLandscape width={2.8} height={3.1} time={time} weather={weather} event={event}/></group>
  </group>)}
  {/* Window views also reach the reading room; their frame remains reusable. */}
  {[-1,1].map(a=><group key={a} position={[11.2,9.28,a*4.72]} rotation={[0,a>0?Math.PI:0,0]}><WindowLandscape width={2.62} height={1.2} time={time} weather={weather} event={event}/></group>)}
  {event!=='none'&&[-6.65,7.05].map(z=><group key={z}>
   {Array.from({length:13},(_,i)=><mesh key={i} position={[-1.8+i*.3,4.1+.2*Math.sin(i*.5),z]}><sphereGeometry args={[.09,10,8]}/><meshStandardMaterial color={event==='christmas'?(i%2?'#5d7b55':'#cfae63'):'#bd743a'} emissive={i%2?'#000000':'#ffb050'} emissiveIntensity={dark?1:.25}/></mesh>)}
  </group>)}
  {weather==='rain'&&<group position={[2.29,.65,9.2]}><B p={[0,.35,0]} s={[.035,.8,.035]} c="#a68c5f"/><mesh position={[0,.28,0]}><coneGeometry args={[.14,.65,12]}/><meshStandardMaterial color="#3b5962"/></mesh></group>}
  {weather==='snow'&&<B p={[0,.012,10.7]} s={[1.6,.015,.25]} c="#cbd8d3"/>}

 </group>
}
