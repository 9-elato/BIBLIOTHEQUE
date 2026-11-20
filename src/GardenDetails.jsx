import React from 'react'
import {GARDEN_BENCHES,GARDEN_BEDS,GARDEN_TREES,GARDEN_LAMPS} from './gardenLayout'
const wood='#614837',brass='#a5844f',stone='#bbab92'
function Box({p,s,c=wood}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.85}/></mesh>}
function Ball({p,s,c}){return <mesh position={p} scale={s} castShadow><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color={c} roughness={.9}/></mesh>}
function Rod({p,h,r,c=brass}){return <mesh position={p} castShadow><cylinderGeometry args={[r,r,h,10]}/><meshStandardMaterial color={c}/></mesh>}
function Lantern({x,z,evening}){return <group>
 <Box p={[x,.1,z]} s={[.42,.2,.42]} c={stone}/><Rod p={[x,1.2,z]} h={2.3} r={.055}/>
 <Box p={[x,2.4,z]} s={[.42,.08,.42]}/><Box p={[x,2.94,z]} s={[.48,.08,.48]}/>
 {[-1,1].flatMap(a=>[-1,1].map(b=><Rod key={`${a},${b}`} p={[x+a*.17,2.67,z+b*.17]} h={.5} r={.025}/>))}
 <mesh position={[x,2.67,z]}><sphereGeometry args={[.14,12,8]}/><meshStandardMaterial color="#ffedb9" emissive="#ffcc80" emissiveIntensity={evening?2.8:.7}/></mesh>
 {(evening||z===18)&&<pointLight position={[x,2.6,z]} intensity={evening?6:1.1} color="#ffd59a" distance={7} decay={2}/>}
 <mesh position={[x,3.05,z]}><coneGeometry args={[.35,.23,4]}/><meshStandardMaterial color={wood}/></mesh>
 {[.6,.9,1.25].map((r,i)=><mesh key={r} position={[x,.055+i*.001,z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[r,32]}/><meshBasicMaterial color="#ffe0a0" transparent opacity={(evening?.075:.015)/(i+1)} depthWrite={false}/></mesh>)}
 </group>}
export default function GardenDetails({season,evening=false}){
 const autumn=['autumn','halloween'].includes(season),winter=['winter','christmas'].includes(season)
 return <group>
 {GARDEN_LAMPS.map(([x,z])=><Lantern key={`${x},${z}`} x={x} z={z} evening={evening}/>)}
 {GARDEN_BENCHES.map(([x,z])=><group key={x}>
  {[-1.2,1.2].map(a=><group key={a}><Box p={[x+a,.35,z]} s={[.14,.7,.85]}/><Box p={[x+a,.95,z+.15]} s={[.12,.12,1]}/><Rod p={[x+a,.75,z-.3]} h={.5} r={.055}/></group>)}
  {[-.3,-.1,.1,.3].map(a=><Box key={a} p={[x,.66,z+a]} s={[2.95,.1,.16]} c="#98714e"/>)}
  {[.95,1.22].map(y=><Box key={y} p={[x,y,z+.43]} s={[2.95,.18,.12]} c="#98714e"/>)}
  <Box p={[x-.8,.75,z]} s={[.38,.09,.3]} c="#59674d"/>
 </group>)}
 {GARDEN_BEDS.map(([x,z])=><group key={x}>
  <Box p={[x,.13,z]} s={[3.2,.26,2]} c={stone}/><Box p={[x,.28,z]} s={[2.95,.06,1.75]} c="#514739"/>
  {Array.from({length:15},(_,i)=>{const px=x-1.15+(i%5)*.57,pz=z-.55+Math.floor(i/5)*.55;return <group key={i}>
   <Ball p={[px,.53,pz]} s={[.28,.3,.25]} c={winter?'#a4af94':'#667d51'}/>
   <Rod p={[px,.8,pz]} h={.55} r={.018} c="#617249"/>
   <Ball p={[px,1.02,pz]} s={[.13,.18,.13]} c={winter?'#ece5cf':autumn?'#bc8452':['#b9a5bb','#d7bd9b','#997c9e'][i%3]}/>
  </group>})}
 </group>)}
 {GARDEN_TREES.map(([x,z])=><group key={`${x},${z}`}>
  <Rod p={[x,1.7,z]} h={3.4} r={.24} c={wood}/>
  {[-1,0,1].map((a,i)=><Ball key={a} p={[x+a*.65,3.4+(i%2)*.75,z+a*.35]} s={[1.35,1.55,1.3]} c={winter?'#bac4ad':autumn?['#aa8350','#bd975b','#8a8250'][i]:['#63784f','#819064','#6d8356'][i]}/>)}
 </group>)}
 {/* Flush mosaic runner and brass edging keep the entrance route unobstructed. */}
 <Box p={[0,.014,9.3]} s={[1.7,.025,2.7]} c="#6f5948"/>
 {[-.8,.8].map(x=><Box key={x} p={[x,.03,9.3]} s={[.035,.008,2.6]} c={brass}/>)}
 {[8.25,9.3,10.35].map(z=><mesh key={z} position={[0,.034,z]} rotation={[-Math.PI/2,0,Math.PI/4]}><planeGeometry args={[.25,.25]}/><meshStandardMaterial color="#bfaa79"/></mesh>)}
 <Box p={[-2.28,1.8,9.55]} s={[.4,.08,.6]} c="#52674f"/>
 <Rod p={[-2.25,1.98,9]} h={.4} r={.12} c="#c6b58f"/>
 <Ball p={[-2.25,2.3,9]} s={[.2,.28,.2]} c="#819064"/>
 {[-2.66,2.66].map(x=><group key={x}><Box p={[x,2.19,9.6]} s={[.12,.09,3.9]} c={brass}/>{[8.1,9.1,10.1,11.1].map(z=><Box key={z} p={[x,1.1,z]} s={[.1,1.9,.04]} c="#a4835e"/>)}</group>)}
 <Rod p={[0,3.9,9.65]} h={.35} r={.035}/>
 <mesh position={[0,3.78,9.65]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.43,.035,8,24]}/><meshStandardMaterial color={brass}/></mesh>
 </group>
}
