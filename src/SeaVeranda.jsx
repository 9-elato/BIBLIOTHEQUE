import React,{useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import StaticBatch from './StaticBatch'
import {Text} from '@react-three/drei'
import {CarvedBox as B} from './StorybookDecor'
import {OceanWindow} from './CoastalStudy'
import {advanceGuardedDoor,verandaDoorBlocks} from './doorMotion'
export default function SeaVeranda({door,time,weather,onExperience,playerPosition}){
 const slider=useRef()
 useFrame((_,dt)=>{advanceGuardedDoor(door,dt,playerPosition?.current,verandaDoorBlocks);if(slider.current)slider.current.position.x=-10.2-door.amount*1.9})
 const toggle=e=>{e.stopPropagation();window.dispatchEvent(new CustomEvent('library-interact'))}
 return <StaticBatch revision={time+weather}>
  <B p={[-14.7,-.13,-10.4]} s={[11.8,.26,7.5]} c="#83634b"/>
  {Array.from({length:21},(_,i)=><B key={i} p={[-14.7,.004,-6.85-i*.35]} s={[11.7,.012,.016]} c="#4b392e"/>)}
  <B p={[-14.7,6.3,-10.4]} s={[11.8,.2,7.5]} c="#584132"/>
  {[-20.5,-8.9].map(x=><B key={x} p={[x,3.1,-10.4]} s={[.2,6.2,7.5]} c="#b2a28b"/>)}
  <group userData={{noBatch:true}}><OceanWindow p={[-14.7,3.1,-14.08]} w={11.5} h={6.2} time={time} weather={weather}/></group>
  <B p={[-14.7,.13,-13.85]} s={[11.6,.26,.3]} c="#5d4736"/>
  <B p={[-14.7,4.25,-13.8]} s={[11.2,.10,.12]} c="#554031"/>
  {[-20.2,-9.2].map(x=><group key={x}>
   <B p={[x,3.1,-13.8]} s={[.18,6.2,.22]} c="#554031"/>
   {[-.18,0,.18].map(a=><mesh key={a} position={[x+a,2.1,-13.56]}><cylinderGeometry args={[.14,.20,4.1,8]}/><meshStandardMaterial color="#e6dcc9" roughness={1}/></mesh>)}
  </group>)}
  {[-11.17,-9.23].map(x=><B key={x} p={[x,2.65,-6.65]} s={[.13,5.3,.3]} c="#50372b"/>)}
  <B p={[-10.2,5.3,-6.65]} s={[2.1,.16,.3]} c="#50372b"/>
  <group ref={slider} position={[-10.2,0,-6.7]} onClick={toggle} userData={{noBatch:true}}>
   <B p={[0,2.6,0]} s={[1.8,5.2,.12]} c="#654d3b"/>
   <B p={[0,2.7,.075]} s={[1.55,4.75,.025]} c="#b3bba8"/>
   <B p={[.65,1.15,.12]} s={[.05,.3,.07]} c="#bba16c"/>
  </group>
  <Text position={[-10.2,3.45,-6.48]} fontSize={.16} color="#f0dfbb">바다 마루</Text>
  <B p={[-15,.43,-11]} s={[1.75,.14,1.1]} c="#5b3e2e"/>
  {[-.65,.65].flatMap(x=>[-.35,.35].map(z=><B key={`${x}/${z}`} p={[-15+x,.2,-11+z]} s={[.09,.4,.09]} c="#50382b"/>))}
  <group userData={{noBatch:true}} onClick={e=>{e.stopPropagation();onExperience('tea')}} position={[-15,.6,-11]}>
   <mesh><sphereGeometry args={[.19,16,10]}/><meshStandardMaterial color="#a4bbb1" roughness={.4}/></mesh>
   {[-.45,.45].map(x=><mesh key={x} position={[x,-.02,.16]}><cylinderGeometry args={[.1,.07,.14,16]}/><meshStandardMaterial color="#e4d6be"/></mesh>)}
   <Text position={[0,.35,0]} fontSize={.12} color="#f5e5c4">차 마시기</Text>
  </group>
  {[-17.5,-12.5].map(x=><group key={x}>
   <mesh position={[x,.14,-11.8]} scale={[.7,.16,.65]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color="#c4af87" roughness={1}/></mesh>
  </group>)}
  <group userData={{noBatch:true}} position={[-19,.5,-12.8]} onClick={e=>{e.stopPropagation();onExperience('meditation')}}>
   <B s={[.38,.8,.38]} c="#4c3a2c"/><B s={[.31,.65,.4]} c="#f4d9a2"/>
   <pointLight color="#ffce8b" intensity={2.2} distance={5}/>
   <Text position={[0,.65,0]} fontSize={.13} color="#f5e5c4">바다 명상</Text>
  </group>
 </StaticBatch>
}
