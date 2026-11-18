import React,{useState} from 'react'
import {Text} from '@react-three/drei'

const wood='#98663d', light='#c99a60', cream='#f2dcc0', forest='#5f795e'
function Cube({p,s,color=wood,onClick,opacity=1}){return <mesh position={p} castShadow receiveShadow onClick={onClick}><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.85} transparent={opacity<1} opacity={opacity}/></mesh>}
function Sphere({p,r=.4,color=forest,onClick}){return <mesh position={p} castShadow onClick={onClick}><sphereGeometry args={[r,16,12]}/><meshStandardMaterial color={color} roughness={.86}/></mesh>}
function Cyl({p,top=.5,bottom=.5,height=.4,color=wood,rot=[0,0,0]}){return <mesh position={p} rotation={rot} castShadow receiveShadow><cylinderGeometry args={[top,bottom,height,24]}/><meshStandardMaterial color={color} roughness={.82}/></mesh>}
function Notice({label,position,color='#543d2b',rotation=[0,0,0]}){return <Text position={position} rotation={rotation} fontSize={.3} maxWidth={4} anchorX="center" anchorY="middle" color={color} outlineWidth={.006} outlineColor="#f5e3bc">{label}</Text>}
function Clickable({children,onClick}){return <group onClick={e=>{e.stopPropagation();onClick?.()}} onPointerOver={()=>{document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>{children}</group>}
function Fireplace(){return <group position={[-15.6,0,-2.3]}>
  <Cube p={[0,1.1,0]} s={[1.55,2.2,.65]} color="#aa8b70"/><Cube p={[0,2.23,.13]} s={[1.95,.21,.83]} color={wood}/><Cube p={[0,.66,.38]} s={[1.13,1.1,.12]} color="#4c3329"/>
  <mesh position={[0,.68,.48]}><coneGeometry args={[.27,.86,8]}/><meshStandardMaterial color="#f3aa50" emissive="#e66f20" emissiveIntensity={1.15}/></mesh>
  <pointLight position={[.45,1.2,1]} intensity={1.6} distance={5} color="#ffae66"/>
  <Notice label="HEARTH LOUNGE" position={[0,2.58,.25]} color="#574129"/>
</group>}
function RecordPlayer(){return <group position={[-11.6,0,-6.8]}>
  <Cube p={[0,.82,0]} s={[1.2,.12,.8]} color="#6b4935"/>
  <Cyl p={[0,.92,0]} top={.3} bottom={.3} height={.03} color="#333136"/>
  <Cyl p={[0,.95,0]} top={.04} bottom={.04} height={.02} color="#c19b53"/>
  <Cube p={[.44,.95,.08]} s={[.08,.06,.38]} color="#c2a06a"/>
  <Cube p={[0,.4,0]} s={[1.15,.75,.73]} color={wood}/>
</group>}
function WritingMemories(){return <group>
  <Cube p={[12,2.8,-7.56]} s={[5.6,2.2,.12]} color="#a47a55"/>
  {[0,1,2,3,4,5].map(i=><Cube key={i} p={[9.85+i*.81,2.7+(i%2)*.28,-7.47]} s={[.55,.54,.03]} color={i%2?'#f0e1c4':'#e8c6a5'}/>)}
  <Cube p={[15.3,.85,-1.3]} s={[1.4,1.7,1.1]} color={wood}/>
  {[0,1,2].map(i=><Cube key={i} p={[15.3,.37+i*.48,-.7]} s={[1.2,.33,.06]} color={light}/>)}
  <Sphere p={[13.2,2.2,1.4]} r={.36} color="#c5a576"/><Cube p={[13.2,1.7,1.4]} s={[.08,.45,.08]} color="#6c593e"/>
  <Notice label="ROOM OF MEMORIES" position={[12,4.8,-6.9]} />
</group>}
function SpiralStair({onEnter}){return <group position={[-5.85,0,4.45]}>
  <Cyl p={[0,2.5,0]} top={.1} bottom={.1} height={5.1} color={wood}/>
  {Array.from({length:13},(_,i)=>{let a=i*.49;return <group key={i} rotation={[0,a,0]}><Cube p={[.7,.18+i*.37,0]} s={[1.44,.12,.68]} color={i%2?light:wood}/></group>})}
  <Clickable onClick={onEnter}><Cyl p={[0,.11,0]} top={1.2} bottom={1.2} height={.12} color="#e4bb81"/><Notice label="▲ 다락방으로 이동" position={[0,2,-1.35]}/></Clickable>
</group>}
function Attic({onExit}){const y=6.4;return <group>
  <Cube p={[-1,y-.16,0]} s={[13,.3,15.4]} color="#b98455"/>
  {[-7.4,7.4].map(z=><Cube key={z} p={[-1,y+1.4,z]} s={[13,2.9,.19]} color={cream}/>)}
  {[-7.1,5.1].map(x=><Cube key={x} p={[x,y+1.4,0]} s={[.2,2.9,15.5]} color={cream}/>)}
  {[-6,-3,0,3,5].map(x=><Cube key={x} p={[x,y+3.05,0]} s={[.15,.16,15]} color={wood}/>)}
  <Cube p={[-1,y+.01,0]} s={[5,.02,4]} color="#c8ac94"/>
  <Cube p={[-2.3,y+.42,-.8]} s={[2,.52,2.4]} color="#e7d2b0"/>
  <Cube p={[.65,y+.3,-1.2]} s={[1,.36,1]} color="#8b9879"/>
  <Cube p={[2.6,y+.46,1.3]} s={[2.2,.85,1.15]} color={wood}/>
  <Cube p={[2.6,y+1.05,1.3]} s={[2.0,.11,1.02]} color="#b58d5d"/>
  <Cube p={[-1,y+1.45,-7.25]} s={[2.3,1.85,.08]} color="#abcbd7" opacity={.7}/>
  <Cube p={[-1,y+1.45,-7.17]} s={[.12,1.9,.16]} color={wood}/>
  <Cube p={[-1,y+1.45,-7.16]} s={[2.3,.12,.16]} color={wood}/>
  <Notice label="STARLIGHT ATTIC" position={[-1,y+2.55,-7.01]}/>
  <Clickable onClick={onExit}><Cube p={[4.6,y+.08,5.15]} s={[1.5,.12,1.4]} color="#e2b87e"/><Notice label="▼ EXIT · 중앙 서재로 돌아가기" position={[4.6,y+1.04,5.15]}/><Cube p={[4.6,y+.14,5.15]} s={[1.6,.15,1.5]} color="#e5ba79"/></Clickable>
  <pointLight position={[-1,y+2.7,0]} intensity={2.0} distance={10} color="#ffd8a1"/>
</group>}
export default function RoomExpansion({onEnter=()=>{}}){return <group>
  <Fireplace/><RecordPlayer/><WritingMemories/>
  <SpiralStair onEnter={()=>onEnter('attic')}/>
  <Attic onExit={()=>onEnter('main')}/>

 </group>}
