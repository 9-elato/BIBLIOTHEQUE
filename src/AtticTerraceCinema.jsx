import {ATTIC_SCREEN,ATTIC_SCREEN_SLOPE,atticRoofY} from './atticLayout'
import {useFrame} from '@react-three/fiber'
import React,{useEffect,useMemo,useState,useRef} from 'react'
import {Html} from '@react-three/drei'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {DetailedTelescope} from './AtticComfort'
export default function AtticTerraceCinema({time,weather}){
 const [video,setVideo]=useState(''),[near,setNear]=useState(false),screen=useRef(),last=useRef(false),point=useMemo(()=>new THREE.Vector3(),[])
 useFrame(({camera})=>{if(!screen.current)return;let visible=true;for(let o=screen.current;o;o=o.parent)visible=visible&&o.visible;const next=visible&&camera.position.distanceTo(screen.current.getWorldPosition(point))<20;if(next!==last.current){last.current=next;setNear(next)}})
 useEffect(()=>{const play=e=>setVideo(e.detail||'');window.addEventListener('library-cinema-video',play);return()=>window.removeEventListener('library-cinema-video',play)},[])
 const stars=useMemo(()=>Float32Array.from(Array.from({length:220},(_,i)=>{const a=i*2.399,h=.25+(i%31)/40,r=Math.sqrt(1-h*h)*42;return [Math.cos(a)*r,8+h*42,8+Math.sin(a)*r]}).flat()),[])
 const q=useMemo(()=>new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0,0,1),new THREE.Vector3(-1,ATTIC_SCREEN_SLOPE,0).normalize(),new THREE.Vector3(-ATTIC_SCREEN_SLOPE,-1,0).normalize())),[])
 return <group>
  <B p={[0,-.14,8.75]} s={[7.9,.28,4.3]} c="#775944"/>
  {Array.from({length:23},(_,i)=><B key={i} p={[-3.8+i*.34,.008,8.75]} s={[.32,.025,4.3]} c={i%3?'#967154':'#866047'}/>)}
  {[-3.95,3.95].map(x=><group key={x}><B p={[x,.62,8.8]} s={[.06,1.24,4.2]} c="#d0b998" opacity={.18}/><B p={[x,1.2,8.8]} s={[.1,.12,4.2]} c="#a88551"/>{[6.8,8.8,10.8].map(z=><B key={z} p={[x,.6,z]} s={[.1,1.2,.1]} c="#52483c"/>)}</group>)}
  <B p={[0,1.2,10.85]} s={[8,.12,.1]} c="#a88551"/>
  {Array.from({length:27},(_,i)=><B key={i} p={[-3.95+i*(7.9/26),.6,10.85]} s={[.06,1.2,.06]} c="#52483c"/>)}
  <B p={[2.8,.025,6.6]} s={[1.5,.05,.36]} c="#a18a65"/>
  {[-.55,.55].map(x=><mesh key={'threshold'+x} position={[2.8+x,.065,6.7]}><boxGeometry args={[.15,.015,.035]}/><meshStandardMaterial color="#ead6a3" emissive="#ffcd81" emissiveIntensity={time==='evening'?.7:.05}/></mesh>)}
  {[2,3.6].map(x=><B key={x} p={[x,1.65,6.59]} s={[.1,3.3125,.17]} c="#725339"/>)}
  <B p={[2.8,3.3625,6.59]} s={[1.7,.12,.17]} c="#a88551"/>
  <group position={[.45,0,4.7]}><DetailedTelescope/></group>
  {[-3.5,3.5].map(x=><mesh key={x} position={[x,.12,10.3]}><boxGeometry args={[.22,.18,.22]}/><meshStandardMaterial color="#e9c58b" emissive="#ffc778" emissiveIntensity={time==='evening'?1.5:.15}/></mesh>)}
  {time==='evening'&&weather!=='rain'&&weather!=='snow'&&<points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial size={.085} color="#fff0d1" sizeAttenuation/></points>}
  {/* Suspended frame follows the roof slope and stays above the circulation aisle. */}
  {[-1.85,1.85].map(z=>{const top=atticRoofY(ATTIC_SCREEN[0])-.06,h=top-ATTIC_SCREEN[1];return <B key={'hanger'+z} p={[ATTIC_SCREEN[0],(top+ATTIC_SCREEN[1])/2,ATTIC_SCREEN[2]+z]} s={[.025,h,.025]} c="#8a7755"/>})}
  <group ref={screen} position={ATTIC_SCREEN} quaternion={q}>
   <B p={[0,0,-.06]} s={[4.65,2.7,.12]} c="#352f2a"/>
   <mesh><planeGeometry args={[4.48,2.52]}/><meshBasicMaterial color={video?'#ffffff':'#ddd6bf'}/></mesh>
   {video&&near&&<Html transform position={[0,0,.015]} scale={.14} occlude={false}><iframe title="다락 빔 스크린" width="1280" height="720" src={`https://www.youtube.com/embed/${video}?playsinline=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{border:0,display:'block'}}/></Html>}
  </group>
  <B p={[-.9,(atticRoofY(-.9)+2.81)/2,-.4]} s={[.035,atticRoofY(-.9)-2.81,.035]} c="#8a7755"/>
  <B p={[-.9,2.7,-.4]} s={[.5,.22,.35]} c="#403d38"/>
 </group>
}
