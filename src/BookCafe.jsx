import CafeShopfront from './CafeShopfront'
import {cafeIdentity,CAFE_IDENTITY} from './cafeData'
import {withCafePoster} from './cafePoster'
import StaticBatch from './StaticBatch'
import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {BookCoverMesh} from './BookCover'
import {CAFE_SEATS,CAFE_SEAT_TURNS,CAFE_NOOKS} from './cafeLayout'
function Sign({text,position,size=[2,1],rotation=[0,0,0],dark=false,fascia=false}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*size[1]/size[0]);const x=c.getContext('2d'),h=c.height;
 x.fillStyle=dark?'#203a35':'#f2eadb';x.fillRect(0,0,1024,h);x.strokeStyle='#b59860';x.lineWidth=3;x.strokeRect(18,18,988,h-36);
 if(fascia){
 x.fillStyle='#ceb483';x.textAlign='center';x.textBaseline='middle';x.font='500 58px Georgia, serif';x.fillText(text.split('\n')[0],512,h*.43,940);x.font='22px Georgia, serif';x.fillText('BOOKS & COFFEE  ·  눈사람 유령이 남긴 흔적',512,h*.78,930);
 }else{
 // Melting ghost snowman: cream puddle, slumping body and two quiet eyes.
 const cy=Math.min(78,h*.18);x.fillStyle=dark?'#f4ead5':'#d3c4a5';x.beginPath();x.ellipse(512,cy+24,62,13,0,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(505,cy,35,37,-.15,0,Math.PI*2);x.fill();x.beginPath();x.arc(512,cy-30,24,0,Math.PI*2);x.fill();x.fillStyle='#263b36';[502,520].forEach(px=>{x.beginPath();x.ellipse(px,cy-30,3,5,0,0,Math.PI*2);x.fill()});
 const lines=text.split('\n'),start=cy+70,step=Math.min(62,(h-start-24)/Math.max(1,lines.length));x.textAlign='center';x.textBaseline='middle';x.fillStyle=dark?'#f4ead5':'#243d36';lines.forEach((line,i)=>{x.font=`${i===0?'600':'400'} ${Math.min(i===0?44:32,step*.72)}px Georgia, serif`;x.fillText(line,512,start+(i+.5)*step,930)});
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[text,dark,fascia,size[0],size[1]]);useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh userData={{noCameraCollision:true}} position={position} rotation={rotation}><planeGeometry args={size}/><meshBasicMaterial map={texture} side={THREE.DoubleSide}/></mesh>
}
export default function BookCafe({config,books,onOpen,time}){
 config=withCafePoster(cafeIdentity(config))
 const chosen=config.bookIds.map(id=>books.find(b=>b.id===id)).filter(Boolean).slice(0,8)
 const click=e=>{e.stopPropagation();onOpen()}
 return <group>
 <StaticBatch>
 <B p={[-22.3,-.12,23]} s={[15.4,.24,16.5]} c="#9a7955"/>
 <B p={[-14,0,22.25]} s={[4,.08,2.5]} c="#bca887"/>
 <B p={[-30,3.5,27.5]} s={[.28,7,7]} c="#d9d2c3"/>
 <B p={[-30,.45,19.5]} s={[.28,.9,9]} c="#d9d2c3"/><B p={[-30,6.25,19.5]} s={[.28,1.5,9]} c="#d9d2c3"/>
 {[15.15,17.9,20.8,23.85].map(z=><B key={z} p={[-30,3.2,z]} s={[.22,4.6,.09]} c="#343c36"/>)}
 <mesh position={[-30,3.2,19.5]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[8.7,4.6]}/><meshStandardMaterial color="#b7cfca" transparent opacity={.07} depthWrite={false} side={THREE.DoubleSide}/></mesh>
 <B p={[-29.38,.91,20.35]} s={[.65,.12,6.3]} c="#b8a98f"/>
 <B p={[-23,3.5,15]} s={[14,7,.25]} c="#dbceb3"/>
 <B p={[-23,3.5,31]} s={[14,7,.25]} c="#34463c"/>

 <B p={[-16,3.5,27.3]} s={[.25,7,7.4]} c="#d5c4a3"/>
 <B p={[-16,5.7,22.25]} s={[.25,2.6,2.5]} c="#d5c4a3"/>
 <B p={[-23,7.1,23]} s={[14.6,.25,16.6]} c="#594431"/>
 </StaticBatch>
 <CafeShopfront/>
 <Sign text={config.title+'\n'+CAFE_IDENTITY.concept+'\n책 여는 시간 10:00 · 책 닫는 시간 20:00'} position={[-15.53,5.75,23]} rotation={[0,Math.PI/2,0]} size={[10,1.27]} dark fascia/>
 <group onClick={click}>
 <Sign text={'유령단\n책 여는 시간 10:00\n책 닫는 시간 20:00'} position={[-15.79,1.8,24.2]} rotation={[0,Math.PI/2,0]} size={[1,1.4]} dark/>
 <group userData={{noCameraCollision:true}}>
 <B p={[-18.2,1.46,20.05]} s={[.65,.08,.7]} c="#f4ead5"/>
 <B p={[-18.2,1.53,20.05]} s={[.59,.04,.65]} c="#fff6e5"/>
 <Sign text={'INVITATION\n유령단의 초대장\n미니맵 · 이용 안내'} position={[-18.12,2.01,20.18]} rotation={[0,Math.PI/2,0]} size={[1.2,1.05]}/>
 <B p={[-18.2,1.75,20.18]} s={[.08,.65,.7]} c="#ac8a5d"/>
 </group>
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
 {/* Snowman slippers, melted magnet and reading ghost on the goods shelf. */}
 {[-.18,.18].map(dx=><group key={dx} position={[-23.2+dx,1.51,15.8]}><mesh scale={[.13,.07,.24]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#f1eadc"/></mesh><mesh position={[0,.08,-.05]}><sphereGeometry args={[.10,12,8]}/><meshStandardMaterial color="#eee5d4"/></mesh>{[-.035,.035].map(x=><mesh key={x} position={[x,.10,.04]}><sphereGeometry args={[.015,6,4]}/><meshBasicMaterial color="#303d39"/></mesh>)}</group>)}
 <mesh position={[-22.75,1.45,16.1]} scale={[.21,.025,.14]}><sphereGeometry args={[1,16,8]}/><meshStandardMaterial color="#e4dccb"/></mesh>
 <B p={[-22.4,1.65,16.09]} s={[.3,.18,.04]} c="#527366"/>
 {[-.13,.13].map(x=><mesh key={x} position={[-21.3+x,1.57,16]} rotation={[0,0,.15]}><torusGeometry args={[.12,.018,6,14]}/><meshStandardMaterial color="#8e6738" metalness={.65} roughness={.35}/></mesh>)}
 <B p={[-21.3,1.57,16]} s={[.08,.02,.025]} c="#8e6738"/>
 <Sign text={config.eventTitle+'\n'+config.eventNote} position={[-29.8,3,22]} rotation={[0,Math.PI/2,0]} size={[2.8,1.6]}/>
 <BookCoverMesh url={config.eventPoster} position={[-29.78,1.8,22]} rotation={[0,Math.PI/2,0]} size={[1.2,1.6]}/>
 <Sign text={'MINI CINEMA\n'+config.filmTitle+'\n3의 배수 날짜 · 목요일\n'+(config.startTime?config.startTime+' KST':'시작 시각 미정')} position={[-26,3,23.98]} rotation={[0,Math.PI,0]} size={[3,1.8]}/>
 <BookCoverMesh url={config.filmPoster} position={[-23,2.1,23.97]} rotation={[0,Math.PI,0]} size={[1,1.5]}/>
 <B p={[-26,3.5,24.15]} s={[8,7,.3]} c="#624935"/>
 <B p={[-17.8,3.5,24.15]} s={[3.6,7,.3]} c="#d9d2c3"/>
 <B p={[-20.8,5.8,24.15]} s={[2.4,2.4,.3]} c="#d9d2c3"/>
 {[-21.95,-19.65].map(x=><B key={x} p={[x,2.3,24.15]} s={[.12,4.6,.42]} c="#b59860"/>)}
 <B p={[-26,3.75,24.25]} s={[7.4,.18,.45]} c="#624935"/>
 <B p={[-26,2.4,24.38]} s={[7.2,2.8,.1]} c="#111b1b"/>
 <Sign text={'상영표 · 클릭해서 열기\n'+config.filmTitle} position={[-26,2.4,24.45]} size={[6.8,2.5]} dark/>
 </group>
 <StaticBatch revision={time}>
 {CAFE_SEATS.map(([x,z],i)=><group key={i} position={[x,0,z]} rotation={[0,CAFE_SEAT_TURNS[i]-Math.PI,0]}><B p={[0,i===7?.15:.46,0]} s={[1.2,i===7?.2:.34,.96]} c={i<2||i>4?'#42624e':'#824b4b'}/><B p={[0,i===7?.38:.95,.42]} s={[1.2,i===7?.3:.8,.15]} c={i<2||i>4?'#42624e':'#824b4b'}/>{(i===7?[]:[-.45,.45]).map(a=><B key={a} p={[a,.2,0]} s={[.1,.4,.75]} c="#483528"/>)}</group>)}
 {CAFE_NOOKS.map(item=><B key={item.id} p={item.p} s={item.s} c={item.c}/>)}
 {[-25.48].map(x=>[18.65,21.35].map(z=><B key={z} p={[x,.95,z]} s={[.16,.85,1.85]} c="#42624e"/>))}
 <B p={[-21.4,.68,17.565]} s={[.96,.78,.035]} c="#252c29"/>
 {[0,1,2].map(i=><mesh key={i} position={[-21.65+i*.25,.53,17.6]} scale={[.10,.21+(i%2)*.1,.05]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#f2ba6e" emissive="#e9a74a" emissiveIntensity={1.2}/></mesh>)}
 {[[ -25.4,17.85],[-25.4,22.15],[-29.25,18],[-21,17.2]].map(([x,z],i)=><group key={i}><B p={[x,1.25,z]} s={[.035,1.25,.035]} c="#b2986b"/><mesh position={[x,1.92,z]}><coneGeometry args={[.25,.32,12,1,true]}/><meshStandardMaterial color="#f1dfb9" emissive="#e5b566" emissiveIntensity={.4} side={THREE.DoubleSide}/></mesh></group>)}

 {[-27,-19].map(x=><group key={x}><B p={[x,5.7,20]} s={[.035,2.6,.035]} c="#806c49"/><mesh position={[x,4.4,20]}><sphereGeometry args={[.3,10,8]}/><meshStandardMaterial color="#fff0cb" emissive="#ffd18b" emissiveIntensity={time==='evening'?1:.4}/></mesh><pointLight position={[x,4,20]} color="#ffd7a0" intensity={5} distance={12}/></group>)}
 </StaticBatch>
 </group>
}
