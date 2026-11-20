import React from 'react'
import {RoundedBox} from '@react-three/drei'
import * as THREE from 'three'
export function CarvedBox({p=[0,0,0],s,c='#624331',r=.035,rot=[0,0,0],metal=0,finish}){
 return <RoundedBox position={p} args={s} radius={Math.min(r,...s.map(v=>v*.35))} smoothness={2} rotation={rot} castShadow receiveShadow>{finish?<meshPhysicalMaterial color={c} metalness={metal} {...finish}/>:<meshStandardMaterial color={c} roughness={metal?.36:.82} metalness={metal}/>}</RoundedBox>
}
export function ReadingChair({item,finish}){
 const {x,z,level,turn,color}=item
 return <group position={[x,level,z]} rotation={[0,turn,0]}>
  {[-.46,.46].flatMap(a=>[-.34,.34].map(b=><group key={`${a}/${b}`}>
   <mesh position={[a,.23,b]} castShadow><cylinderGeometry args={[.065,.095,.46,12]}/><meshStandardMaterial color="#513629"/></mesh>
   <CarvedBox p={[a,.10,b]} s={[.15,.07,.15]} c="#b39562" metal={.5}/>
  </group>))}
  <CarvedBox p={[0,.42,0]} s={[1.22,.18,.98]}/>
  <CarvedBox p={[0,.545,.06]} s={[1.08,.15,.88]} c={color} finish={finish} r={.065}/>
  <CarvedBox p={[0,1.12,-.41]} s={[1.22,1.19,.17]}/>
  <CarvedBox p={[0,1.13,-.30]} s={[1.03,1.04,.16]} c={color} finish={finish} r={.07}/>
  {[-.53,.53].map(a=><group key={a}>
   <CarvedBox p={[a,.8,.03]} s={[.16,.45,.96]} c={color} finish={finish} r={.06}/>
   <CarvedBox p={[a,1.02,.06]} s={[.19,.10,.99]} c="#79543a"/>
   <CarvedBox p={[a,1.37,-.22]} s={[.16,.55,.32]} c={color} finish={finish} r={.07}/>
   {[.97,1.32].map(y=><mesh key={y} position={[a*.5,y,-.205]}><sphereGeometry args={[.027,10,8]}/><meshStandardMaterial color="#c6a26a" metalness={.4} roughness={.5}/></mesh>)}
  </group>)}
  <CarvedBox p={[0,.59,.505]} s={[.95,.012,.012]} c="#d4ba8b"/>
 </group>
}
export function AntiqueLamp({p,banker=false,time='afternoon',scale=1}){
 return <group position={p} scale={scale}>
  <mesh position={[0,.04,0]}><cylinderGeometry args={[.17,.22,.08,20]}/><meshStandardMaterial color="#a3824c" metalness={.6} roughness={.35}/></mesh>
  <CarvedBox p={[0,.32,0]} s={[.035,.56,.035]} c="#b1945c" metal={.6}/>
  {banker?<mesh position={[0,.64,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.17,.17,.6,24,1,true,0,Math.PI]}/><meshStandardMaterial color="#2c5945" side={THREE.DoubleSide} roughness={.3}/></mesh>:<mesh position={[0,.65,0]}><cylinderGeometry args={[.16,.29,.36,24,1,true]}/><meshStandardMaterial color="#e6cfab" side={THREE.DoubleSide} emissive="#f4bc74" emissiveIntensity={.2} roughness={.9}/></mesh>}
  <mesh position={[0,.55,0]}><sphereGeometry args={[.07,12,8]}/><meshStandardMaterial color="#ffe7b7" emissive="#ffd393" emissiveIntensity={1.4}/></mesh>
  <pointLight position={[0,.52,.10]} color="#ffdaa0" intensity={time==='evening'?5:3.5} distance={5} decay={2}/>
 </group>
}
export function WovenRug({p,size=[4,5],color='#556354'}){
 return <group position={p}>
  <CarvedBox s={[size[0],.018,size[1]]} c="#704b48" r={.006}/>
  <CarvedBox p={[0,.012,0]} s={[size[0]-.16,.009,size[1]-.16]} c="#b09467" r={.003}/>
  <CarvedBox p={[0,.02,0]} s={[size[0]-.28,.009,size[1]-.28]} c={color} r={.003}/>
  {[-1,1].flatMap(a=>Array.from({length:15},(_,i)=><CarvedBox key={`${a}/${i}`} p={[(i-7)*(size[0]-.2)/15,.005,a*(size[1]/2+.07)]} s={[.025,.012,.16]} c="#c1aa83"/>))}
  {[-1,0,1].map(i=><CarvedBox key={i} p={[0,.03,i*size[1]*.25]} s={[.43,.012,.43]} c="#b29a6a" rot={[0,Math.PI/4,0]}/>)}
 </group>
}
export function Folios({p,tidy=false}){return <group position={p}>{['#566c60','#8a5a4c','#b59c76'].map((c,i)=><group key={c} position={[0,i*.075,0]} rotation={[0,tidy?0:i*.09,0]}><CarvedBox s={[.48,.065,.33]} c={c}/><CarvedBox p={[.025,0,.17]} s={[.4,.035,.008]} c="#decdaa"/></group>)}</group>}
export function Quill({p}){return <group position={p}><CarvedBox p={[0,.065,0]} s={[.13,.13,.13]} c="#314e49"/><mesh position={[.06,.30,0]} rotation={[0,0,-.35]}><coneGeometry args={[.045,.40,5]}/><meshStandardMaterial color="#ecddbc"/></mesh></group>}
export function WallSconce({p,turn=0,time}){return <group position={p} rotation={[0,turn,0]}><CarvedBox s={[.19,.42,.07]} c="#ab8952" metal={.5}/><CarvedBox p={[0,-.07,.17]} s={[.045,.045,.32]} c="#b69860" metal={.5}/><group position={[0,-.28,.28]} scale={.55}><AntiqueLamp p={[0,0,0]} time={time}/></group></group>}
