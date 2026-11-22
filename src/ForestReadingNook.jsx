import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {CarvedBox, WovenRug,AntiqueLamp,Folios} from './StorybookDecor'
import StaticBatch from './StaticBatch'
const forestViews=new Map()
export function forestTexture(time,weather){
 const c=document.createElement('canvas');c.width=768;c.height=768;const x=c.getContext('2d'),evening=time==='evening'
 const sky=x.createLinearGradient(0,0,0,768);sky.addColorStop(0,evening?'#3b5864':'#c6d9b6');sky.addColorStop(1,evening?'#1c3531':'#577a50');x.fillStyle=sky;x.fillRect(0,0,768,768)
 for(let layer=0;layer<3;layer++)for(let i=0;i<18;i++){
  const a=(i*127.37+layer*71)%840-35,b=120+(i*83.2)%450,w=3+layer*5
  x.globalAlpha=.45+layer*.2;x.fillStyle=evening?['#536b69','#304d48','#172d28'][layer]:['#9aaf91','#658366','#364e39'][layer];x.fillRect(a,0,w,768)
  for(let j=0;j<16;j++){const px=a+Math.sin(j*2.4+i)*60,py=b+(j-8)*27;x.beginPath();x.ellipse(px,py,35+layer*11,18+layer*8,j*.4,0,7);x.fill()}
 }
 x.globalAlpha=1
 if(weather==='rain'||weather==='snow'){x.strokeStyle='#d8e4de';x.globalAlpha=.3;for(let i=0;i<150;i++){const a=i*137%768,b=i*79%768;x.beginPath();x.moveTo(a,b);x.lineTo(a-3,b+(weather==='rain'?20:3));x.stroke()}}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return map
}
export function ForestWindow({x,z=5.62,width,height=6.8,y=4.25,time,weather}){
 const key=time+':'+weather
 const entry=useMemo(()=>{let v=forestViews.get(key);if(!v){v={map:forestTexture(time,weather),users:0};forestViews.set(key,v)}return v},[key])
 useEffect(()=>{entry.users++;return()=>{if(--entry.users===0){entry.map.dispose();forestViews.delete(key)}}},[entry,key])
 const map=entry.map
 return <group position={[x,y,z]} rotation={[0,Math.PI,0]} userData={{noBatch:true}}>
  <mesh><planeGeometry args={[width,height]}/><meshBasicMaterial map={map} fog={false}/></mesh>
  {[-.5,0,.5].map(a=><B key={a} p={[a*width,0,.05]} s={[.10,height+.15,.15]} c="#735739"/>)}
  {[-.5,.5].map(a=><B key={a} p={[0,a*height,.05]} s={[width,.14,.15]} c="#806343"/>)}
  <mesh position={[0,0,.025]}><planeGeometry args={[width,height]}/><meshStandardMaterial transparent opacity={.035} color="#e2f1de" roughness={.16} metalness={.25} depthWrite={false}/></mesh>
 </group>
}
export default function ForestReadingNook({time,weather}){return <group>
 <ForestWindow x={10.6} width={5.6} height={7.4} y={4.25} time={time} weather={weather}/>
 <StaticBatch revision={time}>
 <WovenRug p={[11,.03,2.85]} size={[5.1,4.1]} color="#d4c8ad"/>
 <group position={[10.7,0,4.05]}>
  <CarvedBox p={[0,.35,0]} s={[4.4,.48,1.2]} c="#536448" r={.17}/>
  <CarvedBox p={[0,.93,.51]} s={[4.4,1.15,.26]} c="#365543" r={.12}/>
  {[-1.43,0,1.43].map(a=><group key={a}><CarvedBox p={[a,.66,-.05]} s={[1.40,.25,1.04]} c="#45684d" r={.12}/><CarvedBox p={[a,1.02,.30]} s={[1.3,.72,.30]} c="#476b50" r={.14} rot={[-.14,0,0]}/><CarvedBox p={[a+.3,1.12,.13]} s={[.45,.45,.22]} c="#b4a079" r={.09} rot={[0,.2,.18]}/></group>)}
  {[-2.13,2.13].map(a=><CarvedBox key={a} p={[a,.76,-.02]} s={[.22,.75,1.2]} c="#3c6049" r={.10}/>)}
 </group>
 <CarvedBox p={[12.2,.43,2.95]} s={[1.4,.65,1.0]} c="#47684e" r={.14}/>
 <group position={[10.1,0,1.85]}><CarvedBox p={[0,.5,0]} s={[1.35,.14,.75]} c="#9e774e" r={.12}/>{[-.5,.5].map(a=><B key={a} p={[a,.25,0]} s={[.08,.5,.5]} c="#775637"/>)}<Folios p={[-.2,.59,0]}/></group>
 <AntiqueLamp p={[8.15,0,4.55]} time={time} scale={2}/>
 </StaticBatch>
 </group>}
