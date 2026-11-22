import React,{useState} from 'react'
import {useFrame} from '@react-three/fiber'
import {CarvedBox as B,Quill} from './StorybookDecor'
import {DESKS} from './layout'

function Pendant({p,color='#76543c',time,large=false,lit=false}){const r=large?1.12:.39;return <group position={p}>
 <B p={[0,.5,0]} s={[.035,1,.035]} c="#ad8c56" metal={.6}/>
 <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,.045,8,40]}/><meshStandardMaterial color="#a98752" metalness={.65} roughness={.4}/></mesh>
 {Array.from({length:large?8:4},(_,i)=>{const a=i*Math.PI*2/(large?8:4);return <group key={i} position={[Math.cos(a)*r,0,Math.sin(a)*r]}>
  <B p={[0,.13,0]} s={[.07,.31,.07]} c="#c3a66c" metal={.4}/>
  <mesh position={[0,.34,0]}><sphereGeometry args={[large?.10:.075,12,8]}/><meshStandardMaterial color="#ffe9c2" emissive="#ffd39a" emissiveIntensity={1.3}/></mesh>
 </group>})}
 {!large&&<mesh position={[0,-.08,0]}><cylinderGeometry args={[.26,.4,.32,20,1,true]}/><meshStandardMaterial color={color} side={2} roughness={.8}/></mesh>}
 {lit&&<pointLight position={[0,-.1,0]} color="#ffe0ad" intensity={time==='evening'?7:5} distance={large?9:6}/>}
 </group>}

function Print({p,turn=0,color='#64756a',kind=0}){return <group position={p} rotation={[0,turn,0]}>
 <B s={[.93,1.16,.08]} c="#a88651"/><B p={[0,0,.05]} s={[.8,1.03,.025]} c="#e2cfac"/>
 <B p={[0,0,.07]} s={[.7,.9,.012]} c={color}/>
 <mesh position={[.1,.16,.083]}><circleGeometry args={[kind?.18:.13,24]}/><meshStandardMaterial color="#d8bd83"/></mesh>
 {[-.2,0,.2].map((x,i)=><B key={x} p={[x,-.17+i*.04,.084]} s={[.12,.3,.012]} c="#364f49" rot={[0,0,(i-1)*.18]}/>)}
 </group>}

export default function MainRoomDetails({layout,time,zone}){
 const [nearest,setNearest]=useState(-1)
 useFrame(({camera})=>{if(zone!=='서가')return;let index=0;layout.sections.forEach((s,i)=>{if(Math.abs(s.start-camera.position.x)<Math.abs(layout.sections[index].start-camera.position.x))index=i});if(index!==nearest)setNearest(index)})
 return <group>

 <Pendant p={[0,8.6,1]} large time={time} lit={zone==='중앙 홀'}/>
 {/* Carved table apron and brass corner details stay inside its collision bounds. */}
 {[-1,1].map(a=><group key={a}>
  <B p={[a*1.92,.88,1.75]} s={[.07,.18,2.42]} c="#ad8d57"/>
  <B p={[0,.87,1.75+a*1.19]} s={[3.8,.2,.07]} c="#624331"/>
  {[-1.3,-.65,0,.65,1.3].map(x=><mesh key={x} position={[x,.87,1.75+a*1.24]} scale={[1.8,1,.35]}><sphereGeometry args={[.055,12,8]}/><meshStandardMaterial color="#ad8d57" metalness={.4} roughness={.5}/></mesh>)}
 </group>)}
 {[-1,1].map(a=><group key={a}>
  <Print p={[a*4.2,2.8,-6.62]} color={a<0?'#526e66':'#6c5866'} kind={a<0?0:1}/>
  <B p={[a*4.2,3.55,-6.55]} s={[1.05,.08,.08]} c="#a48b5e"/>
 </group>)}
 {/* Ceiling and framed botanical prints give the north corridor an enclosed scale. */}
 <B p={[0,4.45,-9.96]} s={[4.5,.16,6.35]} c="#cbb697"/>
 <B p={[0,4.45,-14.03]} s={[9.5,.16,1.9]} c="#cbb697"/>
 <B p={[0,4.03,-15.03]} s={[9.5,.82,.16]} c="#c4ad8e"/>
 {[-7.4,-9.6,-11.8].map(z=><group key={z}>
  <B p={[0,4.29,z]} s={[4.45,.17,.16]} c="#79573b"/>
  <B p={[0,4.18,z]} s={[4.45,.045,.24]} c="#b19a6e"/>
 </group>)}
 {[-1,1].map(a=><Print key={a} p={[a*2.075,2.5,-10]} turn={-a*Math.PI/2} color={a<0?'#65765e':'#70604f'}/>)}
 {DESKS.map(([x,z])=><group key={`${x}/${z}`}>
  <B p={[x,.76,z+.39]} s={[1.85,.13,.045]} c="#b08d58"/>
  <Quill p={[x+.78,.95,z+.15]}/>
  {[-.835,.835].map(a=><B key={a} p={[x+a,.2,z+.28]} s={[.2,.10,.2]} c="#a28155"/>)}
 </group>)}
 <B p={[(layout.end+7.15)/2,8.95,0]} s={[layout.end-7.15,.16,11.7]} c="#cbb697"/>
 {layout.sections.map(({genre,start,cases},i)=><group key={genre.id}>
  <B p={[start,8.8,0]} s={[.16,.17,11.5]} c={genre.trim}/>
  <Pendant p={[start,7.6,0]} color={genre.wood} time={time} lit={zone==='서가'&&i===nearest}/>
  {[-1].map(a=><group key={a}>
   <B p={[start,4.86,a*4.8]} s={[3.1,.10,.34]} c={genre.trim}/>
   <Print p={[start,2.4,a*5.69]} turn={a>0?Math.PI:0} color={genre.wood} kind={i%2}/>
  </group>)}
  {/* Small bookends sit on shelf ledges, never in the central aisle. */}
  {cases.map(c=><group key={c.number} position={[c.x,0,c.z]} rotation={[0,c.z>0?Math.PI:0,0]}>
   {[-1.14,1.14].map(a=><group key={a}><B p={[a,3.04,.1]} s={[.08,.43,.3]} c={genre.plate}/><B p={[a*.94,2.83,.1]} s={[.22,.06,.31]} c={genre.plate}/></group>)}
  </group>)}
 </group>)}
 </group>}
