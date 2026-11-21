import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {CarvedBox as B} from './StorybookDecor'
export function OceanWindow({p,turn=0,w,h=5.2,time,weather}){
 const map=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d'),night=['night','evening'].includes(time),rain=weather==='rain';const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,night?'#172c4c':rain?'#708899':'#8dbed3');g.addColorStop(.48,night?'#bd9c9c':'#efe5ce');g.addColorStop(.49,night?'#324b66':'#659fae');g.addColorStop(1,night?'#173342':'#396f7d');x.fillStyle=g;x.fillRect(0,0,1024,512);x.fillStyle=night?'#f1e7ca':'#fff0c6';x.beginPath();x.arc(680,160,27,0,7);x.fill();for(let i=0;i<260;i++){const a=(i*137.7)%1024,b=260+(i*31.3)%250;x.strokeStyle=i%3?'#a8c4c3':'#d7d9c3';x.globalAlpha=.16+(i%5)*.035;x.lineWidth=1+(b-250)/170;x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+17,b-3,a+35+(b-250)/5,b);x.stroke()}x.globalAlpha=1;x.fillStyle=night?'#263a48':'#8aacae';x.beginPath();x.moveTo(0,255);x.lineTo(70,223);x.lineTo(140,238);x.lineTo(240,252);x.fill();if(weather==='snow'||rain){x.strokeStyle='#dfebed';x.globalAlpha=.35;for(let i=0;i<100;i++){const a=(i*113)%1024,b=(i*73)%512;x.beginPath();x.moveTo(a,b);x.lineTo(a-2,b+(rain?12:2));x.stroke()}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[time,weather])
 useEffect(()=>()=>map.dispose(),[map])
 return <group position={p} rotation={[0,turn,0]}><mesh><planeGeometry args={[w,h]}/><meshBasicMaterial map={map}/></mesh>{[-1,1].map(a=><group key={a}><B p={[a*w/2,0,.055]} s={[.12,h+.2,.16]} c="#3d332c"/><B p={[0,a*h/2,.055]} s={[w,.12,.16]} c="#3d332c"/></group>)}<mesh position={[0,0,.07]}><planeGeometry args={[w-.05,h-.05]}/><meshStandardMaterial color="#b7d6db" transparent opacity={.035} roughness={.15} metalness={.15} depthWrite={false}/></mesh></group>
}
export default function CoastalStudy({time,weather,onMusic}){return <group>
 <OceanWindow p={[0,4.10,-29.30]} w={13.7} time={time} weather={weather}/>
 <OceanWindow p={[-6.91,4.10,-25.28]} turn={Math.PI/2} w={8.02} time={time} weather={weather}/>
 <B p={[0,.91,-28.75]} s={[13.7,.18,.9]} c="#715039"/>
 <B p={[-6.45,.91,-24.80]} s={[.92,.18,7.9]} c="#715039"/>
 {[-5.7,-3.9,3.9,5.7].map(x=><group key={x}><B p={[x,.43,-28.75]} s={[1.3,.86,.8]} c="#493429"/>{[.25,.55,.8].map(y=><B key={y} p={[x,y,-28.31]} s={[.22,.025,.03]} c="#b2935d"/>)}</group>)}
 {[-27.5,-24.7,-21.5].map(z=><B key={z} p={[-6.45,.43,z]} s={[.8,.86,.7]} c="#4c382b"/>)}
 <group position={[6.53,0,-26.3]} rotation={[0,-Math.PI/2,0]}>
  <B p={[0,.56,0]} s={[4.1,1.12,.85]} c="#3e3027"/><B p={[0,1.17,0]} s={[4.25,.13,.95]} c="#8b6746"/>
  {Array.from({length:38},(_,i)=><B key={i} p={[-1.9+i*.067,.57,.44]} s={[.035,.76,.045]} c={['#aa8a66','#716e65','#52665e','#8f5b56'][i%4]}/>)}
  {[1.65,2.65,3.65].map((y,row)=><group key={y}><B p={[0,y,-.08]} s={[4.3,.10,.46]} c="#876244"/><B p={[0,y+.065,.14]} s={[4.1,.02,.025]} c="#f0ca85"/><mesh position={[0,y+.05,.17]}><boxGeometry args={[4.12,.015,.02]}/><meshBasicMaterial color="#ffd99a"/></mesh>{[0,1,2,3,4].map(i=><group key={i} position={[-1.65+i*.82,y+.43,.02]}><B s={[.73,.74,.055]} c={['#314b53','#ad9973','#814f49','#5f6b51','#383849'][(i+row)%5]}/><mesh position={[0,0,.035]}><ringGeometry args={[.10,.23,24]}/><meshStandardMaterial color={row%2?'#c3a973':'#d9c7a1'} roughness={.9}/></mesh><B p={[0,-.27,.04]} s={[.46,.018,.01]} c="#ddd0af"/></group>)}</group>)}
  {[-1,1].map(a=><group key={a} position={[a*2.55,0,0]}><B p={[0,.73,0]} s={[.55,1.46,.60]} c="#282d2c"/>{[.42,.94].map(y=><mesh key={y} position={[0,y,.31]}><circleGeometry args={[.19,28]}/><meshStandardMaterial color="#151b1e" metalness={.25} roughness={.5}/></mesh>)}</group>)}
 </group>
 </group>}
