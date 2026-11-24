import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import StaticBatch from './StaticBatch'
import {Box} from './GroundFloor'
import {ATTIC_HALF_WIDTH,ATTIC_EAVE,ATTIC_RIDGE} from './atticLayout'
export default function AtticTerracePortal(){
 const g=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-ATTIC_HALF_WIDTH,4.8);s.lineTo(ATTIC_HALF_WIDTH,4.8);s.lineTo(ATTIC_HALF_WIDTH,ATTIC_EAVE);s.lineTo(0,ATTIC_RIDGE);s.lineTo(-ATTIC_HALF_WIDTH,ATTIC_EAVE);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.20,bevelEnabled:false})},[])
 useEffect(()=>()=>g.dispose(),[g])
 return <StaticBatch><group position={[0,0,6.5]}>
  <mesh geometry={g}><meshStandardMaterial color="#d8c8ad" roughness={.91} side={THREE.DoubleSide}/></mesh>
  <mesh geometry={g} position={[0,0,-13.2]}><meshStandardMaterial color="#d8c8ad" roughness={.91} side={THREE.DoubleSide}/></mesh>
  <group position={[0,0,-13.2]}>
   <Box p={[0,1.1,.1]} s={[8.72,2.2,.22]} c="#d8c8ad"/>
   {[-1,1].map(a=><Box key={a} p={[a*3.23,3.5,.1]} s={[2.26,2.6,.22]} c="#d8c8ad"/>)}
   {[-2.1,2.1].map(x=><Box key={x} p={[x,3.5,.23]} s={[.14,2.7,.18]} c="#805d40"/>)}
   {[2.2,4.8].map(y=><Box key={y} p={[0,y,.23]} s={[4.34,.14,.24]} c="#805d40"/>)}
   <mesh position={[0,3.5,.12]}><planeGeometry args={[4.2,2.6]}/><meshStandardMaterial color="#c7e1e3" transparent opacity={.08} depthWrite={false} roughness={.18} side={THREE.DoubleSide}/></mesh>
  </group>
  {[-1,1].map(a=><group key={a}><Box p={[a*4.07,2.4,.1]} s={[.58,4.8,.22]} c="#d8c8ad"/><Box p={[a*3.8,2.4,.23]} s={[.14,4.8,.16]} c="#805d40"/></group>)}
  <Box p={[0,4.8,.23]} s={[7.72,.18,.20]} c="#805d40"/>
  <Box p={[0,.01,.08]} s={[7.6,.06,.44]} c="#a18a65"/>
 </group></StaticBatch>
}
