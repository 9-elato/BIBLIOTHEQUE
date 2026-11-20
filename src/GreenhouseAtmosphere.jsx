import React,{useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {gardenClimate,gardenRoofY,roofDrop,skyFlake} from './greenhouseClimate'
function Lamp({position,kind,on}){return <group position={position}>
 <B p={[0,kind==='low'?.13:.25,0]} s={[.035,kind==='low'?.26:.5,.035]} c="#b59a59" metal={.65}/>
 <mesh><sphereGeometry args={[kind==='low'?.09:.13,12,8]}/><meshStandardMaterial color="#f1d4a3" emissive="#ffc573" emissiveIntensity={on?2:.05}/></mesh>
 <B p={[0,.15,0]} s={[.26,.04,.26]} c="#a88c50" metal={.65}/><B p={[0,-.15,0]} s={[.22,.04,.22]} c="#a88c50" metal={.65}/>
 <pointLight intensity={on?(kind==='low'?1.8:6):0} color="#ffd19b" distance={kind==='low'?3.5:7} decay={2}/>
 </group>}
function Butterflies(){const ref=useRef();useFrame(({clock})=>{ref.current?.children.forEach((g,i)=>{const t=clock.elapsedTime;g.position.set(Math.sin(t*.22+i*2)*2.8,1.3+Math.sin(t*.7+i)*.4,-10-i*1.9+Math.cos(t*.3+i)*.5);g.rotation.y=t*.22+i;g.children[0].rotation.y=Math.sin(t*9+i)*.9;g.children[1].rotation.y=-Math.sin(t*9+i)*.9})});return <group ref={ref}>{[0,1,2,3].map(i=><group key={i}>{[-1,1].map(a=><group key={a}><mesh position={[a*.09,0,0]} scale={[.1,.16,1]}><circleGeometry args={[1,12]}/><meshStandardMaterial color={i%2?'#e7cd96':'#c2b8de'} side={THREE.DoubleSide}/></mesh></group>)}</group>)}</group>}
function RoofWeather({weather}){
 const drops=useRef(),snow=useRef();const dummy=useMemo(()=>new THREE.Object3D(),[])
 const flakes=useMemo(()=>new Float32Array(180*3),[])
 useFrame(({clock})=>{const t=clock.elapsedTime;if(drops.current){for(let i=0;i<100;i++){dummy.position.set(...roofDrop(i,t));dummy.rotation.set(0,0,i%2?-.37:.37);dummy.scale.set(.027,.012,.065+(i%4)*.018);dummy.updateMatrix();drops.current.setMatrixAt(i,dummy.matrix)}drops.current.instanceMatrix.needsUpdate=true}if(snow.current){const a=snow.current.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setXYZ(i,...skyFlake(i,t));a.needsUpdate=true}})
 if(weather==='rain')return <group><instancedMesh ref={drops} args={[null,null,100]} frustumCulled={false}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#bad9ea" metalness={.25} roughness={.1} transparent opacity={.65}/></instancedMesh>{[-1,1].map(a=><mesh key={a} position={[a*2.7,5.46,-15.55]} rotation={[0,0,-a*.37]}><boxGeometry args={[5.75,.018,17.5]}/><meshPhysicalMaterial color="#9bb8ca" transparent opacity={.10} roughness={.12} metalness={.2} depthWrite={false}/></mesh>)}</group>
 if(weather!=='snow')return null
 return <group><points ref={snow} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[flakes,3]}/></bufferGeometry><pointsMaterial size={.07} color="#edf5ff" transparent opacity={.8} depthWrite={false}/></points>
 {[-1,1].map(a=><group key={a}>{[-7.3,-9,-11,-13,-15,-17,-19,-21,-23.8].map((z,i)=><mesh key={z} position={[a*(i%2?4.7:3.5),gardenRoofY(i%2?4.7:3.5)+.11,z]} rotation={[0,0,-a*.37]} scale={[i%2?.65:1.4,.055,.22]}><sphereGeometry args={[1,16,8]}/><meshStandardMaterial color="#e6edf0" roughness={1}/></mesh>)}<B p={[a*6.9,4.49,-11.1]} s={[3.2,.06,.24]} c="#e5edf1"/></group>)}
 </group>
}
function SunDust({visible}){const ref=useRef();const data=useMemo(()=>Float32Array.from({length:240},(_,i)=>i%3===0?Math.sin(i*12.3)*3:i%3===1?.5+Math.abs(Math.sin(i*9.1))*4:-8-Math.abs(Math.sin(i*7.7))*15),[]);useFrame(({clock})=>{if(ref.current)ref.current.position.x=Math.sin(clock.elapsedTime*.14)*.13});return <points ref={ref} visible={visible}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data,3]}/></bufferGeometry><pointsMaterial color="#ffe8bf" size={.022} transparent opacity={.28} depthWrite={false}/></points>}
export default function GreenhouseAtmosphere({time,weather,active}){
 const c=gardenClimate(time,weather),target=useMemo(()=>{const o=new THREE.Object3D();o.position.set(0,0,-16);return o},[])
 return <group><primitive object={target}/><directionalLight position={c.position} target={target} color={c.color} intensity={active?c.sun:0} castShadow={active} shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-camera-near={.5} shadow-camera-far={40} shadow-bias={-.0003} shadow-normalBias={.025}/>
 <SunDust visible={c.dust}/>{c.butterflies&&<Butterflies/>}<RoofWeather weather={weather}/>
 {[-1,1].map(a=><group key={a}><Lamp position={[a*3.4,4.5,-16]} kind="ceiling" on={c.lamps}/><Lamp position={[a*5.1,2.8,-11.2]} kind="wall" on={c.lamps}/><Lamp position={[a*3.1,.42,-20.1]} kind="low" on={c.lamps}/></group>)}
 {weather==='sunny'&&!c.night&&[-1,1].map(a=><mesh key={a} position={[a*5.27,3.2,-19.4]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[2.7,.045]}/><meshBasicMaterial color={c.color} transparent opacity={.32} side={THREE.DoubleSide} depthWrite={false}/></mesh>)}
 </group>
}
