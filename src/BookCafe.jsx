import {canReachEvent} from './interactionReach.js'
import {CAFE_FLOOR_TILES} from './cafeGroundLayout.js'
import SnowmanSlipper from './SnowmanSlipper'
import CafeFinish from './CafeFinish'
import CafePrivateFloor from './CafePrivateFloor'
import {CAFE_SCALE} from './cafeExpansion'
import CafeCoffeeBar from './CafeCoffeeBar'
import CafeSoftSeat,{SoftPad} from './CafeSoftSeat'
import CafeDoorBell from './CafeDoorBell'
import CafeLoungeChair,{CafeSideTable} from './CafeLoungeChair'
import {CafeSignContext} from './cafeSignContext'
import {representativeDisplays,curatedDisplay} from './cafeDisplays'
import CafeGoodsDetails from './CafeGoodsDetails'
import CafeCinema from './CafeCinema'
import CafeShopfront from './CafeShopfront'
import {cafeIdentity} from './cafeData'
import {withCafePoster} from './cafePoster'
import StaticBatch from './StaticBatch'
import React,{useMemo,useEffect,useContext} from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {BookCoverMesh} from './BookCover'
import {CAFE_LOCAL_SEATS,CAFE_SEAT_TURNS,CAFE_NOOKS,CAFE_DISPLAY_Z} from './cafeLayout'
export function Sign({text,position,size=[2,1],rotation=[0,0,0],dark=false,fascia=false,compact=false,action}){
 const openSign=useContext(CafeSignContext)
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*size[1]/size[0]);const x=c.getContext('2d'),h=c.height;
 x.fillStyle=dark?'#222323':'#f2eadb';x.fillRect(0,0,1024,h);x.strokeStyle='#b59860';x.lineWidth=3;x.strokeRect(18,18,988,h-36);
 if(text.startsWith('WANTED')){
 x.strokeStyle='#292724';x.lineWidth=2;x.strokeRect(38,38,948,h-76);x.textAlign='center';x.fillStyle='#292724';x.font='bold 115px Georgia,serif';x.fillText('WANTED',512,185,880);
 x.font='24px Georgia,serif';x.fillText('READERS • GHOST COLLECTIVE',512,235);x.beginPath();x.moveTo(150,275);x.lineTo(874,275);x.stroke();
 x.beginPath();x.moveTo(385,680);x.lineTo(385,445);x.bezierCurveTo(385,295,639,295,639,445);x.lineTo(639,680);x.lineTo(590,645);x.lineTo(542,680);x.lineTo(495,645);x.lineTo(445,680);x.closePath();x.stroke();
 [472,552].forEach(px=>{x.beginPath();x.ellipse(px,445,10,18,0,0,Math.PI*2);x.fill()});x.strokeRect(414,535,196,95);x.beginPath();x.moveTo(512,535);x.lineTo(512,630);x.stroke();
 text.split('\n').slice(1).forEach((line,i)=>{x.font=`${i===0?44:32}px Georgia,serif`;x.fillText(line,512,800+i*85,880)});x.font='25px Georgia,serif';x.fillText('REWARD: A GOOD STORY',512,h-100)
 }else if(compact){const lines=text.split('\n');x.fillStyle=dark?'#f4ead5':'#292724';x.textAlign='center';x.textBaseline='middle';const step=(h-50)/lines.length;x.font=`${Math.min(72,step*.55)}px Georgia, serif`;lines.forEach((line,i)=>x.fillText(line,512,25+step*(i+.5),930))}
 else if(fascia){
 x.fillStyle='#f4ead5';x.textAlign='center';x.textBaseline='middle';x.font='500 58px Georgia, serif';x.fillText(text.split('\n')[0],512,h*.43,840);x.font='18px Georgia, serif';x.fillText('BOOKS & COFFEE  ·  GHOST COLLECTIVE',512,h*.78,800);[74,950].forEach(px=>{x.beginPath();x.moveTo(px,h*.3);x.lineTo(px+10,h*.45);x.lineTo(px,h*.6);x.lineTo(px-10,h*.45);x.closePath();x.stroke()});
 }else{
 // Melting ghost snowman: cream puddle, slumping body and two quiet eyes.
 const cy=Math.min(78,h*.18);x.fillStyle=dark?'#f4ead5':'#d3c4a5';x.beginPath();x.ellipse(512,cy+24,62,13,0,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(505,cy,35,37,-.15,0,Math.PI*2);x.fill();x.beginPath();x.arc(512,cy-30,24,0,Math.PI*2);x.fill();x.fillStyle='#263b36';[502,520].forEach(px=>{x.beginPath();x.ellipse(px,cy-30,3,5,0,0,Math.PI*2);x.fill()});
 const lines=text.split('\n'),start=cy+70,step=Math.min(62,(h-start-24)/Math.max(1,lines.length));x.textAlign='center';x.textBaseline='middle';x.fillStyle=dark?'#f4ead5':'#243d36';lines.forEach((line,i)=>{x.font=`${i===0?'600':'400'} ${Math.min(i===0?44:32,step*.72)}px Georgia, serif`;x.fillText(line,512,start+(i+.5)*step,930)});
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[text,dark,fascia,compact,size[0],size[1]]);useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;openSign?.(action||{type:'cafe-sign',text,signArtwork:texture.image.toDataURL('image/png')})}} userData={{noCameraCollision:true}} position={position} rotation={rotation}><planeGeometry args={size}/><meshBasicMaterial map={texture} side={THREE.DoubleSide}/></mesh>
}
export default function BookCafe({config,books,onOpen,time}){
 config=withCafePoster(cafeIdentity(config))
 const chosen=curatedDisplay(config,books)
 const displays=representativeDisplays(books)
 const click=e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen('cafe-books')}
 return <CafeSignContext.Provider value={onOpen}><group position={[-16,0,22.25]} scale={[CAFE_SCALE,1,CAFE_SCALE]}><group position={[16,0,-22.25]}>
 <StaticBatch>
 {CAFE_FLOOR_TILES.map(({id,rect:[l,r,b,f],color})=><B key={id} p={[(l+r)/2,-.12,(b+f)/2]} s={[r-l,.24,f-b]} c={color}/>)}
 <B p={[-34,.45,23]} s={[.28,.9,16]} c="#eee6d8"/><B p={[-34,6.25,23]} s={[.28,1.5,16]} c="#eee6d8"/>
 {[15.15,18.3,21.5,24.7,27.8,30.85].map(z=><B key={z} p={[-34,3.2,z]} s={[.22,4.6,.09]} c="#242525"/>)}
 <mesh position={[-34,3.2,23]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[15.7,4.6]}/><meshStandardMaterial color="#b7cfca" transparent opacity={.07} depthWrite={false} side={THREE.DoubleSide}/></mesh>

 <B p={[-25,3.5,15]} s={[18,7,.25]} c="#eee6d8"/>
 <B p={[-32.5,3.5,31]} s={[3,7,.25]} c="#eee6d8"/><B p={[-22.5,3.5,31]} s={[13,7,.25]} c="#eee6d8"/><B p={[-30,5.8,31]} s={[2,2.4,.25]} c="#eee6d8"/>


 <B p={[-16,6,22.25]} s={[.25,2,3.1]} c="#222323"/>

 </StaticBatch>
 <CafeFinish/><CafeShopfront/><CafeDoorBell/>
 <Sign text={'2F PRIVATE\n예약 전용 · 1인 공간\n← 계단으로 올라오세요'} position={[-33.84,2.1,30]} rotation={[0,Math.PI/2,0]} size={[1.2,.8]} dark compact action={{type:'cafe-sign',privateBooking:true}}/>
 <group onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen({type:'cafe-sign',goodsZone:true})}}><CafeGoodsDetails onSelect={goodsName=>onOpen({type:'cafe-sign',goodsName})}/></group>
 <B p={[-22.65,.015,16.65]} s={[4.4,.025,1.9]} c="#b8a68c"/>
 <B p={[-25,1.1,15.88]} s={[.12,2.2,1]} c="#40382f"/>
 <CafeCinema config={config} Sign={Sign}/><CafePrivateFloor Sign={Sign} onOpen={onOpen}/>
 <group onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen('cafe-books')}}>
 <B p={[-16.24,1.35,16.15]} s={[.34,.1,1.6]} c="#8f7352"/>
 {(chosen.length?chosen.slice(0,3):[{id:'display',color:'#665648'}]).map((b,i)=><group key={b.id} position={[-16.22,1.75,15.65+i*.48]}><B p={[0,0,0]} s={[.10,.7,.4]} c={b.color||'#6c5c46'}/><BookCoverMesh url={b.cover} position={[.06,0,0]} rotation={[0,Math.PI/2,0]} size={[.38,.67]}/></group>)}
 </group>
 <group onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen({type:'cafe-sign',text:'다음 상영작\n'+config.filmTitle,image:config.filmPoster})}}>
 <B p={[-16.2,2.7,17.45]} s={[.07,1.72,1.18]} c="#292a28"/>
 <group onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen({type:'cafe-sign',text:config.filmTitle,image:config.filmPoster})}}><BookCoverMesh url={config.filmPoster} position={[-16.15,2.7,17.45]} rotation={[0,Math.PI/2,0]} size={[1.1,1.62]}/></group>
 </group>
 <Sign text={'WANTED\n함께 읽을 유령을 찾습니다\n유령단 독서모임\n책 한 권 · 다른 생각들\n모임 일정은 책방지기에게'} position={[-16.14,2.7,18.75]} rotation={[0,Math.PI/2,0]} size={[1.1,1.65]} compact/>

 <Sign text={config.title+'\n책 여는 시간 10:00 · 책 닫는 시간 20:00'} position={[-15.53,5.75,23]} rotation={[0,Math.PI/2,0]} size={[10,1.27]} dark fascia/>
 <group onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen('cafe-mail')}}>
 <B p={[-17.8,1.6,23.85]} s={[.85,.9,.25]} c="#292b29"/>
 <B p={[-17.8,1.85,23.715]} s={[.58,.055,.02]} c="#1d3029"/>
 <Sign action="cafe-mail" text={'느린 우편함\n1년 뒤의 나에게'} position={[-17.8,1.48,23.71]} rotation={[0,Math.PI,0]} size={[.72,.45]}/>
 </group>
 <group onClick={click}>
 {CAFE_DISPLAY_Z.map((z,i)=><group key={z}>
 <B p={[-29,.55,z]} s={[1.5,1.1,.7]} c="#71543b"/>
 <B p={[-29,1.15,z]} s={[1.6,.1,.8]} c="#c9b695"/>
 {[-29.7,-28.3].map(x=><B key={x} p={[x,1.55,z+.3]} s={[.06,.7,.08]} c="#292a28"/>)}
 <B p={[-29,1.9,z+.3]} s={[1.5,.13,.13]} c="#292a28"/>
 <Sign text={displays[i]?.name||'다음 큐레이션'} position={[-29,1.47,z+.365]} size={[1.4,.5]}/>
 {(displays[i]?.books||[]).slice(0,8).map((b,j)=><group key={b.id} position={[-29.55+(j%4)*.36,1.245,z-.18+Math.floor(j/4)*.32]}><B p={[0,0,0]} s={[.30,.09,.26]} c={b.color||'#544738'}/>{b.cover?<BookCoverMesh url={b.cover} position={[0,.05,0]} rotation={[-Math.PI/2,0,0]} size={[.28,.25]}/>:<Sign text={b.title+'\n'+b.author} position={[0,.052,0]} rotation={[-Math.PI/2,0,0]} size={[.28,.25]} compact/>}</group>)}
 </group>)}

 <Sign text={'유령단\n책 여는 시간 10:00\n책 닫는 시간 20:00'} position={[-15.79,1.8,24.2]} rotation={[0,Math.PI/2,0]} size={[.78,.43]} dark compact/>
 <group userData={{noCameraCollision:true}}>
 <group position={[-18.2,0,21.4]}>
 <B p={[0,.55,0]} s={[.55,1.1,.5]} c="#292b29"/>
 <B p={[0,1.13,0]} s={[.7,.06,.6]} c="#ac8a5d"/>
 <Sign action="cafe" text={'INVITATION\n유령단의 초대장'} position={[0,1.17,0]} rotation={[-Math.PI/2,0,Math.PI/2]} size={[.58,.45]}/>
 </group>
 </group>
 <B p={[-17.25,.65,18.25]} s={[1.2,1.3,4.3]} c="#252625"/>
 <B p={[-17.25,1.34,18.25]} s={[1.4,.12,4.5]} c="#d9cfbc"/>

