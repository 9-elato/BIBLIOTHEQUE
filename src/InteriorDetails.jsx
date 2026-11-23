import React from 'react'
import {Text} from '@react-three/drei'
import * as THREE from 'three'
import {GALLERY_HEIGHT} from './Mezzanine'

const mat={walnut:'#654332',mahogany:'#79513e',gold:'#bb9258',parchment:'#f1e3cd',glass:'#a7bcc1',leather:'#6a705d',stone:'#d5c6ab',green:'#5a6f5a',burgundy:'#7e5650'}
function Piece({p,s,c=mat.walnut,rot=[0,0,0]}){return <mesh position={p} rotation={rot} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.78}/></mesh>}
function Rod({a,b,r=.04,c=mat.gold}){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start),point=start.clone().add(end).multiplyScalar(.5);const rot=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());return <mesh position={point} quaternion={rot}><cylinderGeometry args={[r,r,v.length(),10]}/><meshStandardMaterial color={c} roughness={.5} metalness={.55}/></mesh>}
function WallPortrait({x,y,z,color='#9b7d62'}){return <group><Piece p={[x,y,z]} s={[.92,1.10,.08]} c={mat.gold}/><Piece p={[x,y,z+.052]} s={[.78,.97,.04]} c="#5c655e"/><Piece p={[x,y-.23,z+.08]} s={[.46,.16,.04]} c={color}/><mesh position={[x,y+.12,z+.10]}><sphereGeometry args={[.20,10,8]}/><meshStandardMaterial color="#c9b99d"/></mesh></group>}
function Clock(){return <group position={[-7.30,0,-3.28]}>
 <Piece p={[0,1.22,0]} s={[.55,2.42,.50]}/><Piece p={[0,2.48,0]} s={[.78,.24,.68]} c={mat.mahogany}/>
 <mesh position={[0,1.9,.31]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.23,.23,.03,22]}/><meshStandardMaterial color={mat.parchment}/></mesh>
 <Rod a={[0,1.9,.36]} b={[0,2.03,.36]} r={.016} c="#413126"/>
 <Rod a={[0,1.9,.36]} b={[-.09,1.85,.36]} r={.018} c="#413126"/>
 <Piece p={[0,.18,0]} s={[.76,.16,.74]} c={mat.mahogany}/>
 </group>}
function LibraryLadder(){return <group position={[5.35,.12,-5.75]} rotation={[.12,0,-.18]}>
 {[-.36,.36].map(x=><Piece key={x} p={[x,2.2,0]} s={[.095,4.4,.10]} c={mat.mahogany}/>) }
 {Array.from({length:11},(_,i)=><Piece key={i} p={[0,.42+i*.34,0]} s={[.85,.085,.14]} c="#c29a68"/>) }
 <Rod a={[-.52,4.32,0]} b={[.52,4.32,0]} r={.055}/>
 </group>}
function DeskAccessories(){return <group>
  <Piece p={[-.42,1.14,1.82]} s={[.62,.03,.42]} c="#4e7161"/>
  <Piece p={[-.42,1.16,1.83]} s={[.42,.012,.30]} c={mat.parchment}/>
  <Rod a={[-.60,1.19,1.73]} b={[-.20,1.20,1.92]} r={.012} c="#6c4a34"/>
  <Piece p={[.12,1.15,2.12]} s={[.25,.13,.25]} c="#4a5d55"/>
  <mesh position={[.12,1.25,2.12]}><sphereGeometry args={[.055,12,10]}/><meshStandardMaterial color="#a99883"/></mesh>
  {[0,1,2].map(i=><Piece key={i} p={[.50,1.15+i*.045,1.72]} s={[.43,.055,.28]} c={['#986847','#738372','#b18c6a'][i]}/>) }
</group>}
function UpperShelf({x,z}){return <group position={[x,GALLERY_HEIGHT,z]}>
  <Piece p={[0,1.22,0]} s={[.45,2.44,1.65]}/>
  {[.48,1.10,1.73,2.35].map(h=><Piece key={h} p={[-.025,h,0]} s={[.62,.10,1.78]} c={mat.mahogany}/>) }
  {Array.from({length:15},(_,i)=><Piece key={i} p={[.28,.77+(i%3)*.6,-.68+(i%5)*.33]} s={[.21,.40+(i%4)*.055,.14]} c={['#96735a','#718b77','#ad8a63','#7485a0'][i%4]}/>) }
  <Piece p={[0,2.52,0]} s={[.73,.15,1.83]} c={mat.gold}/>
 </group>}
function BrassChandelier(){return <group position={[0,9.0,1.75]}>
  <Rod a={[0,0,0]} b={[0,7.1,0]} r={.045}/><Piece p={[0,7.08,0]} s={[.4,.1,.4]} c={mat.gold}/>
  <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.25,.085,12,34]}/><meshStandardMaterial color={mat.gold} metalness={.58} roughness={.32}/></mesh>
  <Rod a={[0,.12,0]} b={[.62,.12,0]} r={.035}/><Rod a={[0,.12,0]} b={[-.62,.12,0]} r={.035}/><mesh position={[0,.12,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.62,.05,8,28]}/><meshStandardMaterial color={mat.gold} metalness={.6}/></mesh>
  {Array.from({length:10},(_,i)=>{const a=i*Math.PI/5,x=Math.cos(a),z=Math.sin(a);return <group key={i}><Rod a={[0,0,0]} b={[x*1.25,0,z*1.25]} r={.04}/><mesh position={[x*1.22,.22,z*1.22]}><sphereGeometry args={[.14,12,8]}/><meshStandardMaterial color="#ffdfab" emissive="#ffd29b" emissiveIntensity={.9}/></mesh></group>})}
  <pointLight position={[0,-.3,0]} color="#ffda9a" intensity={3.7} distance={15}/>
 </group>}
