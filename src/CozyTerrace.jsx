import {atticRoofY} from './atticLayout'
import React from 'react'
import {Box as B} from './GroundFloor'
import StaticBatch from './StaticBatch'
function Cushion({p,s,color='#cec0a4',rotation=[0,0,0]}){return <mesh position={p} rotation={rotation} scale={s}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={color} roughness={.97}/></mesh>}
function Plant({x,z}){return <group position={[x,0,z]}><mesh position={[0,.25,0]}><cylinderGeometry args={[.23,.17,.5,12]}/><meshStandardMaterial color="#82704b" roughness={.83}/></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[Math.sin(i*2.4)*.16,.6+i*.06,Math.cos(i*2.4)*.16]} rotation={[.3,i,.3]} scale={[.14,.38,.09]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={i%2?'#5e7150':'#394e37'} roughness={1}/></mesh>)}</group>}
export default function CozyTerrace({time}){
 const evening=time==='evening'
 return <group><StaticBatch revision={time}>
  <B p={[-2.55,.035,8.6]} s={[2.65,.025,3.95]} c="#a79777"/>
  <B p={[-2.9,.28,7.8]} s={[1.65,.5,1.65]} c="#69513a"/>
  <B p={[-3.6,.77,7.8]} s={[.25,.95,1.65]} c="#c5b79b"/>
  <B p={[-2.9,.77,7.08]} s={[1.65,.95,.25]} c="#c5b79b"/>
  <Cushion p={[-2.9,.59,7.85]} s={[.72,.22,.66]}/>
  {[-3.3,-2.7,-2.2].map(x=><Cushion key={x} p={[x,.97,7.28]} s={[.31,.34,.17]} rotation={[-.18,0,.08]} color={x<-3?'#8f9777':'#d4c8af'}/>)}
  <B p={[-2.5,.34,9.65]} s={[1.1,.64,.8]} c="#594536"/>
  <B p={[-2.5,.68,9.65]} s={[1.14,.08,.84]} c="#876b4c"/>
  <Cushion p={[.35,.3,10.3]} s={[.55,.3,.32]} color="#c7bba5"/>
  <B p={[7.05,.47,8.4]} s={[.6,.9,2.1]} c="#67523b"/>
  <B p={[7.05,.96,8.4]} s={[.65,.08,2.15]} c="#90775a"/>
  {[[7.05,7.65],[-3.6,10.35]].map(([x,z])=><Plant key={x} x={x} z={z}/>)}
  {/* Sparse strings follow the rear gable; the sky above the deck stays open. */}
  {[-1,1].map(side=><group key={side}>{Array.from({length:9},(_,i)=>{const x=side*(.15+i*.42),y=atticRoofY(x)-.15;return <group key={i}><B p={[x,y,6.83]} s={[.025,.30,.025]} c="#514b39"/><mesh position={[x,y-.13,6.83]}><sphereGeometry args={[.055,8,6]}/><meshStandardMaterial color="#ffe6b0" emissive="#ffbd62" emissiveIntensity={evening?2:.3}/></mesh></group>})}</group>)}
  {[[ -2.5,.87,9.65],[7.05,1.14,9]].map((p,i)=><group key={i} position={p}><B p={[0,0,0]} s={[.16,.26,.16]} c="#f2d7a0" glow={evening?'#efb763':undefined}/><B p={[0,.16,0]} s={[.22,.05,.22]} c="#574632"/></group>)}
 </StaticBatch><pointLight position={[-2.6,1.7,8.1]} color="#ffd293" intensity={evening?2.1:.45} distance={4.8} decay={2}/></group>
}
