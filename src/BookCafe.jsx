import StaticBatch from './StaticBatch'
import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {BookCoverMesh} from './BookCover'
import {CAFE_SEATS} from './cafeLayout'
function Sign({text,position,size=[2,1],rotation=[0,0,0],dark=false}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=768;c.height=512;const x=c.getContext('2d');x.fillStyle=dark?'#193d33':'#eee2c6';x.fillRect(0,0,768,512);x.fillStyle=dark?'#f8ecd2':'#493721';x.textAlign='center';const lines=text.split('\n');x.font=`${Math.min(58,420/Math.max(1,lines.length))}px sans-serif`;lines.forEach((line,i)=>x.fillText(line,384,65+i*400/Math.max(1,lines.length),710));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[text,dark]);useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh userData={{noCameraCollision:true}} position={position} rotation={rotation}><planeGeometry args={size}/><meshBasicMaterial map={texture} side={THREE.DoubleSide}/></mesh>
}
export default function BookCafe({config,books,onOpen,time}){
 const chosen=config.bookIds.map(id=>books.find(b=>b.id===id)).filter(Boolean).slice(0,8)
 const click=e=>{e.stopPropagation();onOpen()}
 return <group>
 <StaticBatch>
 <B p={[-22.3,-.12,23]} s={[15.4,.24,16.5]} c="#9a7955"/>
 <B p={[-14,0,22.25]} s={[4,.08,2.5]} c="#bca887"/>
 <B p={[-30,3.5,23]} s={[.28,7,16]} c="#c3b897"/>
 <B p={[-23,3.5,15]} s={[14,7,.25]} c="#dbceb3"/>
 <B p={[-23,3.5,31]} s={[14,7,.25]} c="#34463c"/>
 <B p={[-16,3.5,18]} s={[.25,7,6]} c="#d5c4a3"/>
 <B p={[-16,3.5,27.3]} s={[.25,7,7.4]} c="#d5c4a3"/>
 <B p={[-16,5.7,22.25]} s={[.25,2.6,2.5]} c="#d5c4a3"/>
 <B p={[-23,7.1,23]} s={[14.6,.25,16.6]} c="#594431"/>
 </StaticBatch>
 <Sign text={config.title} position={[-15.8,4.6,22.25]} rotation={[0,Math.PI/2,0]} size={[3,1]}/>
 <group onClick={click}>
 <B p={[-17.9,.65,18.25]} s={[2.5,1.3,4.3]} c="#543f30"/>
 <B p={[-17.9,1.34,18.25]} s={[2.7,.12,4.5]} c="#ba9d6f"/>
 <B p={[-18.86,3.1,18.3]} s={[.10,2.9,3.7]} c="#584630"/>{[16.8,19.8].map(z=><B key={z} p={[-18.86,5.75,z]} s={[.035,2.5,.035]} c="#806c49"/>)}
 <Sign text={'MENU\n'+config.menu} position={[-18.9,3.1,18.3]} rotation={[0,-Math.PI/2,0]} size={[3.6,2.8]} dark/>
 <Sign text={config.curationTitle+'\n'+(chosen.length?'선별 도서 · 클릭해서 소개 보기':'책방지기의 선정을 기다립니다')} position={[-27.5,3,15.3]} size={[4,1.3]}/>
 {[1.41,2.26].map(y=><B key={y} p={[-27.5,y,15.85]} s={[4.1,.08,.9]} c="#947149"/>)}
 <B p={[-27.5,.65,15.85]} s={[4.1,1.3,.9]} c="#68523a"/>
 {chosen.map((b,i)=><group key={b.id} position={[-29.1+(i%4)*1.05,1.8+Math.floor(i/4)*.85,15.85]}><B p={[0,0,0]} s={[.55,.7,.12]} c={b.color||'#39574d'}/><BookCoverMesh url={b.cover} position={[0,0,.07]} size={[.53,.68]}/></group>)}
 <B p={[-22.65,1.36,15.85]} s={[4.3,.12,.9]} c="#947149"/>
 <B p={[-22.65,.65,15.85]} s={[4.3,1.3,.9]} c="#68523a"/>
 <Sign text={'GOODS\n'+config.goods} position={[-22.6,3,15.3]} size={[3.7,1.4]}/>
 {[0,1,2].map(i=><B key={i} p={[-24+i*.32,1.46,15.9]} s={[.25,.08,.36]} c={['#e1c793','#c39596','#a6bca4'][i]}/>)}
 <mesh position={[-22.4,1.75,15.85]} scale={[.23,.33,.21]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#f5ecd9"/></mesh>
 {[-.08,.08].map(x=><mesh key={x} position={[-22.4+x,1.82,16.04]}><sphereGeometry args={[.027,8,6]}/><meshStandardMaterial color="#272121"/></mesh>)}
 {[-.13,.13].map(x=><mesh key={x} position={[-21.3+x,1.57,16]} rotation={[0,0,.15]}><torusGeometry args={[.12,.018,6,14]}/><meshStandardMaterial color="#8e6738" metalness={.65} roughness={.35}/></mesh>)}
 <B p={[-21.3,1.57,16]} s={[.08,.02,.025]} c="#8e6738"/>
 <Sign text={config.eventTitle+'\n'+config.eventNote} position={[-29.8,3,22]} rotation={[0,Math.PI/2,0]} size={[2.8,1.6]}/>
 <BookCoverMesh url={config.eventPoster} position={[-29.78,1.8,22]} rotation={[0,Math.PI/2,0]} size={[1.2,1.6]}/>
 <Sign text={'MINI CINEMA\n'+config.filmTitle+'\n3의 배수 날짜 · 목요일\n'+(config.startTime?config.startTime+' KST':'시작 시각 미정')} position={[-26,3,23.98]} rotation={[0,Math.PI,0]} size={[3,1.8]}/>
 <BookCoverMesh url={config.filmPoster} position={[-23,2.1,23.97]} rotation={[0,Math.PI,0]} size={[1,1.5]}/>
 <B p={[-26,1.8,24.15]} s={[8,3.6,.3]} c="#624935"/>
 <B p={[-26,3.75,24.25]} s={[7.4,.18,.45]} c="#624935"/>
 <B p={[-26,2.4,24.38]} s={[7.2,2.8,.1]} c="#111b1b"/>
 <Sign text={'상영표 · 클릭해서 열기\n'+config.filmTitle} position={[-26,2.4,24.45]} size={[6.8,2.5]} dark/>
 </group>
 <StaticBatch revision={time}>
 {CAFE_SEATS.map(([x,z],i)=><group key={i}><B p={[x,.46,z]} s={[1.2,.34,.96]} c={i<2?'#42624e':'#824b4b'}/><B p={[x,.95,z+.42]} s={[1.2,.8,.15]} c={i<2?'#42624e':'#824b4b'}/>{[-.45,.45].map(a=><B key={a} p={[x+a,.2,z]} s={[.1,.4,.75]} c="#483528"/>)}</group>)}
 <B p={[-26,.55,20.55]} s={[1.4,.15,1.1]} c="#ae855b"/><B p={[-26,.25,20.55]} s={[.15,.5,.15]} c="#594332"/>
 {[-27,-19].map(x=><group key={x}><B p={[x,5.7,20]} s={[.035,2.6,.035]} c="#806c49"/><mesh position={[x,4.4,20]}><sphereGeometry args={[.3,10,8]}/><meshStandardMaterial color="#fff0cb" emissive="#ffd18b" emissiveIntensity={time==='evening'?1:.4}/></mesh><pointLight position={[x,4,20]} color="#ffd7a0" intensity={5} distance={12}/></group>)}
 </StaticBatch>
 </group>
}
