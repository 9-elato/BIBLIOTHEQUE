import StaticBatch from './StaticBatch'
import GreenhouseAtmosphere from './GreenhouseAtmosphere'
import {useGreenhouseRain} from './greenhouseRainAudio'
import {MeshReflectorMaterial} from '@react-three/drei'
import {useGardenWater} from './greenhouseAudio'
import {advanceGlassDoor} from './greenhouseLayout'
import React,{useMemo,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {WindowLandscape} from './WindowLandscape'
import {GREENHOUSE_HEIGHT_SCALE,GREENHOUSE_DOOR_HEIGHT,GREENHOUSE_SIDE_PANELS,GREENHOUSE_GABLE,GARDEN_LEVEL,HERBS,TROPICALS,FLOWERS,GARDEN_SEATING,FOUNTAIN,POND} from './greenhouseLayout'
const iron='#254b3c',stone='#ded9c4',brass='#b79b58',rattan='#b7a07b'
function Ball({p,s,c}){return <mesh position={p} scale={s}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={c} roughness={.83}/></mesh>}
function Tube({p,r,h,c=stone,top=r}){return <mesh position={p} receiveShadow><cylinderGeometry args={[top,r,h,24]}/><meshStandardMaterial color={c} roughness={.7}/></mesh>}
function Ring({p,r,t=.04,c=iron,rot=[Math.PI/2,0,0],arc=Math.PI*2}){return <mesh position={p} rotation={rot}><torusGeometry args={[r,t,8,48,arc]}/><meshStandardMaterial color={c} metalness={.3} roughness={.5}/></mesh>}
function Label({text}){
 const map=useMemo(()=>{const c=document.createElement('canvas');c.width=256;c.height=80;const x=c.getContext('2d');x.fillStyle='#ad955c';x.fillRect(0,0,256,80);x.strokeStyle='#5d583b';x.strokeRect(5,5,246,70);x.font='bold 31px sans-serif';x.textAlign='center';x.fillStyle='#243b2c';x.fillText(text,128,50);return new THREE.CanvasTexture(c)},[text])
 useEffect(()=>()=>map.dispose(),[map]);return <mesh position={[0,.45,.34]} rotation={[-.4,0,0]}><planeGeometry args={[.52,.16]}/><meshStandardMaterial map={map}/></mesh>
}
function Plant({type='monstera',scale=1}){
 const ref=useRef();const palm=type==='palm',fern=type==='fern',banana=type==='banana';const height=palm?2.8:banana?2.1:fern?.65:1.15
 const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(-.38,.22,-.45,.7,0,1);s.bezierCurveTo(.45,.7,.38,.22,0,0);if(type==='monstera')for(const side of [-1,1])for(let i=0;i<3;i++){const h=new THREE.Path();h.absellipse(side*.13,.32+i*.16,.055,.045,0,Math.PI*2,true);s.holes.push(h)}return s},[type])
 useFrame(({clock})=>{if(ref.current)ref.current.rotation.y=Math.sin(clock.elapsedTime*.35)*.018})
 return <group scale={scale}><Tube p={[0,.26,0]} r={.46} top={.55} h={.52} c={palm||banana?'#b37c59':'#476550'}/><Tube p={[0,.535,0]} r={.48} h={.025} c="#4e4833"/><group ref={ref} userData={{noBatch:true}}><StaticBatch><Tube p={[0,.5+height/2,0]} r={palm?.075:.035} top={.025} h={height} c="#66714b"/>{Array.from({length:palm||fern?9:8},(_,i)=>{const a=i*2.4;return <group key={i} position={[0,.55+height*(palm?1:(.3+(i%4)*.18)),0]} rotation={[palm?1.35:fern?1.1:.8+(i%3)*.23,a,0]}>
 <B p={[0,.42,0]} s={[.025,.84,.025]} c="#7e8a52"/>{palm||fern?Array.from({length:8},(_,j)=>[-1,1].map(side=><mesh key={j+':'+side} position={[side*.14,.12+j*.12,0]} rotation={[0,0,-side*.7]} scale={[fern?.45:.6,palm?.65:.45,1]}><shapeGeometry args={[shape]}/><meshStandardMaterial color={j%2?'#477650':'#6c9259'} side={THREE.DoubleSide}/></mesh>)):<mesh scale={[banana?1.25:1.2,banana?1.65:1.05,1]}><shapeGeometry args={[shape]}/><meshStandardMaterial color={i%2?'#427655':'#72965e'} side={THREE.DoubleSide} roughness={.8}/></mesh>}
 </group>})}</StaticBatch></group></group>
}
function Flowers({type,herb=false,name}){const colors={rose:'#dab4b1',hydrangea:'#b5b4cf',fuchsia:'#c58da4',begonia:'#e5c8ad',geranium:'#e0b3b1',daisy:'#f4e9ca',lavender:'#b3a2cd'};return <group><Tube p={[0,.23,0]} r={herb?.25:.4} top={herb?.32:.46} h={.46} c="#b48263"/><Tube p={[0,.47,0]} r={herb?.28:.41} h={.02} c="#554b36"/>{Array.from({length:herb?7:9},(_,i)=>{const a=i*2.4,x=Math.sin(a)*.22,z=Math.cos(a)*.22,y=.67+(i%3)*.12;return <group key={i}><B p={[x,y-.1,z]} s={[.018,.5,.018]} c="#60825b"/><Ball p={[x,y-.12,z]} s={[.13,.19,.1]} c={i%2?'#799468':'#4b7054'}/>{(!herb||type==='lavender')&&<group position={[x,y+.13,z]}>{[0,1,2,3,4].map(j=><Ball key={j} p={[Math.sin(j*1.257)*.07,0,Math.cos(j*1.257)*.07]} s={[.065,.04,.065]} c={colors[type]||'#ded3b2'}/>)}<Ball p={[0,.02,0]} s={[.04,.035,.04]} c="#c9aa62"/></group>}</group>})}{name&&<Label text={name}/>}</group>}
function Vine({x,z}){return <group position={[x,0,z]}>{Array.from({length:16},(_,i)=><group key={i} position={[Math.sin(i*.8)*.16,1+i*.21,Math.cos(i*.8)*.1]}><B p={[0,0,0]} s={[.018,.3,.018]} c="#66794b" rot={[0,0,.25*Math.cos(i)]}/><Ball p={[.09*(i%2?1:-1),.07,0]} s={[.14,.07,.11]} c={i%2?'#5a8255':'#7e9965'}/></group>)}</group>}
function Seat({s}){const bench=s.style==='bench',sofa=s.style==='sofa',w=bench?2.2:sofa?2.35:1.05;return <group position={[s.x,0,s.z]} rotation={[0,s.turn,0]}>
 {[-1,1].flatMap(a=>[-1,1].map(b=><B key={a+':'+b} p={[a*(w/2-.1),.27,b*.36]} s={[.06,.54,.06]} c={bench?iron:rattan}/>))}
 <B p={[0,.52,0]} s={[w,.13,.9]} c={bench?'#8d7754':rattan}/><B p={[0,.97,-.4]} s={[w,.8,.08]} c={bench?iron:rattan}/>
 {bench&&[-.6,0,.6].map(x=><group key={x} position={[x,1.08,-.33]}><Ring p={[0,0,0]} r={.15} t={.018} rot={[0,0,0]} c={brass}/><Ball p={[0,.03,0]} s={[.05,.12,.025]} c={iron}/></group>)}
 {Array.from({length:Math.ceil(w*12)},(_,i)=><B key={i} p={[-w/2+.05+i/12,1,-.345]} s={[.025,.65,.025]} rot={[0,0,i%2?.1:-.1]} c={bench?'#6b8870':'#d1bd9a'}/>)}
 {!bench&&<><Ball p={[0,.64,0]} s={[w*.49,.15,.44]} c="#a9b89a"/><Ball p={[0,.95,-.26]} s={[w*.45,.34,.17]} c="#afbb9f"/><Ball p={[w*.2,1.03,-.02]} s={[.25,.24,.12]} c="#e3d7b7"/>{[0,1,2,3,4].map(i=><Ball key={'petal'+i} p={[w*.2+Math.sin(i*1.257)*.07,1.03+Math.cos(i*1.257)*.07,.095]} s={[.045,.045,.012]} c="#bba6ad"/>)}{[-1,1].map(a=><B key={a} p={[a*w/2,.83,0]} s={[.08,.12,.88]} c={rattan}/>)}</>}
 </group>}
