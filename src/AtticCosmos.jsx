import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {CarvedBox as B,Folios} from './StorybookDecor'
function Orb({p,r=.05,c='#c5a468'}){return <mesh position={p}><sphereGeometry args={[r,12,8]}/><meshStandardMaterial color={c} roughness={.65}/></mesh>}
export default function AtticCosmos({time,textures}){
 const night=['night','evening'].includes(time),moon=useRef(),light=useRef()
 const tail=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.45,.07,0),new THREE.Vector3(.9,.36,0),new THREE.Vector3(1.3,.42,0)]),[])
 useFrame(({clock})=>{moon.current.rotation.z=.14+Math.sin(clock.elapsedTime*.3)*.05;light.current.intensity=(night?4:1.2)*(1+Math.sin(clock.elapsedTime*.15)*.12)})
 return <group>
  {/* All additions sit on existing furniture or above walking headroom. */}
  <mesh position={[-4.035,2.63,-.4]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[3.7,1.65]}/><meshStandardMaterial map={textures.wallpaper} color="#a7b79c" roughness={1}/></mesh>
  <mesh position={[0,2.43,-6.205]}><planeGeometry args={[7.7,2.0]}/><meshStandardMaterial map={textures.wallpaper} roughness={1}/></mesh>

  <group position={[-3.96,2.9,1.3]} rotation={[0,Math.PI/2,0]}>
   <B s={[1.15,.82,.06]} c="#a58b57"/><B p={[0,0,.04]} s={[1.02,.70,.02]} c="#e1d4b4"/>
   {[-.28,0,.27].map((x,i)=><group key={x}><B p={[x,-.04,.065]} s={[.012,.4,.008]} c="#697658" rot={[0,0,i*.12]}/>{[-1,1].map(a=><mesh key={a} position={[x+a*.055,.04,.07]} rotation={[0,0,a*.5]}><circleGeometry args={[.07,12]}/><meshStandardMaterial color="#87916c"/></mesh>)}</group>)}
  </group>
  <group position={[2.6,1.3,-5.35]}>
   <B p={[-.35,.014,.13]} s={[.75,.02,.42]} c="#d6c59e" rot={[0,.17,0]}/><B p={[-.2,.032,.13]} s={[.34,.006,.01]} c="#8d7659" rot={[0,.6,0]}/>
   <mesh position={[-.55,.08,.04]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[.11,.11,.06,24]}/><meshStandardMaterial color="#b79a58" metalness={.7}/></mesh><B p={[-.55,.12,.04]} s={[.015,.012,.16]} c="#724c53" rot={[0,.45,0]}/>
   <B p={[.48,.16,-.12]} s={[.35,.25,.17]} c="#493e38"/><mesh position={[.48,.16,-.015]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.085,.085,.10,20]}/><meshStandardMaterial color="#bda572" metalness={.65}/></mesh>
   <group position={[.1,.05,.2]}>{[0,1,2,3,4].map(i=><mesh key={i} position={[i*.025,0,0]} rotation={[0,0,i*.18]}><sphereGeometry args={[.08,12,8]}/><meshStandardMaterial color={i%2?'#d6bfa9':'#eee0c8'}/></mesh>)}</group>
  </group>
  <group position={[0,1.72,-5.7]}><Folios p={[.55,0,0]}/><B p={[-.1,.03,.05]} s={[.38,.04,.30]} c="#dacbac" rot={[0,-.22,0]}/><B p={[-.1,.055,.05]} s={[.26,.006,.015]} c="#aa807c"/>
   <mesh position={[-.65,.18,0]}><cylinderGeometry args={[.12,.12,.35,16]}/><meshPhysicalMaterial color="#c5e1d0" transparent opacity={.25} roughness={.2}/></mesh><Orb p={[-.65,.14,0]} r={.085} c="#847797"/>
  </group>
  {/* A small home made of books, with a paper roof and bookmark curtain. */}
  <group position={[-1.05,1.7,-5.6]}><Folios p={[0,0,0]}/><B p={[-.2,.37,0]} s={[.09,.32,.36]} c="#7c5261"/><B p={[.2,.37,0]} s={[.09,.32,.36]} c="#697f6e"/><B p={[-.12,.58,0]} s={[.32,.045,.44]} c="#c9b985" rot={[0,0,.42]}/><B p={[.12,.58,0]} s={[.32,.045,.44]} c="#c9b985" rot={[0,0,-.42]}/>{[-.1,0,.1].map(x=><B key={x} p={[x,.41,.2]} s={[.065,.22,.012]} c="#e9dfc3" rot={[0,0,x]}/>)}</group>
  <group position={[2.85,3.95,-3.9]} rotation={[0,-.4,0]}><B p={[0,.75,0]} s={[.016,1.5,.016]} c="#9a8050"/><group ref={moon}><mesh rotation={[0,0,.85]}><torusGeometry args={[.34,.075,12,40,4.5]}/><meshStandardMaterial color="#f5d89a" emissive="#ffcc77" emissiveIntensity={night?1.6:.6}/></mesh><Orb p={[.12,-.05,0]} r={.035}/></group><pointLight ref={light} position={[0,-.1,.15]} color="#ffd396" distance={6}/></group>
  <group position={[.4,4.7,1.3]} rotation={[0,0,.15]}><mesh><sphereGeometry args={[.1,16,12]}/><meshStandardMaterial color="#dceaff" emissive="#94bfff" emissiveIntensity={night?2:.7}/></mesh><mesh><tubeGeometry args={[tail,24,.026,8,false]}/><meshStandardMaterial color="#c1d4f0" emissive="#9fb8e5" emissiveIntensity={.6}/></mesh><B p={[.65,.75,0]} s={[.012,1.1,.012]} c="#ac9161"/></group>
  <group position={[-1.15,3.6,4.7]}><mesh rotation={[.3,0,Math.PI/2]}><torusGeometry args={[.4,.015,8,40]}/><meshStandardMaterial color="#b79858" metalness={.65}/></mesh>{[0,1,2,3,4].map(i=><group key={i} position={[Math.cos(i*1.3)*.37,-.12-i*.09,Math.sin(i*1.3)*.2]}><B p={[0,.16,0]} s={[.008,.3,.008]} c="#b79858"/><Orb r={.045+i*.009} c={['#ab858d','#b2b99b','#8eacc0','#d1b779','#a496be'][i]}/></group>)}</group>
 </group>
}
