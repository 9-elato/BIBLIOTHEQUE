import {ATTIC_SCREEN,ATTIC_SCREEN_SLOPE,atticRoofY} from './atticLayout'
import {useFrame} from '@react-three/fiber'
import React,{useEffect,useMemo,useState,useRef} from 'react'
import {Html} from '@react-three/drei'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import CozyTerrace from './CozyTerrace'
import StaticBatch from './StaticBatch'
export default function AtticTerraceCinema({time,weather}){
 const [video,setVideo]=useState(''),[near,setNear]=useState(false),screen=useRef(),last=useRef(false),poll=useRef(0),point=useMemo(()=>new THREE.Vector3(),[])
 // Only the embedded movie needs a proximity check; the static screen does not.
 useFrame(({camera},dt)=>{if(!video||!screen.current)return;poll.current+=dt;if(poll.current<.1)return;poll.current=0;let visible=true;for(let o=screen.current;o;o=o.parent)visible=visible&&o.visible;const next=visible&&camera.position.distanceToSquared(screen.current.getWorldPosition(point))<400;if(next!==last.current){last.current=next;setNear(next)}})
 useEffect(()=>{const play=e=>setVideo(e.detail||'');window.addEventListener('library-cinema-video',play);return()=>window.removeEventListener('library-cinema-video',play)},[])
 const stars=useMemo(()=>Float32Array.from(Array.from({length:220},(_,i)=>{const a=i*2.399,h=.25+(i%31)/40,r=Math.sqrt(1-h*h)*42;return [Math.cos(a)*r,8+h*42,8+Math.sin(a)*r]}).flat()),[])
 const q=useMemo(()=>new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0,0,1),new THREE.Vector3(-1,ATTIC_SCREEN_SLOPE,0).normalize(),new THREE.Vector3(-ATTIC_SCREEN_SLOPE,-1,0).normalize())),[])
 return <group>
  <CozyTerrace time={time}/>
  <StaticBatch revision={time}>
  <B p={[0,-.14,8.75]} s={[15.8,.28,4.3]} c="#775944"/>
  {Array.from({length:46},(_,i)=><B key={i} p={[-7.65+i*.34,.008,8.75]} s={[.32,.025,4.3]} c={i%3?'#967154':'#866047'}/>)}
  {[-7.9,7.9].map(x=><group key={x}><B p={[x,.62,8.8]} s={[.06,1.24,4.2]} c="#d0b998" opacity={.18}/><B p={[x,1.2,8.8]} s={[.1,.12,4.2]} c="#a88551"/>{[6.8,8.8,10.8].map(z=><B key={z} p={[x,.6,z]} s={[.1,1.2,.1]} c="#52483c"/>)}</group>)}
  <B p={[0,1.2,10.85]} s={[15.9,.12,.1]} c="#a88551"/>
  {Array.from({length:53},(_,i)=><B key={i} p={[-7.9+i*(15.8/52),.6,10.85]} s={[.06,1.2,.06]} c="#52483c"/>)}
  {[-5.9,5.9].map(x=><B key={'rear-guard'+x} p={[x,.6,6.65]} s={[4,1.2,.10]} c="#775944"/>)}
  <B p={[0,-.045,6.57]} s={[7.9,.09,.38]} c="#a18a65"/>

  {[-3.5,3.5].map(x=><mesh key={x} position={[x,.12,10.3]}><boxGeometry args={[.22,.18,.22]}/><meshStandardMaterial color="#e9c58b" emissive="#ffc778" emissiveIntensity={time==='evening'?1.5:.15}/></mesh>)}
  </StaticBatch>
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
