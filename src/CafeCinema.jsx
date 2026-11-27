import {Text} from '@react-three/drei'
import React,{useRef,useEffect,useContext,useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import {CafeSignContext} from './cafeSignContext'
import {Box as B} from './GroundFloor'
import {SoftPad} from './CafeSoftSeat'
import {BookCoverMesh} from './BookCover'
import {CAFE_SCALE,cinemaCurtain} from './cafeExpansion'
import {upcomingScreenings} from './cafeData'
export default function CafeCinema({config,Sign}){
 const open=useContext(CafeSignContext),left=useRef(),right=useRef()
 const stars=useMemo(()=>new Float32Array(Array.from({length:50},(_,i)=>[-30+(i*73%137)/137*13,6.3,22.5+(i*37%113)/113*7.5]).flat()),[])
 useFrame((_,dt)=>{const parted=cinemaCurtain.open;cinemaCurtain.clear=Boolean(left.current&&left.current.position.x< -26.05);const t=1-Math.exp(-5*Math.min(dt,.1));if(left.current){left.current.position.x+=((parted?-26.15:-24)-left.current.position.x)*t;right.current.position.x+=((parted?-19.85:-22)-right.current.position.x)*t}})
 useEffect(()=>()=>{cinemaCurtain.open=false;cinemaCurtain.clear=false},[])
 return <group position={[0,0,17]}>
 {Sign&&<Sign action="cafe-posters" text={'CINEMA · 상영표\n'+config.filmTitle+'\n'+upcomingScreenings(config.startTime)[0]+' · '+(config.startTime||'시작 시각 미정')+'\n클릭하여 상영 안내'} position={[-27,3,21.64]} rotation={[0,Math.PI,0]} size={[1.7,1.3]} dark compact/>}
 <Text position={[-28,2.4,17.15]} fontSize={.25} color="#e9dfca">CINEMA LOBBY · 관람 준비</Text><Text position={[-23,4.8,21.6]} rotation={[0,Math.PI,0]} fontSize={.24} color="#f2e3ca">커튼을 열고 입장하세요</Text>
 <B p={[-25,-.1,23]} s={[18,.2,16]} c="#b2a087"/>
 <B p={[-30,-.1,14.5]} s={[2,.2,1.1]} c="#b2a087"/><B p={[-30,6.5,14.5]} s={[2,.2,1.1]} c="#302d2a"/>
 <B p={[-25,6.5,23]} s={[18,.25,16.4]} c="#171a1e"/>
 {[-34,-16].map(x=><B key={x} p={[x,3.2,23]} s={[.15,6.4,16]} c="#302d2a"/>)}
 {[31].map(z=><B key={z} p={[-25,3.2,z]} s={[18,6.4,.15]} c="#302d2a"/>)}
 <B p={[-32.5,3.2,15]} s={[3,6.4,.2]} c="#302d2a"/><B p={[-22.5,3.2,15]} s={[13,6.4,.2]} c="#302d2a"/><B p={[-30,5.6,15]} s={[2,1.6,.2]} c="#302d2a"/>
 <B p={[-29.5,3.2,21.85]} s={[9,6.4,.3]} c="#282625"/><B p={[-18.5,3.2,21.85]} s={[5,6.4,.3]} c="#282625"/>
 <B p={[-23,5.65,21.85]} s={[4,1.5,.3]} c="#282625"/>
 <group onClick={e=>{e.stopPropagation();cinemaCurtain.open=true}}>
 <group ref={left} position={[-24,0,21.86]}>{Array.from({length:10},(_,i)=><B key={i} p={[-.9+i*.2,2.7,Math.sin(i)*.08]} s={[.22,5.3,.13]} c={i%2?'#59443a':'#49362f'}/>)}</group>
 <group ref={right} position={[-22,0,21.86]}>{Array.from({length:10},(_,i)=><B key={i} p={[-.9+i*.2,2.7,Math.sin(i)*.08]} s={[.22,5.3,.13]} c={i%2?'#59443a':'#49362f'}/>)}</group>
 </group>
 <group onClick={e=>{e.stopPropagation();open?.({type:'cafe-sign',cinemaLobby:true})}}>
 <B p={[-28,.58,16.5]} s={[4,1.16,1]} c="#423a31"/>
 {Array.from({length:5},(_,i)=><group key={i} position={[-29.5+i*.75,1.25,16.5]}>{i<3?<SoftPad p={[0,.12,0]} s={[.5,.24,.65]} c={i===0?'#eee3cd':'#b5a188'}/>:<mesh position={[0,.24,0]}><cylinderGeometry args={[.20,.15,.48,16]}/><meshStandardMaterial color={i===3?'#ead6a8':'#292b2c'}/></mesh>}</group>)}
 </group>
 {[config.filmPoster,...(config.posterGallery||[])].filter(Boolean).slice(0,6).map((url,i)=><group key={i} position={[-30+i*2.3,3,15.12]} scale={[1/CAFE_SCALE,1,1]} onClick={e=>{e.stopPropagation();open?.({type:'cafe-sign',text:i===0?config.filmTitle:'영화 포스터 컬렉션',image:url})}}><B p={[0,0,0]} s={[1.52,2.22,.06]} c="#171818"/><BookCoverMesh url={url} position={[0,0,.04]} size={[1.4,2.1]}/></group>)}
 <B p={[-23,3.25,30.8]} s={[6.4,6,.12]} c="#111111"/>
 <group onClick={e=>{e.stopPropagation();open?.('cafe-posters')}}><BookCoverMesh url={config.filmPoster} position={[-23,3.25,30.72]} rotation={[0,Math.PI,0]} size={[1.5,4.8]}/></group>
 {[-28,-25.5,-23,-20.5,-18].map((x,i)=><group key={x} position={[x,0,27]} scale={[1/CAFE_SCALE,1,1/CAFE_SCALE]}>
 <B p={[0,.115,0]} s={[1.4,.23,1.5]} c="#222323"/>
 <SoftPad p={[0,.48,0]} s={[1.6,.5,1.7]} c="#55483f"/>
 <group position={[0,1.05,-.58]} rotation={[-.28,0,0]}><SoftPad p={[0,0,0]} s={[1.5,1.25,.4]} c="#66574b"/></group>
 <SoftPad p={[0,.4,1.02]} s={[1.3,.24,.6]} c="#66574b"/>
 {[-.69,.69].map(a=><SoftPad key={a} p={[a,.82,0]} s={[.22,.45,1.7]} c="#4d4138"/>)}
 </group>)}
 {[-29.35,-26.75,-24.25,-21.75,-19.25,-16.7].map(x=><B key={x} p={[x,.8,27.05]} s={[.07,1.6,2.5]} c="#35322e"/>)}
 <points userData={{noCameraCollision:true}}><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial color="#f1d8a5" size={.035} sizeAttenuation depthWrite={false}/></points>
 {[-30.8,-16.5].map(x=><mesh key={x} position={[x,.025,26.4]} rotation={[-Math.PI/2,0,0]} userData={{noCameraCollision:true}}><planeGeometry args={[.035,8.1]}/><meshBasicMaterial color="#bd965b"/></mesh>)}
 </group>
}
