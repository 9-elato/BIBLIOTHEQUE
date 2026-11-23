import CoastalStudy from './CoastalStudy'
import StaticBatch from './StaticBatch'
import {makeStudyFinish,disposeStudyFinishes} from './studyFinishes'
import React,{useMemo,useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {CarvedBox as B,ReadingChair,WovenRug,Folios,Quill,WallSconce} from './StorybookDecor'
import StoryWindow from './WindowLandscape'
import {studyTexture} from './studyTextures'
import {studySeason,advanceStudyDoor} from './studyLayout'
function Painting({p,turn=0,index=0}){return <group position={p} rotation={[0,turn,0]}><B s={[.83,.65,.08]} c="#af915a"/><B p={[0,0,.05]} s={[.70,.52,.02]} c={['#86958b','#8e847e','#7c8a96'][index%3]}/><B p={[0,-.16,.069]} s={[.70,.20,.008]} c="#536350"/><mesh position={[-.16,.1,.077]}><circleGeometry args={[.08,18]}/><meshStandardMaterial color="#d7bf8d"/></mesh>{[-.2,.1,.27].map((x,i)=><mesh key={x} position={[x,-.06,.077]}><coneGeometry args={[.12,.23+i*.05,5]}/><meshStandardMaterial color="#3e5445"/></mesh>)}</group>}
function RoundRug({p,r=1.45}){return <group position={p} rotation={[-Math.PI/2,0,0]}><mesh><circleGeometry args={[r,64]}/><meshStandardMaterial color="#733e49" roughness={1}/></mesh>{[r-.1,r-.2,r*.6].map(a=><mesh key={a} position={[0,0,.004]}><ringGeometry args={[a-.018,a,64]}/><meshStandardMaterial color="#c9b58e"/></mesh>)}</group>}
export default function StudyRoom({open,prepare=false,door,time,weather,event,onNotes,onMusic,playerPosition}){
 const [prepared,setPrepared]=useState(false)
 useEffect(()=>{if(open||prepare)setPrepared(true)},[open,prepare])
 const refs=useRef([]),clock=useRef(),disc=useRef(),season=studySeason(undefined,weather)
 const [lamp,setLamp]=useState(()=>localStorage.getItem('mll-study-lamp')!=='off')
 useEffect(()=>{const toggle=()=>setLamp(v=>{localStorage.setItem('mll-study-lamp',v?'off':'on');return !v});window.addEventListener('study-lamp-toggle',toggle);return()=>window.removeEventListener('study-lamp-toggle',toggle)},[])
 const finishes=useMemo(()=>Object.fromEntries(['walnut','leather','velvet','brass'].map(k=>[k,makeStudyFinish(k)])),[])
 useEffect(()=>()=>disposeStudyFinishes(finishes),[finishes])
 const textures=useMemo(()=>({wall:studyTexture('wall'),floor:studyTexture('floor')}),[])
 useEffect(()=>()=>Object.values(textures).forEach(t=>t.dispose()),[textures])
 useFrame((state,dt)=>{
  advanceStudyDoor(door,dt,playerPosition?.current)
  refs.current.forEach((r,i)=>{if(r)r.rotation.y=-(door.swing??-1)*(i===0?1:-1)*door.amount*Math.PI/2})
  if(clock.current)clock.current.rotation.z=-state.clock.elapsedTime*.10
  if(disc.current)disc.current.rotation.y+=dt*.3
 })
 // Prepare the room behind the closed bookcase on approach so clicking the
 // key book does not also construct all furniture and compile its materials.
 if(!open&&!prepare&&!prepared)return null
 const activate=fn=>e=>{e.stopPropagation();fn()}
 return <group visible={open||prepare}><StaticBatch revision={`${time}:${weather}:${event}:${lamp}`}>
  {[-1,1].map(side=><group key={side}>
   <B p={[side*1.37,2.89,-17]} s={[.10,5.75,3.8]} c="#483025"/>
   <B p={[side*1.30,1.15,-17]} s={[.06,.06,3.8]} c="#a08053"/>
   <Painting p={[side*1.29,1.97,side<0?-16.2:-17.3]} turn={-side*Math.PI/2} index={side+1}/>
  </group>)}
  <Painting p={[-1.29,1.97,-18.1]} turn={Math.PI/2} index={1}/>
  <group position={[1.28,2.45,-15.8]} rotation={[0,-Math.PI/2,0]}><B s={[.46,.68,.10]} c="#593b2a"/><mesh position={[0,.08,.07]}><circleGeometry args={[.18,32]}/><meshStandardMaterial color="#e6d7b7"/></mesh><group userData={{noBatch:true}} ref={clock} position={[0,.08,.08]}><B p={[0,.06,0]} s={[.012,.14,.01]} c="#3d332b"/></group><B p={[.055,.08,.09]} s={[.11,.015,.01]} c="#3d332b"/></group>
  <B p={[0,6.5,-19]} s={[3.02,2.2,.19]} c="#4d3528"/>
  {[-1,1].map((side,i)=><group key={side} position={[side*1.32,0,-19]}><group userData={{noBatch:true}} ref={el=>refs.current[i]=el}><B p={[-side*.66,2.7,0]} s={[1.31,5.4,.16]} c="#513628"/>{[.78,2.45].map(y=><B key={y} p={[-side*.66,y,.095]} s={[1.05,1.24,.045]} c="#654735"/>)}<B p={[-side*1.12,1.5,.14]} s={[.055,.23,.06]} c="#b5995c" metal={.7}/></group></group>)}
  {/* Finishes and a generous central route; all floor props have matching collision boxes. */}
  <mesh position={[0,.024,-24.3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[14.1,10.4]}/><meshStandardMaterial map={textures.floor} bumpMap={textures.floor} bumpScale={.018} roughness={.87}/></mesh>
  {[-1,1].map(side=><group key={side}>
   {(side<0?[[-29.5,-19.1]]:[[-29.5,STUDY_EXIT.z-1],[STUDY_EXIT.z+1,-19.1]]).map(([a,b])=><group key={a}>
    <B p={[side*7.03,.61,(a+b)/2]} s={[.10,1.2,b-a]} c="#493025"/>
    <mesh position={[side*7.025,4.4,(a+b)/2]} rotation={[0,-side*Math.PI/2,0]}><planeGeometry args={[b-a,6.2]}/><meshStandardMaterial map={textures.wall} roughness={1}/></mesh>
   </group>)}
   {[-28.9,-26.8,-24.7,-22.6,-20].map(z=><B key={z} p={[side*6.98,.62,z]} s={[.05,1.08,.035]} c="#a08055"/>)}
   {[-28.9,-19.6].map(z=><B key={z} p={[side*6.95,3.7,z]} s={[.18,7.3,.18]} c="#684731"/>)}
  </group>)}

  {[-1,1].map(side=><group key={'front'+side}><B p={[side*4.3,.6,-19.16]} s={[5.5,1.2,.08]} c="#493025"/><mesh position={[side*4.3,4.45,-19.16]} rotation={[0,Math.PI,0]}><planeGeometry args={[5.5,6.1]}/><meshStandardMaterial map={textures.wall} roughness={1}/></mesh></group>)}
  <mesh position={[0,4.45,-29.49]}><planeGeometry args={[14.0,6.1]}/><meshStandardMaterial map={textures.wall} roughness={1}/></mesh>
  <B p={[0,.6,-29.44]} s={[14.1,1.2,.10]} c="#4b3225"/>
  <WovenRug p={[0,.05,-26.45]} size={[4.9,3.7]} color="#763d4c"/>
  <RoundRug p={[-3.8,.067,-24.8]}/>
  {/* Writing desk: broad top, two drawer pedestals, keyholes and a leather blotter. */}
  <CoastalStudy time={time} weather={weather} onMusic={onMusic}/><group position={[0,0,-28.42]}>
   <B finish={finishes.walnut} p={[0,.91,0]} s={[3.2,.22,1.65]} c="#513627"/>
   {[-1,1].map(side=><group key={side}>
    <B finish={finishes.walnut} p={[side*1.16,.42,0]} s={[.72,.84,1.51]} c="#483023"/>
    {[.2,.44,.68].map(y=><group key={y}><B finish={finishes.walnut} p={[side*1.16,y,.78]} s={[.65,.20,.035]} c="#6b4933"/><B finish={finishes.brass} p={[side*1.16,y,.815]} s={[.19,.028,.035]} c="#b9975c" metal={.7}/></group>)}
    <mesh position={[side*1.16,.76,.824]}><circleGeometry args={[.018,12]}/><meshStandardMaterial color="#211d18"/></mesh>
   </group>)}
   <B finish={finishes.leather} p={[0,1.032,.06]} s={[1.6,.016,1.05]} c="#294f3e"/>
   <group userData={{noBatch:true}} onClick={activate(onNotes)}><B p={[-.12,1.06,.23]} s={[.55,.04,.38]} c="#e0d1ad"/><B p={[-.12,1.085,.23]} s={[.012,.005,.36]} c="#8c6c4c"/></group>
   <Quill p={[.62,1.035,-.03]}/><Folios tidy p={[1.13,1.035,-.08]}/>
   <group userData={{noBatch:true}} position={[-.95,1.04,-.1]} onClick={activate(()=>{setLamp(v=>{localStorage.setItem('mll-study-lamp',v?'off':'on');return !v})})}>
    <B finish={finishes.brass} p={[0,.025,0]} s={[.39,.05,.27]} c="#a2874f" metal={.6}/><B p={[0,.28,0]} s={[.035,.50,.035]} c="#b29454" metal={.7}/>
    <mesh position={[0,.55,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.16,.16,.50,24,1,true,0,Math.PI]}/><meshStandardMaterial side={THREE.DoubleSide} color="#29533b" emissive="#6caa73" emissiveIntensity={lamp?.22:0}/></mesh>
    {lamp&&<pointLight position={[0,.42,.12]} intensity={4.5} distance={3.5} color="#ffe0a9"/>}
   </group>
   <group userData={{noBatch:true}} position={[.15,1.05,-.33]} onClick={activate(onNotes)}><B p={[0,.1,0]} s={[.55,.17,.34]} c="#302d2a"/>{Array.from({length:18},(_,i)=><B key={i} p={[(i%6-2.5)*.07,.195,.03+Math.floor(i/6)*.07]} s={[.04,.025,.04]} c="#c8bfa6"/>)}<B p={[0,.3,-.1]} s={[.43,.24,.016]} c="#e6dcc3"/></group>
  </group>

  <ReadingChair finish={finishes.leather} item={{x:0,z:-26.65,level:0,turn:Math.PI,color:'#543b31'}}/>
  <group position={[0,5.5,-24.7]}><B p={[0,1,0]} s={[.04,2,.04]} c="#a68a53" metal={.6}/><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[.72,.035,8,40]}/><meshStandardMaterial color="#b79a60" metalness={.7}/></mesh>{[0,1,2,3,4,5].map(i=><group key={i} position={[Math.cos(i*Math.PI/3)*.72,0,Math.sin(i*Math.PI/3)*.72]}><B p={[0,.14,0]} s={[.09,.28,.09]} c="#ead8b2"/><mesh position={[0,.34,0]}><sphereGeometry args={[.065,12,8]}/><meshStandardMaterial color="#ffe8b4" emissive="#ffce85" emissiveIntensity={1.4}/></mesh></group>)}<pointLight position={[0,-.25,0]} intensity={10} distance={13} color="#ffdcab"/></group>
  <group position={[-5.4,0,-19.85]} rotation={[0,Math.PI,0]} scale={[.74,1,1]}><B p={[0,.44,0]} s={[3,.18,.82]} c="#4c3325"/>{[-1.2,1.2].map(x=><B key={x} p={[x,.2,0]} s={[.14,.4,.55]} c="#62432e"/>)}<B finish={finishes.velvet} p={[0,.59,0]} s={[2.9,.16,.76]} c="#7d5557" r={.07}/>{[-.9,.8].map(x=><B key={x} p={[x,.8,-.1]} s={[.52,.24,.47]} c="#cdbf9d" r={.10} rot={[.15,x*.13,0]}/>)}<B p={[.35,.72,.15]} s={[.64,season==='winter'?.15:.055,.75]} c="#74806a" r={.04}/></group>
  <group userData={{noBatch:true}} position={[6.40,.13,-25.9]} rotation={[0,-Math.PI/2,0]} scale={[1.5,1,1]} onClick={e=>{e.stopPropagation();onMusic()}}><B p={[0,.54,0]} s={[1.1,1.08,1.15]} c="#4b3427"/>{Array.from({length:12},(_,i)=><B key={i} p={[-.42+i*.075,.52,.58]} s={[.035,.7,.04]} c={['#ab8c68','#476659','#8a5960'][i%3]}/>)}<B p={[0,1.12,0]} s={[1.02,.12,1.05]} c="#846446"/><group userData={{noBatch:true}} ref={disc} position={[0,1.195,.03]} scale={[2/3,1,1]}><mesh><cylinderGeometry args={[.36,.36,.018,40]}/><meshStandardMaterial color="#222125" roughness={.4}/></mesh><mesh position={[0,.012,0]}><cylinderGeometry args={[.10,.10,.008,24]}/><meshStandardMaterial color="#a96e5f"/></mesh></group><B p={[.32,1.24,-.05]} s={[.025,.025,.57]} c="#c1a76e" metal={.6} rot={[0,-.3,0]}/></group>
  <group position={[5.5,1.95,-28.8]}>{season==='spring'?<><B p={[0,.15,0]} s={[.16,.3,.16]} c="#b1b8a0"/>{[-.12,0,.12].map(x=><mesh key={x} position={[x,.45,0]}><sphereGeometry args={[.1,10,8]}/><meshStandardMaterial color="#c68d99"/></mesh>)}</>:season==='summer'?<><mesh position={[0,.16,0]}><cylinderGeometry args={[.10,.08,.30,16]}/><meshPhysicalMaterial color="#cde3df" transparent opacity={.35}/></mesh><B p={[.3,.04,0]} s={[.35,.04,.24]} c="#c6ba96"/></>:season==='autumn'?<><mesh position={[0,.10,0]}><cylinderGeometry args={[.13,.10,.18,16]}/><meshStandardMaterial color="#d1b68c"/></mesh>{[-.3,.3].map(x=><B key={x} p={[x,.02,0]} s={[.18,.015,.12]} c="#af7951" rot={[0,x*2,0]}/>)}</>:<>{[-.22,.22].map(x=><group key={x}><B p={[x,.18,0]} s={[.09,.36,.09]} c="#e8d3ad"/><mesh position={[x,.40,0]}><sphereGeometry args={[.035,8,6]}/><meshStandardMaterial color="#ffe0a1" emissive="#ffc875" emissiveIntensity={1.5}/></mesh></group>)}</>}</group>
  {season==='summer'&&<group position={[5.86,2.05,-28.7]} rotation={[-.3,0,.2]}><mesh><circleGeometry args={[.24,24,0,Math.PI]}/><meshStandardMaterial color="#d9caab" side={THREE.DoubleSide}/></mesh>{[0,1,2,3,4,5,6].map(i=><B key={i} p={[Math.cos(i*Math.PI/6)*.10,Math.sin(i*Math.PI/6)*.10,.012]} s={[.012,.23,.008]} c="#9d8057" rot={[0,0,i*Math.PI/6-Math.PI/2]}/>)}</group>}
  {season==='spring'&&<group position={[6.25,.72,-22.5]}><mesh position={[0,.12,0]}><cylinderGeometry args={[.13,.09,.24,12]}/><meshStandardMaterial color="#99745c"/></mesh>{[-1,1].map(a=><mesh key={a} position={[a*.08,.37,0]} rotation={[0,0,a*.4]}><sphereGeometry args={[.12,12,8]}/><meshStandardMaterial color="#718960"/></mesh>)}</group>}
  {event==='christmas' &&<group position={[5.55,2,-28.8]}><mesh position={[0,.6,0]}><coneGeometry args={[.38,1.1,10]}/><meshStandardMaterial color="#375a40"/></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[Math.cos(i*2)*.22,.25+i*.13,Math.sin(i*2)*.22]}><sphereGeometry args={[.055,8,6]}/><meshStandardMaterial color="#c2a36b"/></mesh>)}</group>}
  {event==='halloween'&&<mesh position={[-5.55,2.05,-28.8]}><sphereGeometry args={[.24,12,10]}/><meshStandardMaterial color="#9e673d" roughness={1}/></mesh>}
 </StaticBatch></group>
}
import {STUDY_EXIT} from './eastMeadowLayout'