function Water({pond=false,active=false}){const rings=useRef();useFrame(({clock})=>{if(rings.current)rings.current.children.forEach((m,i)=>{const k=(clock.elapsedTime*.15+i*.24)%1;m.scale.setScalar(.2+k*.8);m.material.opacity=(1-k)*.3})});const p=pond?POND:FOUNTAIN;return <group position={[p.x,0,p.z]}>
 <Tube p={[0,pond?.12:.25,0]} r={p.radius} h={pond?.24:.5}/><Tube p={[0,pond?.25:.51,0]} r={p.radius-.12} h={.025} c="#739a93"/>{pond&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.267,0]}><circleGeometry args={[p.radius-.13,48]}/>{active?<MeshReflectorMaterial resolution={128} mirror={.45} mixStrength={.5} color="#8aa89b" metalness={.25} roughness={.28}/>:<meshStandardMaterial color="#8aa89b" metalness={.25} roughness={.28}/>}</mesh>}<Ring p={[0,pond?.27:.53,0]} r={p.radius-.06} t={.09} c={stone}/>
 <group ref={rings} position={[0,pond?.27:.53,0]}>{[0,1,2,3].map(i=><mesh key={i} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[p.radius*.85,p.radius*.85+.015,48]}/><meshBasicMaterial color="#d2e4d1" transparent opacity={.2} depthWrite={false}/></mesh>)}</group>
 {pond?<>{[-.6,.15,.6].map((x,i)=><group key={x} position={[x,.29,(i%2?.3:-.3)]}><Tube p={[0,0,0]} r={.23} h={.018} c="#698658"/>{i===1&&<FlowersSmall/>}</group>)}{Array.from({length:9},(_,i)=><Ball key={i} p={[Math.sin(i*1.7)*1.18,.26,Math.cos(i*1.7)*1.18]} s={[.15,.08,.12]} c={i%2?'#9a9c7d':'#718365'}/>)}</>:<><Tube p={[0,1.03,0]} r={.21} top={.13} h={1}/><Tube p={[0,1.52,0]} r={.48} top={.56} h={.13}/><Tube p={[0,1.7,0]} r={.1} h={.3}/><Ball p={[0,1.96,0]} s={[.22,.16,.3]} c="#e3ddc8"/><Ball p={[0,2.12,-.19]} s={[.13,.13,.13]} c="#e3ddc8"/><B p={[0,2.09,-.34]} s={[.07,.06,.14]} c={brass}/>{[0,1,2,3,4,5].map(i=><mesh key={i} position={[Math.sin(i*Math.PI/3)*.48,1.02,Math.cos(i*Math.PI/3)*.48]}><cylinderGeometry args={[.025,.04,.96,8]}/><meshStandardMaterial color="#b1d9cf" transparent opacity={.4} roughness={.1}/></mesh>)}</>}
 </group>}