<B p={[-18.3,.65,19.85]} s={[3.3,1.3,1.1]} c="#252625"/><B p={[-18.3,1.34,19.85]} s={[3.5,.12,1.3]} c="#d9cfbc"/>
 {[18,22.6].map(z=><B key={z} p={[-27,.65,z]} s={[.12,1.3,1.8]} c="#292b29"/>)}
 <CafeCoffeeBar onOpen={onOpen} menu={config.menu}/>
 <group onClick={click}>
 <Sign text={config.curationTitle+'\n'+(chosen.length?'선별 도서 · 클릭해서 소개 보기':'책방지기의 선정을 기다립니다')} position={[-27.5,3,15.3]} size={[4,1.3]}/>
 {[1.41,2.26].map(y=><B key={y} p={[-27.5,y,15.85]} s={[4.1,.08,.9]} c="#947149"/>)}
 <B p={[-27.5,.65,15.85]} s={[4.1,1.3,.9]} c="#68523a"/>
 {chosen.map((b,i)=><group key={b.id} position={[-29.1+(i%4)*1.05,1.8+Math.floor(i/4)*.85,15.85]}><B p={[0,0,0]} s={[.55,.7,.12]} c={b.color||'#39574d'}/><BookCoverMesh url={b.cover} position={[0,0,.07]} size={[.53,.68]}/></group>)}
 </group>
 <B p={[-22.65,1.36,15.85]} s={[4.3,.12,.9]} c="#947149"/>
 <B p={[-22.65,.65,15.85]} s={[4.3,1.3,.9]} c="#68523a"/>
 <Sign action={{type:'cafe-sign',goodsZone:true}} text={'GOODS ZONE · 유령단의 작은 흔적\n책갈피 · 에코백 · 문구\n클릭하여 굿즈 목록 펼치기'} position={[-22.6,3.48,16.31]} size={[3.7,1.1]}/>
 {[0,1,2].map(i=><B key={i} p={[-24+i*.32,1.46,15.9]} s={[.25,.08,.36]} c={['#e1c793','#c39596','#a6bca4'][i]}/>)}
 <mesh position={[-22.4,1.75,15.85]} scale={[.23,.33,.21]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#f5ecd9"/></mesh>
 {[-.08,.08].map(x=><mesh key={x} position={[-22.4+x,1.82,16.04]}><sphereGeometry args={[.027,8,6]}/><meshStandardMaterial color="#272121"/></mesh>)}
 {/* Snowman slippers, melted magnet and reading ghost on the goods shelf. */}
 {[-.18,.18].map(dx=><group key={dx} position={[-23.2+dx,1.42,15.85]} scale={[.28,.28,.28]}><SnowmanSlipper/></group>)}
 <mesh position={[-22.75,1.45,16.1]} scale={[.21,.025,.14]}><sphereGeometry args={[1,16,8]}/><meshStandardMaterial color="#e4dccb"/></mesh>
 <B p={[-22.4,1.65,16.09]} s={[.3,.18,.04]} c="#527366"/>
 {[-.13,.13].map(x=><mesh key={x} position={[-21.3+x,1.57,16]} rotation={[0,0,.15]}><torusGeometry args={[.12,.018,6,14]}/><meshStandardMaterial color="#8e6738" metalness={.65} roughness={.35}/></mesh>)}
 <B p={[-21.3,1.57,16]} s={[.08,.02,.025]} c="#8e6738"/>
 <Sign text={config.eventTitle+'\n'+config.eventNote} position={[-33.8,3,22]} rotation={[0,Math.PI/2,0]} size={[2.8,1.6]}/>
 <group onClick={e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen({type:'cafe-sign',text:config.eventTitle,image:config.eventPoster})}}><BookCoverMesh url={config.eventPoster} position={[-33.78,1.8,22]} rotation={[0,Math.PI/2,0]} size={[1.2,1.6]}/></group>
 </group>
 <StaticBatch revision={time}>
 {CAFE_LOCAL_SEATS.map(([x,z],i)=><group key={i} position={[x,0,z]} rotation={[0,CAFE_SEAT_TURNS[i]-Math.PI,0]}>{i<2?<CafeLoungeChair/>:<CafeSoftSeat floor={i===4} dark={false}/>}</group>)}
 {CAFE_NOOKS.map(item=>item.id.includes('table')?<CafeSideTable key={item.id} p={item.p} s={item.s}/>:item.id.includes('return')?<SoftPad key={item.id} p={item.p} s={item.s} c={item.c}/>:<B key={item.id} p={item.p} s={item.s} c={item.c}/>)}

 <B p={[-20.5,.68,29.435]} s={[.96,.78,.035]} c="#252c29"/>
 {[0,1,2].map(i=><mesh key={i} position={[-20.75+i*.25,.53,29.4]} scale={[.10,.21+(i%2)*.1,.05]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#f2ba6e" emissive="#e9a74a" emissiveIntensity={1.2}/></mesh>)}
 {[[-26.5,25.1],[-22.5,25.1],[-33.25,24],[-20,29.2]].map(([x,z],i)=><group key={i}><B p={[x,.07,z]} s={[.38,.14,.38]} c="#494138"/><B p={[x,.97,z]} s={[.035,1.8,.035]} c="#b2986b"/><mesh position={[x,1.92,z]}><coneGeometry args={[.25,.32,12,1,true]}/><meshStandardMaterial color="#f1dfb9" emissive="#e5b566" emissiveIntensity={.4} side={THREE.DoubleSide}/></mesh></group>)}

 {[-27,-19].map(x=><group key={x}><B p={[x,5.7,20]} s={[.035,2.6,.035]} c="#806c49"/><mesh position={[x,4.4,20]}><sphereGeometry args={[.3,10,8]}/><meshStandardMaterial color="#fff0cb" emissive="#ffd18b" emissiveIntensity={time==='evening'?1:.4}/></mesh><pointLight position={[x,4,20]} color="#ffd7a0" intensity={5} distance={12}/></group>)}
 </StaticBatch>
 </group></group></CafeSignContext.Provider>
}