function GalleryArch({z=0}){const pts=[];for(let i=0;i<=24;i++){const t=Math.PI*i/24;pts.push(new THREE.Vector3(-7.75+Math.sin(t)*.13,7.55+Math.sin(t)*.75,z-1.1+Math.cos(t)*1.1))}const curve=new THREE.CatmullRomCurve3(pts);return <mesh><tubeGeometry args={[curve,32,.07,8,false]}/><meshStandardMaterial color="#b48a60"/></mesh>}
function ReadingDesk({x,z,chair='#5f725f'}){return <group position={[x,0,z]}>
 <Piece p={[0,.75,0]} s={[1.25,.14,.68]} c={mat.mahogany}/>
 <Piece p={[0,.27,-.29]} s={[1.18,.52,.12]} c={mat.walnut}/>
 {[-.5,.5].map(v=><Piece key={v} p={[v,.38,.25]} s={[.08,.65,.10]} c={mat.walnut}/>) }
 <Piece p={[-.24,.845,.1]} s={[.40,.025,.30]} c={mat.parchment}/>
 <mesh position={[.35,1.05,-.15]}><sphereGeometry args={[.13,12,9]}/><meshStandardMaterial color="#ffe2ad" emissive="#ffd6a0" emissiveIntensity={.7}/></mesh>
 <Piece p={[0,.52,.9]} s={[.8,.10,.8]} c={chair}/><Piece p={[0,1.08,1.25]} s={[.8,1.0,.10]} c={chair}/>
 {[-.28,.28].flatMap(a=>[-.28,.28].map(b=><Piece key={`${a}/${b}`} p={[a,.25,.88+b*.2]} s={[.08,.5,.08]} c={mat.walnut}/>))}
 </group>}
function WallSconce({x,y,z,rot=0}){return <group position={[x,y,z]} rotation={[0,rot,0]}><Piece p={[0,0,0]} s={[.18,.48,.14]} c={mat.gold}/><Rod a={[0,0,.02]} b={[0,0,.16]} r={.035}/><Rod a={[0,0,.16]} b={[0,.38,.16]} r={.035}/><mesh position={[0,.38,.16]}><sphereGeometry args={[.14,12,8]}/><meshStandardMaterial color="#ffe4b3" emissive="#ffd59e" emissiveIntensity={.9}/></mesh><pointLight position={[0,.32,.42]} intensity={1.1} distance={4} color="#ffd5a0"/></group>}
function GlobeStand(){return <group position={[7.3,0,3.0]}>
 <Piece p={[0,.95,0]} s={[.55,.10,.55]} c={mat.mahogany}/><Piece p={[0,.40,0]} s={[.10,.80,.10]} c={mat.mahogany}/>
 <mesh position={[0,1.4,0]}><sphereGeometry args={[.42,14,12]}/><meshStandardMaterial color="#7895a8" roughness={.8}/></mesh>
 <mesh position={[0,1.4,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.48,.025,10,26]}/><meshStandardMaterial color={mat.gold} metalness={.5} roughness={.35}/></mesh>
 </group>}
function WindowSeat({x,z,rot=0}){return <group position={[x,0,z]} rotation={[0,rot,0]}>
 <Piece p={[0,.42,0]} s={[1.65,.82,.70]} c="#6c4d3b"/><Piece p={[0,.82,0]} s={[1.46,.18,.54]} c="#d9c5a5"/>
 <Piece p={[-.45,1.0,.02]} s={[.44,.22,.38]} c={mat.green}/><Piece p={[.35,.96,-.06]} s={[.32,.18,.28]} c={mat.burgundy}/>
 </group>}
export default function InteriorDetails(){return <group>
 <BrassChandelier/>
 {[-3.1,2.4].map(z=><group key={z}><UpperShelf x={7.55} z={z}/></group>)}
 {[-7.3,7.3].map(x=><group key={x}><WallSconce x={x} y={4.1} z={2.65} rot={x<0?Math.PI/2:-Math.PI/2}/><WallSconce x={x} y={8.25} z={-2.6} rot={x<0?Math.PI/2:-Math.PI/2}/><WallSconce x={x} y={8.25} z={2.7} rot={x<0?Math.PI/2:-Math.PI/2}/></group>)}
 {[[7.3,-3.1,'ARTS'],[7.3,2.4,'LANGUAGES']].map(([x,z,title],i)=><group key={i}><Piece p={[x,GALLERY_HEIGHT+2.75,z]} s={[.08,.36,1.75]} c={mat.walnut}/><Text position={[x+(x>0?-.08:.08),GALLERY_HEIGHT+2.75,z]} rotation={[0,x>0?Math.PI/2:-Math.PI/2,0]} fontSize={.19} color="#f2dcae" anchorX="center">{title}</Text></group>)}
 <Text position={[0,11.2,-6.78]} fontSize={.21} color="#916748" anchorX="center">THE GRAND LIBRARY</Text>
</group>}
