import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import StaticBatch from './StaticBatch'
import {Box as B} from './GroundFloor'
import {BookCoverMesh} from './BookCover'
function Glow({p,s}){return <mesh position={p}><boxGeometry args={s}/><meshStandardMaterial color="#f4d7a4" emissive="#e9b46d" emissiveIntensity={.7}/></mesh>}
function ComingSoon({position}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=256;c.height=384;const x=c.getContext('2d');x.fillStyle='#263536';x.fillRect(0,0,256,384);x.strokeStyle='#b9a27c';x.strokeRect(14,14,228,356);x.fillStyle='#dbc8a5';x.textAlign='center';x.font='20px Georgia, serif';x.fillText('유령단 작은 극장',128,84);x.font='52px Georgia, serif';x.fillText('✦',128,190);x.font='18px Georgia, serif';x.fillText('다음 이야기를',128,280);x.fillText('기다립니다',128,308);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={position} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.15,1.65]}/><meshBasicMaterial map={texture}/></mesh>
}
export default function CafeCinema({config}){
 const stars=useMemo(()=>new Float32Array(Array.from({length:100},(_,i)=>[-29+((i*73)%127)/127*12,6.88,24.9+((i*37)%113)/113*5.3]).flat()),[])
 const posters=[config.filmPoster,...(Array.isArray(config.posterGallery)?config.posterGallery:[]),config.eventPoster].filter(Boolean).slice(0,6)
 return <group>
 <StaticBatch>
  <B p={[-23,.012,27.7]} s={[13.5,.025,6]} c="#342b2a"/>
  <B p={[-23,6.97,27.7]} s={[13.6,.08,6.3]} c="#171e29"/>
  {[24.65,30.65].map(z=><Glow key={z} p={[-23,6.8,z]} s={[13.3,.10,.10]}/>)}
  {[-29.65,-16.35].map(x=><Glow key={x} p={[x,6.8,27.65]} s={[.10,.10,6]}/>)}
  {[-28,-25,-22].map(x=><group key={x}>
   {[-.51,.51].map(dx=><B key={dx} p={[x+dx,.72,27]} s={[.18,.5,.95]} c="#493b35"/>)}
   <Glow p={[x,.08,27]} s={[1.12,.055,.88]}/>
   <mesh position={[x,1.04,27.36]} scale={[.48,.31,.11]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#68564b" roughness={.87}/></mesh>
  </group>)}
  <B p={[-26,.57,30.35]} s={[5.2,1.14,.65]} c="#352f2b"/>
  {[1.2,2.15,3.1].map((y,row)=><group key={y}>
   <B p={[-26,y,30.35]} s={[5.3,.09,.72]} c="#a68b64"/><Glow p={[-26,y-.06,30.02]} s={[5.1,.03,.025]}/>
   {Array.from({length:9},(_,i)=><group key={i} position={[-28.15+i*.53,y+.24,30.35]}>
    <mesh><cylinderGeometry args={[.13,.13,.38,10]}/><meshStandardMaterial color={['#be9258','#b4a079','#9c6750'][(i+row)%3]} roughness={.44}/></mesh>
    <B p={[0,.21,0]} s={[.27,.04,.27]} c="#d5c3a3"/>
   </group>)}
  </group>)}
  {[0,1,2,3,4,5].map(i=><group key={i} position={[-29.79,1.8+Math.floor(i/3)*2.05,25.6+(i%3)*1.9]}>
   <B p={[0,0,0]} s={[.16,1.86,1.35]} c="#23272b"/>
   <B p={[.09,0,0]} s={[.025,1.72,1.21]} c="#c3b491"/>
  </group>)}
 </StaticBatch>
 <points frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial color="#ffe1ab" size={.045} sizeAttenuation transparent opacity={.8} depthWrite={false}/></points>
 {Array.from({length:6-posters.length},(_,n)=>{const i=posters.length+n;return <ComingSoon key={i} position={[-29.68,1.8+Math.floor(i/3)*2.05,25.6+(i%3)*1.9]}/>})}
 {posters.map((url,i)=><BookCoverMesh key={i} url={url} position={[-29.68,1.8+Math.floor(i/3)*2.05,25.6+(i%3)*1.9]} rotation={[0,Math.PI/2,0]} size={[1.15,1.65]}/>)}
 </group>
}
