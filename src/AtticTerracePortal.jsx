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
  {[-1,1].map(a=><group key={a}><Box p={[a*4.07,2.4,.1]} s={[.58,4.8,.22]} c="#d8c8ad"/><Box p={[a*3.8,2.4,.23]} s={[.14,4.8,.16]} c="#805d40"/></group>)}
  <Box p={[0,4.8,.23]} s={[7.72,.18,.20]} c="#805d40"/>
  <Box p={[0,.01,.08]} s={[7.6,.06,.44]} c="#a18a65"/>
 </group></StaticBatch>
}
