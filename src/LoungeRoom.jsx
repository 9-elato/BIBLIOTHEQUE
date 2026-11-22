import StaticBatch from './StaticBatch'
import {WindowLandscape} from './WindowLandscape'
import React,{useMemo,useEffect,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {RoundedBox} from '@react-three/drei'
import * as THREE from 'three'
import {SOFAS} from './layout'

const wood='#513327',brass='#b89454',ivory='#d7c3a2'
function Box({p,s,c=wood,r=.025,map,rot=[0,0,0],metal=0}){
 return <RoundedBox args={s} radius={Math.min(r,...s.map(v=>v*.4))} smoothness={2} position={p} rotation={rot} castShadow receiveShadow>
  <meshStandardMaterial color={c} map={map} roughness={metal?.37:.85} metalness={metal}/>
 </RoundedBox>
}
function Ball({p,s=[.1,.1,.1],c=brass,metal=0}){
 return <mesh position={p} scale={s} castShadow><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color={c} roughness={metal?.36:.8} metalness={metal}/></mesh>
}
function textures(){
 const make=(size,draw)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=size;draw(canvas.getContext('2d'),size);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t}
 const fabric=make(128,(c,n)=>{c.fillStyle='#b9afa3';c.fillRect(0,0,n,n);for(let i=0;i<n;i+=3){c.strokeStyle=i%2?'#c9bfb2':'#a89e93';c.lineWidth=.5;c.beginPath();c.moveTo(i,0);c.lineTo(i,n);c.moveTo(0,i);c.lineTo(n,i);c.stroke()}})
 fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(2,2)
 const grain=make(256,(c,n)=>{c.fillStyle='#c4a581';c.fillRect(0,0,n,n);for(let i=0;i<170;i++){c.strokeStyle=`rgba(68,36,20,${.03+i%5*.015})`;c.beginPath();for(let x=0;x<=n;x+=8){const y=i*1.55+Math.sin(x*.03+i)*2;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}})
 grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,2)
 const rug=make(512,(c,n)=>{
  c.fillStyle='#633b3e';c.fillRect(0,0,n,n)
  ;[[12,'#bd9566',4],[24,'#344c46',14],[38,'#c59e6e',3],[55,'#916e4e',3]].forEach(([inset,color,width])=>{c.strokeStyle=color;c.lineWidth=width;c.strokeRect(inset,inset,n-2*inset,n-2*inset)})
  c.save();c.translate(n/2,n/2);c.rotate(Math.PI/4);c.fillStyle='#304d46';c.fillRect(-90,-90,180,180);c.strokeStyle='#caa675';c.lineWidth=5;c.strokeRect(-98,-98,196,196);c.restore()
  for(let y=85;y<460;y+=57)for(let x=85;x<460;x+=57){if(Math.hypot(x-256,y-256)<135)continue;c.fillStyle='#b6956a';c.beginPath();c.ellipse(x,y,4,9,.4,0,Math.PI*2);c.fill()}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;c.fillStyle=i%2?'#bc9769':'#94614c';c.beginPath();c.ellipse(256+Math.cos(a)*37,256+Math.sin(a)*37,20,8,a,0,Math.PI*2);c.fill()}
 })
 const portrait=make(256,(c,n)=>{
  c.fillStyle='#7f8e80';c.fillRect(0,0,n,n);c.fillStyle='#d2b887';c.beginPath();c.arc(178,64,25,0,Math.PI*2);c.fill()
  ;[['#596b60',110],['#3c544d',155],['#30433d',202]].forEach(([color,y])=>{c.fillStyle=color;c.beginPath();c.moveTo(0,n);for(let x=0;x<=n;x+=16)c.lineTo(x,y+Math.sin(x*.024)*28);c.lineTo(n,n);c.fill()})
  c.strokeStyle='#b59e70';c.lineWidth=3;c.beginPath();c.moveTo(140,120);c.bezierCurveTo(90,165,190,190,130,256);c.stroke()
 })
 return {fabric,grain,rug,portrait}
}
function Foot({x,z,map}){
 const profile=useMemo(()=>[[.10,0],[.14,.04],[.11,.09],[.075,.17],[.12,.23],[.1,.29]].map(([x,y])=>new THREE.Vector2(x,y)),[])
 return <mesh position={[x,.04,z]} castShadow><latheGeometry args={[profile,14]}/><meshStandardMaterial color={wood} map={map} roughness={.7}/></mesh>
}
function UpholsteredSeat({item,maps}){
 const {x,z,seats,turn,color}=item,w=seats*.72+.35,chair=seats===1
 return <group position={[x,0,z]} rotation={[0,turn,0]}>
  <Box p={[0,.31,0]} s={[w,.22,1.08]} map={maps.grain}/>
  {[-1,1].flatMap(a=>[-.36,.36].map(d=><Foot key={`${a}/${d}`} x={a*(w/2-.18)} z={d} map={maps.grain}/>))}
  <Box p={[0,.46,0]} s={[w-.09,.28,1.04]} c={color} r={.09} map={maps.fabric}/>
  <Box p={[0,chair?1.17:1.04,-.42]} s={[w,.98+(chair?.35:0),.23]} c={wood} r={.1} map={maps.grain}/>
  <Box p={[0,chair?1.2:1.07,-.28]} s={[w-.19,chair?1.13:.84,.21]} c={color} r={.09} map={maps.fabric}/>
  {Array.from({length:seats},(_,i)=>{const xx=(i-(seats-1)/2)*.72;return <group key={i}>
   <Box p={[xx,.60,.075]} s={[.695,.22,.84]} c={color} r={.08} map={maps.fabric}/>
   <Box p={[xx,.67,.49]} s={[.62,.014,.015]} c="#c4a081" r={.005}/>
   {[.91,1.24].map((y,j)=><Ball key={y} p={[xx+(j%2?.08:-.08),y,-.153]} s={[.031,.031,.017]} c="#b99569" metal={.25}/>)}
  </group>})}
  {[-1,1].map(a=><group key={a}>
   <Box p={[a*(w/2-.09),.76,.04]} s={[.22,.42,1.03]} c={color} r={.085} map={maps.fabric}/>
   <mesh position={[a*(w/2-.09),.97,.04]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.12,.12,.88,18]}/><meshStandardMaterial color={color} map={maps.fabric} roughness={.84}/></mesh>
   {Array.from({length:8},(_,i)=><Ball key={i} p={[a*(w/2+.025),.61,.42-i*.12]} s={[.018,.018,.018]} metal={.6}/>)}
   {chair&&<Box p={[a*(w/2-.08),1.32,-.20]} s={[.15,.63,.35]} c={color} map={maps.fabric} r={.07}/>}
  </group>)}
  {/* A folded throw stays on the outside arm, leaving all seat anchors clear. */}
  {seats>2&&<group position={[w/2-.03,.96,.1]}>
   <Box p={[.06,-.18,0]} s={[.09,.55,.5]} c="#b99d79" map={maps.fabric} r={.025}/>
   {Array.from({length:7},(_,i)=><Box key={i} p={[.07,-.48,-.21+i*.07]} s={[.018,.1,.018]} c="#d9c5a2"/>)}
  </group>}
 </group>
}
function Fire({time}){
 const flames=useRef(),light=useRef()
 useFrame(({clock})=>{
  const t=clock.elapsedTime
  if(light.current)light.current.intensity=(time==='evening'?13:10)+Math.sin(t*3.1)*.75+Math.sin(t*7.7)*.3
  flames.current?.children.forEach((child,i)=>{child.scale.y=.88+.18*Math.sin(t*4.2+i*1.7);child.rotation.z=Math.sin(t*2.1+i)*.09})
 })
 return <group>
  {[-.62,-.2,.22,.63].map((x,i)=><mesh key={i} position={[x,.29,.16]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.14,.16,.73,10]}/><meshStandardMaterial color={i%2?'#403026':'#59402c'} roughness={1}/></mesh>)}
  <group ref={flames}>{[-.65,-.32,0,.34,.65].map((x,i)=><group key={i} position={[x,.3,.13]}>
   <Ball p={[0,.28,0]} s={[.16,.4+(i%2)*.12,.13]} c="#d36c29"/>
   <mesh position={[0,.25,.07]} scale={[.11,.32,.1]}><sphereGeometry args={[1,12,9]}/><meshStandardMaterial color="#ffb650" emissive="#ff8e28" emissiveIntensity={2.2} roughness={1}/></mesh>
   <mesh position={[0,.1,.1]} scale={[.08,.15,.07]}><sphereGeometry args={[1,12,9]}/><meshStandardMaterial color="#ffe0a0" emissive="#ffd27a" emissiveIntensity={2}/></mesh>
  </group>)}</group>
  <pointLight ref={light} position={[0,.9,.6]} color="#ffb86a" intensity={10} distance={9} decay={2} castShadow shadow-mapSize={[512,512]} shadow-bias={-.001}/>
 </group>
}
function Fireplace({maps,time}){
 return <group position={[-13.8,0,-5.9]}>
  <Box p={[0,1.45,-.53]} s={[4.28,2.9,.4]} c="#8f7862" r={.035}/>
  <Box p={[0,1.06,-.29]} s={[2.85,2.12,.08]} c="#261e1b"/>
  {[-1,1].map(a=><group key={a}>
   {[.34,.86,1.38,1.90].map((y,i)=><Box key={y} p={[a*1.69,y,.01]} s={[.66,.49,.73]} c={i%2?'#b4a087':'#c0ad93'} r={.035}/>)}
   <Box p={[a*1.69,2.2,.02]} s={[.84,.16,.87]} c={ivory}/>
   <Box p={[a*1.69,.09,.15]} s={[.86,.18,.97]} c="#a08b73"/>
  </group>)}
  {Array.from({length:11},(_,i)=>{const a=Math.PI*i/10;return <Box key={i} p={[Math.cos(a)*1.39,1.74+Math.sin(a)*.81,.05]} s={[.43,.32,.72]} c={i%2?'#c4b296':'#b7a58b'} rot={[0,0,a-Math.PI/2]}/>})}
  <Box p={[0,2.74,.04]} s={[4.42,.23,1.01]} c="#d1b995"/>
  <Box p={[0,2.92,.03]} s={[4.15,.12,.86]} c={wood} map={maps.grain}/>
  <Box p={[0,.055,.34]} s={[4.28,.11,1.25]} c="#8c7762"/>
  <Box p={[0,3.95,-.33]} s={[3.15,1.96,.46]} c="#b19b80"/>
  <Box p={[0,3.96,-.05]} s={[1.74,1.47,.10]} c={brass}/>
  <mesh position={[0,3.96,.01]}><planeGeometry args={[1.49,1.23]}/><meshStandardMaterial map={maps.portrait} roughness={.95}/></mesh>
  {[-1.55,1.55].map(x=><group key={x}>
   <Ball p={[x,3.13,.06]} s={[.13,.19,.13]} c="#60776b"/>
   <Box p={[x,3.34,.06]} s={[.09,.22,.09]} c="#dac9a7"/>
   <Ball p={[x,3.48,.06]} s={[.027,.055,.027]} c="#ffd89a"/>
  </group>)}
  <group userData={{noBatch:true}}><Fire time={time}/></group>
  {[-.9,.9].map(x=><Box key={x} p={[x,.34,.56]} s={[.06,.58,.06]} c="#38322b"/>)}
  <Box p={[0,.34,.56]} s={[1.9,.035,.035]} c="#38322b"/>
 </group>
}
function Lamp({x,z,time}){
 return <group position={[x,0,z]}>
  <mesh position={[0,.08,0]} castShadow><cylinderGeometry args={[.22,.28,.14,20]}/><meshStandardMaterial color={wood} roughness={.7}/></mesh>
  <Box p={[0,.99,0]} s={[.055,1.85,.055]} c={brass} metal={.65}/>
  <Ball p={[0,1.83,0]} s={[.12,.19,.12]} metal={.5}/>
  <mesh position={[0,2.14,0]} castShadow><cylinderGeometry args={[.22,.45,.53,28,1,true]}/><meshStandardMaterial color="#dbc6a0" side={THREE.DoubleSide} emissive="#e4ae66" emissiveIntensity={time==='evening'?.25:.12} roughness={.95}/></mesh>
  {[1.875,2.405].map((y,i)=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[i?.22:.45,.018,6,28]}/><meshStandardMaterial color={brass} metalness={.5} roughness={.4}/></mesh>)}
  <pointLight position={[0,1.85,0]} intensity={time==='evening'?10:7} distance={6} color="#ffdfaa" decay={2}/>
 </group>
}
export default function LoungeRoom({weather,time,event}){
 const maps=useMemo(textures,[])
 useEffect(()=>()=>Object.values(maps).forEach(t=>t.dispose()),[maps])
 return <StaticBatch revision={time+weather+event}>
  <Box p={[-14.05,-.12,0]} s={[13.1,.24,13.5]} c="#8b6849" map={maps.grain}/>
  {Array.from({length:25},(_,i)=><Box key={i} p={[-13.15,.005,-6.5+i*.54]} s={[11.23,.007,.014]} c="#5d4431"/>)}
  <Box p={[-14.05,7.15,0]} s={[13.1,.18,13.5]} c="#d3c1a2"/>
  <Box p={[-15.85,3.5,-6.7]} s={[9.5,7,.25]} c="#c4ad8e"/>
  <Box p={[-8.4,3.5,-6.7]} s={[1.8,7,.25]} c="#c4ad8e"/>
  <Box p={[-10.2,6.15,-6.7]} s={[1.8,1.7,.25]} c="#c4ad8e"/>
  <Box p={[-20.59,3.5,0]} s={[.25,7,13.5]} c="#c4ad8e"/>
  <Box p={[-14.05,5.95,6.7]} s={[13.1,2.2,.25]} c="#c4ad8e"/>
  <Box p={[-14.05,.62,6.7]} s={[13.1,1.24,.25]} c={wood}/>
  {/* Window bank ends meet the side walls, with no open strip to the exterior. */}
  <Box p={[-19.47,2.425,6.7]} s={[2.26,4.85,.25]} c={ivory}/>
  <Box p={[-7.72,2.425,6.7]} s={[.44,4.85,.25]} c={ivory}/>
  {[.15,1.42,6.82].map(y=><group key={y}>
   <Box p={[-15,y,-6.51]} s={[7.4,.12,.15]} c={y>4?ivory:wood}/><Box p={[-8.4,y,-6.51]} s={[1.5,.12,.15]} c={y>4?ivory:wood}/>
   <Box p={[-20.4,y,0]} s={[.15,.12,13.3]} c={y>4?ivory:wood}/>
  </group>)}
  {Array.from({length:10},(_,i)=><group key={i}>
   <Box p={[-20.39,.78,-5.9+i*1.3]} s={[.08,1.18,1.14]} c="#6b4c37" map={maps.grain}/>
   <Box p={[-20.33,.78,-5.9+i*1.3]} s={[.055,.92,.88]} c="#59402f"/>
  </group>)}
  {[-17.1,-14.46,-11.82,-9.18].map(x=><group key={x}>
   <group position={[x,3.08,6.64]} rotation={[0,Math.PI,0]}><group userData={{noBatch:true}}><WindowLandscape width={2.48} height={3.65} time={time} weather={weather} event={event}/></group></group>
   <Box p={[x,3.08,6.7]} s={[2.54,3.7,.07]} c={time==='evening'?'#566d81':weather==='rain'?'#91a9a9':'#b9ccc1'}/>
   <Box p={[x-1.29,3.08,6.59]} s={[.12,3.9,.2]} c={wood}/>
   <Box p={[x,3.1,6.56]} s={[2.6,.09,.2]} c={wood}/>
   <Box p={[x,1.24,6.48]} s={[2.64,.15,.38]} c="#b29470"/>
  </group>)}
  {[-18.22,-7.98].map(x=><group key={x}>
   {Array.from({length:5},(_,i)=><mesh key={i} position={[x+(i-2)*.11,2.95,6.32]} castShadow><cylinderGeometry args={[.12,.13,4.15,12]}/><meshStandardMaterial color="#694047" map={maps.fabric} roughness={1}/></mesh>)}
   <Box p={[x,1.65,6.18]} s={[.58,.09,.06]} c={brass}/>
  </group>)}
  <Box p={[-13.15,5,6.35]} s={[11.2,.16,.26]} c={wood}/>
  <mesh position={[-13.66,.025,-.25]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[7,7.2]}/><meshStandardMaterial map={maps.rug} roughness={1}/></mesh>
  {[-3.9,3.4].map(z=>Array.from({length:30},(_,i)=><Box key={`${z}/${i}`} p={[-17.05+i*.23,.029,z]} s={[.027,.012,.16]} c="#c1a67d"/>))}
  <Fireplace maps={maps} time={time}/>
  {SOFAS.map((item,i)=><UpholsteredSeat key={i} item={item} maps={maps}/>)}
  <Box p={[-13.4,.36,.15]} s={[1.75,.14,.85]} c="#704c31" map={maps.grain} r={.065}/>
  {[-.66,.66].flatMap(x=>[-.24,.24].map(z=><Foot key={`${x}/${z}`} x={-13.4+x} z={.15+z} map={maps.grain}/>))}
  <Lamp x={-17.9} z={-3.3} time={time}/><Lamp x={-8.25} z={4.9} time={time}/>
  {[0,1,2,3,4,5].map(i=><mesh key={i} position={[-16.35+(i%3-1)*.29,.15+Math.floor(i/3)*.25,-5.8]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.123,.15,.67,12]}/><meshStandardMaterial color={i%2?'#624431':'#926c46'} roughness={1}/></mesh>)}
 </StaticBatch>
}
