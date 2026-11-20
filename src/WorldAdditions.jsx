import React from 'react'
import {Text} from '@react-three/drei'
import ManorEntrance from './ManorEntrance'

const material=(color,emissive='#000000',emissiveIntensity=0)=><meshStandardMaterial color={color} roughness={.85} emissive={emissive} emissiveIntensity={emissiveIntensity}/>
function Block({at,size,color,rotation=[0,0,0],onClick}){return <mesh position={at} rotation={rotation} castShadow receiveShadow onClick={onClick}><boxGeometry args={size}/>{material(color)}</mesh>}
function Sphere({at,r,color,onClick}){return <mesh position={at} castShadow onClick={onClick}><sphereGeometry args={[r,16,12]}/>{material(color)}</mesh>}
function Sign({label,at,color='#fff1db',size=.28,rotation=[0,0,0]}){return <Text position={at} fontSize={size} color={color} anchorX="center" anchorY="middle" rotation={rotation} maxWidth={4}>{label}</Text>}
function OccasionDecor({season}){return <group>
 {season==='christmas'&&<group position={[6,0,3.3]}><mesh position={[0,1.25,0]}><coneGeometry args={[.95,2.4,12]}/>{material('#537d58')}</mesh><mesh position={[0,.27,0]}><cylinderGeometry args={[.16,.22,.5,10]}/>{material('#755137')}</mesh>{[.8,1.3,1.75].map((y,i)=><Sphere key={i} at={[.25*(i-1),y,-.6]} r={.11} color={i===1?'#e7c26c':'#bc5343'}/>)}</group>}
 {season==='halloween'&&[-1,1].map((d,i)=><group key={i} position={[d*5.5,0,3.5]}><Sphere at={[0,.35,0]} r={.35} color="#cf7837"/><Block at={[0,.74,0]} size={[.08,.22,.08]} color="#6d7a41"/></group>)}
 {season==='books'&&<Sign label="WORLD BOOK DAY · 23 APRIL" at={[0,4.1,2]} color="#8d643c" size={.25}/>}
 </group>}
export default function WorldAdditions({weather='sunny',time='afternoon',season='none',entranceOpen=false,onEntranceToggle=()=>{}}){const now=new Date(),month=now.getMonth()+1,day=now.getDate();const current=season==='auto'?(month===12&&day>=15?'christmas':month===10&&day>=20?'halloween':month===4&&day===23?'books':month>=3&&month<=5?'spring':month>=6&&month<=8?'summer':month>=9&&month<=11?'autumn':'winter'):season;return <group>
  <ManorEntrance open={entranceOpen} onToggle={onEntranceToggle} season={weather==='snow'?'winter':current} time={time}/><OccasionDecor season={current}/>
 </group>}
