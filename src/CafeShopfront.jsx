import React from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import StaticBatch from './StaticBatch'

const ink='#202f30',wood='#614832',gold='#bca070'
export const SHOP_WINDOW={x:-16,z:18,width:5.5,bottom:.85,top:4.85}
function Flowers({z}){
 return <group position={[-15.55,0,z]}>
  <B p={[0,.32,0]} s={[.65,.64,1.7]} c="#a88a61"/>
  {[.16,.34,.52].map(y=><B key={y} p={[.335,y,0]} s={[.025,.025,1.66]} c="#725e45"/>)}
  {[-.53,0,.53].map((a,i)=><group key={a} position={[0,.65,a]}>
   <mesh position={[0,.13,0]}><cylinderGeometry args={[.20,.14,.26,10]}/><meshStandardMaterial color="#817454"/></mesh>
   {[0,1,2,3,4].map(n=><group key={n} position={[Math.sin(n*2.4)*.16,.29+n*.04,Math.cos(n*2.4)*.16]}>
    <B p={[0,.07,0]} s={[.025,.22,.025]} c="#53664a"/>
    <mesh position={[0,.2,0]} scale={[1,.65,1]}><sphereGeometry args={[.12,7,5]}/><meshStandardMaterial color={['#e5dfca','#b7a7bb','#dac584'][i]}/></mesh>
   </group>)}
  </group>)}
 </group>
}
export default function CafeShopfront(){
 return <StaticBatch>
  {/* The glazed bay replaces the solid east wall; the cinema keeps its opaque shell. */}
  <B p={[-16,.425,18]} s={[.25,.85,6]} c={ink}/>
  <B p={[-16,5.925,18]} s={[.25,2.15,6]} c={ink}/>
  <mesh position={[SHOP_WINDOW.x,2.85,18]} rotation={[0,Math.PI/2,0]}>
   <planeGeometry args={[5.5,4]}/><meshStandardMaterial color="#d0dcd5" transparent opacity={.08} roughness={.2} depthWrite={false} side={THREE.DoubleSide}/>
  </mesh>
  {[15.15,18,20.7,23.8,30.85].map(z=><group key={z}>
   <B p={[-15.83,2.7,z]} s={[.35,5.4,.24]} c={ink}/>
   <B p={[-15.72,.22,z]} s={[.5,.44,.42]} c={ink}/>
   <B p={[-15.72,4.95,z]} s={[.48,.16,.43]} c={ink}/>
   <B p={[-15.64,2.7,z]} s={[.035,3.7,.07]} c="#43504a"/>
  </group>)}
  {[.85,3.95,4.85].map(y=><B key={y} p={[-15.82,y,18]} s={[.37,.14,5.7]} c={ink}/>)}
  {/* Continuous fascia and cornice, firmly joined to the wall and roof. */}
  <B p={[-15.78,5.75,23]} s={[.42,1.5,16]} c={ink}/>
  {[5,6.5,6.78].map(y=><B key={y} p={[-15.65,y,23]} s={[.67,.13,16.4]} c={ink}/>)}
  <B p={[-15.4,5.08,23]} s={[.035,.025,15.8]} c={gold}/>
  <B p={[-15.4,6.42,23]} s={[.035,.025,15.8]} c={gold}/>
  {/* Entrance stays open; the two leaves are folded flat against the jambs. */}
  {[20.7,23.8].map(z=><group key={z}>
   <B p={[-16.55,2.05,z]} s={[1.05,4.1,.10]} c={wood}/>
   <B p={[-16.55,2.6,z+(z<22? .06:-.06)]} s={[.78,2.35,.025]} c="#334b47"/>
   <B p={[-16.25,1.7,z+(z<22?.09:-.09)]} s={[.035,.32,.035]} c={gold}/>
  </group>)}
  {[20.5,24.1].map(z=><group key={z}>
   <B p={[-15.62,3.25,z]} s={[.5,.08,.08]} c={ink}/>
   <B p={[-15.38,3.05,z]} s={[.3,.52,.3]} c={ink}/>
   <mesh position={[-15.2,3.05,z]}><boxGeometry args={[.045,.34,.21]}/><meshStandardMaterial color="#ffe5b1" emissive="#ffc774" emissiveIntensity={.8}/></mesh>
   <mesh position={[-15.38,3.4,z]}><coneGeometry args={[.29,.22,4]}/><meshStandardMaterial color={ink}/></mesh>
  </group>)}
  <Flowers z={16.6}/><Flowers z={19.2}/><Flowers z={26.2}/>
  {/* Upper book-lined wall, above existing curated shelves and goods. */}
  {[-27.5,-22.65].map((x,k)=><group key={x}>
   <B p={[x,4.85,15.17]} s={[4.15,2.65,.12]} c="#3b3127"/>
   {[-2.05,0,2.05].map(dx=><B key={dx} p={[x+dx,4.85,15.46]} s={[.09,2.7,.7]} c={wood}/>)}
   {[3.52,4.36,5.2,6.04].map((y,row)=><group key={y}>
    <B p={[x,y,15.46]} s={[4.2,.10,.7]} c={wood}/>
    {row<3&&Array.from({length:19},(_,i)=>{const h=.47+((i*7+row*3+k)%5)*.055;return <B key={i} p={[x-1.9+i*.205,y+.05+h/2,15.51]} s={[.14,h,.39]} c={['#78634b','#b3a17a','#344a44','#794f42','#c1b79a'][((i*3)+row+k)%5]}/>})}
   </group>)}
  </group>)}
  {/* Parquet seams, skirting and picture rails unify the warm interior. */}
  {Array.from({length:17},(_,i)=><B key={i} p={[-29.7+i*.8,.006,23]} s={[.018,.01,15.4]} c="#806347"/>)}
  {[.25,6.45].map(y=><B key={y} p={[-23,y,15.18]} s={[13.7,.16,.14]} c={wood}/>)}
 </StaticBatch>
}
