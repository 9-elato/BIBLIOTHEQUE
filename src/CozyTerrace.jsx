import {atticRoofY} from './atticLayout'
import React,{Suspense,useMemo} from 'react'
import {useLibraryModel} from './useLibraryModel'
import {Box as B} from './GroundFloor'
import StaticBatch from './StaticBatch'
function Cushion({p,s,color='#cec0a4',rotation=[0,0,0]}){return <mesh position={p} rotation={rotation} scale={s}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={color} roughness={.97}/></mesh>}
function Plant({x,z,y=0}){return <group position={[x,y,z]}><mesh position={[0,.25,0]}><cylinderGeometry args={[.23,.17,.5,12]}/><meshStandardMaterial color="#82704b" roughness={.83}/></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[Math.sin(i*2.4)*.16,.6+i*.06,Math.cos(i*2.4)*.16]} rotation={[.3,i,.3]} scale={[.14,.38,.09]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={i%2?'#5e7150':'#394e37'} roughness={1}/></mesh>)}</group>}
export default function CozyTerrace({time}){
 const evening=time==='evening'
 return <group><Suspense fallback={null}><TerraceFurnitureModel/></Suspense><StaticBatch revision={time}>
  <B p={[-2.55,.035,8.6]} s={[2.65,.025,3.95]} c="#a79777"/>
  <Plant x={7.05} y={1} z={7.65}/><Plant x={-3.6} z={10.35}/>
  {/* Sparse strings follow the rear gable; the sky above the deck stays open. */}
  {[-1,1].map(side=><group key={side}>{Array.from({length:9},(_,i)=>{const x=side*(.15+i*.42),y=atticRoofY(x)-.15;return <group key={i}><B p={[x,y,6.83]} s={[.025,.30,.025]} c="#514b39"/><mesh position={[x,y-.13,6.83]}><sphereGeometry args={[.055,8,6]}/><meshStandardMaterial color="#ffe6b0" emissive="#ffbd62" emissiveIntensity={evening?2:.3}/></mesh></group>})}</group>)}
  {[[ -2.5,.87,9.65],[7.05,1.14,9]].map((p,i)=><group key={i} position={p}><B p={[0,0,0]} s={[.16,.26,.16]} c="#f2d7a0" glow={evening?'#efb763':undefined}/><B p={[0,.16,0]} s={[.22,.05,.22]} c="#574632"/></group>)}
 </StaticBatch><pointLight position={[-2.6,1.7,8.1]} color="#ffd293" intensity={evening?2.1:.45} distance={4.8} decay={2}/></group>
}

function TerraceFurnitureModel(){
 const {scene}=useLibraryModel(`${import.meta.env.BASE_URL}models/terrace_furniture.glb`)
 const model=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return copy},[scene])
 return <primitive object={model}/>
}
