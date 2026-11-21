import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {CarvedBox as B} from './StorybookDecor'
function Cushion({p,s,c='#cdbfa5',rotation=[0,0,0]}){return <mesh position={p} scale={s} rotation={rotation} castShadow receiveShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color={c} roughness={1}/></mesh>}
export function Beanbag({item}){
 return <group position={[item.x,item.level,item.z]} rotation={[0,item.turn,0]}>
  <Cushion p={[0,.27,0]} s={[.59,.28,.49]} c={item.color}/>
  <Cushion p={[0,.39,.10]} s={[.48,.12,.35]} c={item.color}/>
  <Cushion p={[0,.57,-.24]} s={[.54,.43,.27]} c={item.color} rotation={[-.2,0,0]}/>
  {[-1,1].map(a=><Cushion key={a} p={[a*.44,.39,-.02]} s={[.15,.25,.36]} c={item.color}/>)}
  <mesh position={[0,.19,0]} rotation={[Math.PI/2,0,0]} scale={[1,.81,1]}><torusGeometry args={[.54,.008,4,48]}/><meshStandardMaterial color="#b59a77" roughness={1}/></mesh>
  <B p={[.40,.58,-.12]} s={[.09,.025,.12]} c="#c5ac8d" r={.01}/>
 </group>
}
export function CreamRugs(){
 const map=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#d5c6ad';x.fillRect(0,0,256,256);for(let i=0;i<11000;i++){const a=(i*73.31)%256,b=(i*137.17)%256;x.strokeStyle=i%3?'#eee4cf':'#bcae94';x.lineWidth=.7;x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+2,b-3,a+4,b-1);x.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,7);t.colorSpace=THREE.SRGBColorSpace;return t},[])
 useEffect(()=>()=>map.dispose(),[map])
 return <group>{[[.4,-1.3,5.5,5.9],[-2.3,4.35,2.5,2.7]].map(([x,z,w,h])=><group key={z} position={[x,.055,z]}><B s={[w,.055,h]} c="#d8cbb3" r={.07}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,.032,0]}><planeGeometry args={[w-.06,h-.06]}/><meshStandardMaterial map={map} bumpMap={map} bumpScale={.024} color="#fff5df" roughness={1}/></mesh></group>)}</group>
}
export function SofaBed(){return <group>
 <B p={[-1.95,.43,0]} s={[2.45,.43,2.65]} c="#80684f" r={.11}/>
 <B p={[-1.95,.75,0]} s={[2.40,.35,2.55]} c="#d6c8af" r={.16}/>
 <B p={[-3.08,1.05,0]} s={[.28,1.08,2.65]} c="#b5a68c" r={.13}/>
 {[-1,1].map(a=><group key={a}><B p={[-1.95,.89,a*1.26]} s={[2.4,.62,.23]} c="#b9a88d" r={.11}/><Cushion p={[-2.80,1.18,a*.64]} s={[.20,.42,.48]} c={a<0?'#8e766e':'#a1a587'} rotation={[0,0,-.16]}/></group>)}
 </group>}
function Rod({a,b,r=.025,c='#353c3c'}){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return <mesh position={new THREE.Vector3(...a).addScaledVector(d,.5)} quaternion={q} castShadow><cylinderGeometry args={[r,r,d.length(),10]}/><meshStandardMaterial color={c} metalness={.6} roughness={.32}/></mesh>}
export function DetailedTelescope(){return <group position={[-1.65,0,4.6]}>
 {[0,1,2].map(i=>{const a=i*Math.PI*2/3;return <group key={i}><Rod a={[0,1.28,0]} b={[Math.sin(a)*.5,.08,Math.cos(a)*.5]} r={.032} c="#9a9280"/><Rod a={[0,.55,0]} b={[Math.sin(a)*.33,.45,Math.cos(a)*.33]} r={.018}/><Cushion p={[Math.sin(a)*.5,.065,Math.cos(a)*.5]} s={[.06,.05,.06]} c="#303536"/></group>})}
 <mesh position={[0,1.35,0]}><cylinderGeometry args={[.14,.17,.20,20]}/><meshStandardMaterial color="#3b4244" metalness={.5} roughness={.3}/></mesh>
 <Rod a={[0,1.42,0]} b={[-.08,1.65,0]} r={.09}/>
 <group position={[-.08,1.75,0]} rotation={[0,0,.75]}>
 <mesh><cylinderGeometry args={[.20,.18,.95,32]}/><meshStandardMaterial color="#b17442" metalness={.4} roughness={.32}/></mesh>
 {[-.38,.38].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.218,.218,.08,24]}/><meshStandardMaterial color="#303b42" metalness={.65} roughness={.22}/></mesh>)}
 <mesh position={[0,.49,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.183,32]}/><meshPhysicalMaterial color="#355a71" metalness={.5} roughness={.1} clearcoat={1}/></mesh>
 <Rod a={[0,-.47,0]} b={[0,-.70,0]} r={.065}/><Rod a={[0,-.69,0]} b={[0,-.69,.14]} r={.045}/>
 <Rod a={[.25,-.12,0]} b={[.25,.27,0]} r={.04} c="#474b42"/>
 <Rod a={[0,-.35,0]} b={[.27,-.35,0]} r={.025}/><Cushion p={[.28,-.35,0]} s={[.045,.075,.075]} c="#363c3d"/>
 </group>
 <Rod a={[.08,1.4,0]} b={[.3,1.05,.26]} r={.02}/>
 </group>}