function FlowersSmall(){return <group>{[0,1,2,3,4,5].map(i=><Ball key={i} p={[Math.sin(i)*.07,.045,Math.cos(i)*.07]} s={[.08,.055,.04]} c="#f0d4cd"/>)}</group>}
function Glazing({x,z,w=2.2,turn=0,time,weather,event}){return <group position={[x,0,z]} rotation={[0,turn,0]}>
 <B p={[0,.45,0]} s={[w,.9,.18]} c={stone}/><B p={[0,.94,0]} s={[w+.06,.12,.3]} c="#ece5d2"/>
 <group position={[0,2.65,-.04]} userData={{noBatch:true}}><WindowLandscape width={w-.1} height={3.25} celestial={x===0&&z<-24} time={time} weather={weather} event={event}/></group>
 {Array.from({length:Math.ceil(w/1.2)+1},(_,i)=>-w/2+i*w/Math.ceil(w/1.2)).map(x=><B key={x} p={[x,2.65,.04]} s={[.06,3.5,.09]} c={iron}/>)}{[1,2.3,4.4].map(y=><B key={y} p={[0,y,.05]} s={[w,.06,.1]} c={iron}/>)}<B p={[0,2.7,.06]} s={[w,.025,.025]} c={brass}/>
 </group>}
function GableClosure(){
 const g=GREENHOUSE_GABLE
 const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-g.halfWidth,g.eave);s.lineTo(g.halfWidth,g.eave);s.lineTo(0,g.ridge);s.closePath();return s},[])
 return <group>{[g.front,g.back].map(z=><group key={z}>
  <mesh position={[0,0,z]}><shapeGeometry args={[shape]}/><meshStandardMaterial color="#c9e1d5" transparent opacity={.23} side={THREE.DoubleSide} depthWrite={false}/></mesh>
  <B p={[0,g.eave,z]} s={[10.8,.09,.12]} c={iron}/>
  <B p={[0,(g.eave+g.ridge)/2,z]} s={[.08,g.ridge-g.eave,.12]} c={iron}/>
  {[-1,1].map(a=><B key={a} p={[a*2.7,(g.eave+g.ridge)/2,z]} s={[5.8,.10,.12]} rot={[0,0,-a*Math.atan2(g.ridge-g.eave,g.halfWidth)]} c={iron}/>)}
 </group>)}
 {/* Entry wall meets the eaves; glazing above the arched doorway closes the shell. */}
 <B p={[0,3.875,-6.95]} s={[10.8,.95,.06]} c="#c9e1d5" opacity={.23}/>

 <B p={[0,GREENHOUSE_DOOR_HEIGHT,-6.95]} s={[10.8,.09,.12]} c={iron}/>
 </group>
}
export default function Greenhouse({time,weather,event,door,active,playerPosition}){
 useGardenWater(active)
 useGreenhouseRain(active,weather)
 const shell=useRef()
 useEffect(()=>{shell.current?.traverse(o=>{if(o.isMesh&&o.material&&!o.material.transparent){o.castShadow=true;o.receiveShadow=true}})},[])
 const left=useRef(),right=useRef();useFrame((_,dt)=>{if(!door)return;advanceGlassDoor(door,dt,playerPosition?.current);const angle=-(door.swing??-1)*door.amount*Math.PI/2;if(left.current)left.current.rotation.y=angle;if(right.current)right.current.rotation.y=-angle})
 return <group ref={shell} position={[0,GARDEN_LEVEL,0]}>
 <GreenhouseAtmosphere time={time} weather={weather} active={active}/><StaticBatch revision={`${time}:${weather}:${event}`}>
 <B p={[0,-.12,-15.55]} s={[10.8,.24,17.7]} c={stone}/>{[-1,1].map(a=><B key={a} p={[a*6.9,-.12,-14.05]} s={[3.3,.24,6.5]} c={stone}/>)}
 {Array.from({length:17},(_,j)=>Array.from({length:10},(_,i)=><B key={j+':'+i} p={[-4.78+i*1.06,.005,-7.3-j]} s={[1.03,.015,.97]} c={(i+j)%3?'#d5d5c7':'#bec4bb'}/>))}
 <group scale={[1,GREENHOUSE_HEIGHT_SCALE,1]}>
 {[-1,1].map(a=><group key={a}>{GREENHOUSE_SIDE_PANELS.map(({z,w})=><Glazing key={z} x={a*5.35} z={z} w={w} turn={-a*Math.PI/2} time={time} weather={weather} event={event}/>)}
 {[-12,-14,-16].map(z=><Glazing key={z} x={a*8.5} z={z} w={2} turn={-a*Math.PI/2} time={time} weather={weather} event={event}/>)}
 {[-11,-17.2].map(z=><Glazing key={z} x={a*6.9} z={z} w={3.2} turn={z===-11?Math.PI:0} time={time} weather={weather} event={event}/>)}
 <B p={[a*2.7,5.4,-15.55]} s={[5.82,.045,17.7]} rot={[0,0,-a*.37]} c="#d1e7dc" opacity={.18}/>
 {[-7,-9,-11,-13,-15,-17,-19,-21,-23,-24.3].map(z=><group key={z}><B p={[a*2.7,5.4,z]} s={[5.82,.075,.075]} rot={[0,0,-a*.37]} c={iron}/><Ball p={[a*5.35,4.38,z]} s={[.1,.1,.1]} c={brass}/></group>)}
 {[1.2,2.7,4.2].map(x=><B key={x} p={[a*x,6.44-x*.389,-15.55]} s={[.05,.05,17.7]} c={iron}/>)}
 {[-11.1,-17.1].map(z=><B key={'post'+z} p={[a*5.25,2.2,z]} s={[.12,4.4,.12]} c={iron}/>)}<group position={[a*5.25,2,-14.1]} rotation={[0,Math.PI/2,0]} scale={[1, .75,1]}><Ring p={[0,0,0]} r={3} rot={[0,0,0]} arc={Math.PI}/></group>
 <B p={[a*6.9,4.4,-14.1]} s={[3.2,.045,6.2]} c="#cde1d5" opacity={.22}/>{[-11,-13,-15,-17.2].map(z=><B key={z} p={[a*6.9,4.45,z]} s={[3.3,.09,.08]} c={iron}/>)}
 {[-11.1,-17.1].map(z=><Vine key={z} x={a*5.23} z={z}/>)}
 <B p={[a*3.4,GREENHOUSE_DOOR_HEIGHT/2,-6.95]} s={[3.9,GREENHOUSE_DOOR_HEIGHT,.12]} c="#b9d3c5" opacity={.25}/><B p={[a*3.4,.45,-6.95]} s={[3.9,.9,.2]} c={stone}/>
 </group>)}
 {[-4.25,-2.12,0,2.12,4.25].map(x=><Glazing key={x} x={x} z={-24.3} w={2.12} time={time} weather={weather} event={event}/>)}
 {[-1,1].map(a=><B key={'entry-corner'+a} p={[a*5.35,2.175,-6.875]} s={[.10,4.35,.25]} c={iron}/>)}
 <GableClosure/>
 <B p={[0,6.46,-15.55]} s={[.12,.13,17.7]} c={brass}/>
 <mesh position={[0,6.43,-14]} scale={[1.3,.8,1.8]}><sphereGeometry args={[1,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#badbd2" transparent opacity={.28} side={THREE.DoubleSide}/></mesh>
 <Ring p={[0,6.45,-14]} r={1.3} c={brass}/>
 {[-1,1].map(a=><group key={a} position={[a*1.4,0,-6.95]}><B p={[0,1.75,0]} s={[.1,3.5,.15]} c={iron}/><group ref={a<0?left:right} userData={{noBatch:true}}><B p={[-a*.7,GREENHOUSE_DOOR_HEIGHT/2,0]} s={[1.34,GREENHOUSE_DOOR_HEIGHT-.05,.055]} c="#c9e4d7" opacity={.23}/>{[0,.7,1.4].map(x=><B key={x} p={[-a*x,GREENHOUSE_DOOR_HEIGHT/2,0]} s={[.04,GREENHOUSE_DOOR_HEIGHT,.08]} c={iron}/>)}{[.1,1.2,GREENHOUSE_DOOR_HEIGHT].map(y=><B key={y} p={[-a*.7,y,0]} s={[1.4,.045,.08]} c={iron}/>)}<B p={[-a*1.2,1.18,.09]} s={[.04,.28,.06]} c={brass}/></group></group>)}
 <group position={[0,GREENHOUSE_DOOR_HEIGHT,-6.95]} scale={[1,.46,1]}><Ring p={[0,0,0]} r={1.4} rot={[0,0,0]} arc={Math.PI}/></group>
 </group>
 <Ring p={[0,.04,-14]} r={2.05} t={.08} c="#7b8d7b"/>{Array.from({length:12},(_,i)=><B key={i} p={[Math.sin(i*Math.PI/6)*1.85,.03,-14+Math.cos(i*Math.PI/6)*1.85]} s={[.18,.025,.18]} rot={[0,i*Math.PI/6,0]} c={brass}/>)}
 <group userData={{noBatch:true}}><Water active={active}/><Water pond active={active}/></group>
 {[-1,1].map(a=><group key={'path'+a}>{[-12,-13,-14,-15,-16].map((z,i)=><mesh key={z} position={[a*(2.05+(i%2)*.1),.03,z]} rotation={[-Math.PI/2,0,i*.4]}><circleGeometry args={[.42,6]}/><meshStandardMaterial color={i%2?'#c4c3b4':'#ded9c8'}/></mesh>)}</group>)}
 {FLOWERS.map(([x,z],i)=><group key={'moss'+i}>{[0,1,2,3].map(j=><Ball key={j} p={[x+Math.sin(j*2)*.48,.045,z+Math.cos(j*2)*.5]} s={[.2,.04,.16]} c={j%2?'#7d8d68':'#adb09a'}/>)}</group>)}
 {TROPICALS.map(p=><group key={p.name} position={[p.x,0,p.z]}><Plant {...p}/></group>)}
 {HERBS.map(p=><group key={p.name} position={[p.x,0,p.z]}><Flowers {...p} herb/></group>)}
 {FLOWERS.map(([x,z,type])=><group key={type} position={[x,0,z]}><Flowers type={type}/></group>)}
 {GARDEN_SEATING.filter(s=>!s.id.endsWith('right')).map(s=><Seat key={s.id} s={s}/>)}
 <Tube p={[6.7,.025,-13]} r={1.35} h={.03} c="#9aab90"/>
 <group position={[5.75,0,-15.7]}><Tube p={[0,.34,0]} r={.08} h={.68} c="#796548"/><Tube p={[0,.7,0]} r={.55} h={.1} c="#9b8463"/><Tube p={[0,.76,0]} r={.51} h={.02} c="#e9e0c8"/>{Array.from({length:24},(_,i)=><Ball key={i} p={[Math.sin(i*Math.PI/12)*.5,.75,Math.cos(i*Math.PI/12)*.5]} s={[.06,.02,.06]} c="#ece6d4"/>)}<Ball p={[0,.9,0]} s={[.16,.13,.14]} c="#ebe5d4"/><Tube p={[0,1.03,0]} r={.07} h={.03} c={brass}/>{[-1,1].map(a=><group key={a}><Tube p={[a*.31,.79,.13]} r={.12} h={.02} c="#f0eadb"/><Tube p={[a*.31,.85,.13]} r={.065} top={.085} h={.1} c="#e9e3d1"/></group>)}</group>

 </StaticBatch></group>
}
