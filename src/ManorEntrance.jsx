import StaticBatch from './StaticBatch'
import React, {useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Text} from '@react-three/drei'
import * as THREE from 'three'
import GardenDetails from './GardenDetails'

// v2.3 architectural facade, functional two-leaf door, and a small vestibule.
// The world uses +Z for the garden and -Z for the central library.
const P={stone:'#d6cec0',stone2:'#e8dfcf',mortar:'#baa991',wood:'#513c32',woodTrim:'#8d654b',brass:'#b59055',slate:'#48505a',glass:'#759fa5',green:'#56724b'}
function MeshBox({p,s,c,rot=[0,0,0],metalness=0,roughness=.8,onClick}){return <mesh position={p} rotation={rot} onClick={onClick} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={roughness} metalness={metalness}/></mesh>}
function Round({p,r,c}){return <mesh position={p} castShadow><sphereGeometry args={[r,12,10]}/><meshStandardMaterial color={c} roughness={.92}/></mesh>}
function Column({p,r=0.08,h=1,c=P.wood}){return <mesh position={p} castShadow><cylinderGeometry args={[r,r,h,10]}/><meshStandardMaterial color={c} roughness={.85}/></mesh>}
function Arch({x=0,y=4,z=11.5,r=1.55,thick=.12,color=P.stone2,half=true}){const curve=new THREE.EllipseCurve(0,0,r,r*.64,0,Math.PI,false,0);const pts=curve.getPoints(32).map(v=>new THREE.Vector3(x+v.x,y+v.y,z));const path=new THREE.CatmullRomCurve3(pts);return <mesh castShadow><tubeGeometry args={[path,40,thick,8,false]}/><meshStandardMaterial color={color} roughness={.82}/></mesh>}
function Window({x,y,z=11.55,w=1.7,h=2.45,arch=false}){return <group>
  {/* exterior stone reveal and deep wood sash, not a decal */}
  <MeshBox p={[x,y,z+.05]} s={[w+.40,h+.38,.27]} c={P.stone2}/>
  <MeshBox p={[x,y,z+.215]} s={[w+.12,h+.11,.12]} c={P.woodTrim}/>
  <MeshBox p={[x,y,z+.288]} s={[w-.10,h-.12,.025]} c={P.glass} roughness={.18}/>
  <mesh position={[x,y,z+.312]}><planeGeometry args={[w-.14,h-.15]}/><meshStandardMaterial color={P.glass} transparent opacity={.36} roughness={.15} metalness={.12} emissive="#f7c77c" emissiveIntensity={.14}/></mesh>
  <MeshBox p={[x,y,z+.34]} s={[.065,h-.08,.105]} c={P.wood}/>
  <MeshBox p={[x,y,z+.34]} s={[w-.06,.065,.105]} c={P.wood}/>
  {[-1,1].map(i=><MeshBox key={i} p={[x+i*w/4,y,z+.34]} s={[.045,h-.10,.10]} c={P.woodTrim}/>)}
  <MeshBox p={[x,y-h/2-.22,z+.36]} s={[w+.6,.16,.55]} c={P.stone2}/>
  <MeshBox p={[x,y+h/2+.13,z+.21]} s={[w+.38,.12,.23]} c={P.mortar}/>
  {arch&&<Arch x={x} y={y+h/2+.08} z={z+.33} r={w/2+.12} thick={.07} color={P.stone2}/>}
  <mesh position={[x,y,z+.32]}><planeGeometry args={[w*.5,h*.74]}/><meshBasicMaterial color="#fff3cb" transparent opacity={.055}/></mesh>
 </group>}
function WallLamp({x,y,z,evening}){return <group><MeshBox p={[x,y,z]} s={[.18,.40,.18]} c={P.brass} metalness={.55}/><Column p={[x,y+.35,z+.16]} h={.56} r={.045} c={P.brass}/><mesh position={[x,y+.63,z+.18]}><sphereGeometry args={[.20,12,10]}/><meshStandardMaterial color="#ffe9b8" emissive="#ffd08d" emissiveIntensity={evening?2.5:.8}/></mesh><pointLight position={[x,y+.55,z+.48]} color="#ffd9a2" intensity={evening?4:.7} distance={5}/></group>}
function Planter({x,z}){return <group><mesh position={[x,.43,z]} castShadow><cylinderGeometry args={[.38,.27,.86,12]}/><meshStandardMaterial color="#ad816a"/></mesh><Column p={[x,1.2,z]} h={.9} r={.055} c="#725c40"/>{Array.from({length:9},(_,i)=>{const a=i*2.399,r=.20+(i%3)*.17;return <Round key={i} p={[x+Math.cos(a)*r,1.45+(i%3)*.18,z+Math.sin(a)*r]} r={.24} c={i%4===0?'#88965e':P.green}/>})}</group>}
function FrontDoor({open,onToggle}){
 const left=useRef(),right=useRef();
 useFrame((_,dt)=>{if(left.current)left.current.rotation.y=THREE.MathUtils.damp(left.current.rotation.y,open?1.24:0,3.2,dt);if(right.current)right.current.rotation.y=THREE.MathUtils.damp(right.current.rotation.y,open?-1.24:0,3.2,dt)});
 const leaf=(side)=>{const isLeft=side==='left';return <group ref={isLeft?left:right} position={[isLeft?-1.33:1.33,0,11.66]} onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='auto'}>
  <group position={[isLeft ? .66 : -.66,0,0]}>
   <MeshBox p={[0,2.0,0]} s={[1.30,3.96,.17]} c={P.wood}/>
   <MeshBox p={[0,2.0,.107]} s={[1.10,3.74,.07]} c="#6e4b36"/>
   {[.76,1.63,2.50,3.35].map(y=><group key={y}><MeshBox p={[0,y,.15]} s={[.94,.72,.055]} c="#654533"/><MeshBox p={[0,y,.19]} s={[.84,.59,.04]} c="#77533b"/></group>)}
   <Column p={[isLeft ? .50 : -.50,2.03,.25]} r={.052} h={.32} c={P.brass}/>
   <Round p={[isLeft ? .50 : -.50,2.03,.34]} r={.09} c={P.brass}/>
   {[-.39,.39].map(x=><MeshBox key={x} p={[x,2.0,.216]} s={[.04,3.7,.04]} c="#9e7752"/>)}
   <MeshBox p={[0,3.90,.18]} s={[1.02,.05,.05]} c={P.brass} metalness={.4}/>
  </group>
 </group>};
 return <group>
  {/* Free space between the jambs is a real opening. */}
  <MeshBox p={[-1.42,2.12,11.70]} s={[.19,4.25,.34]} c={P.stone2}/><MeshBox p={[1.42,2.12,11.70]} s={[.19,4.25,.34]} c={P.stone2}/>
  <MeshBox p={[0,4.16,11.7]} s={[3.12,.22,.39]} c={P.stone2}/><Arch x={0} y={4.32} z={11.9} r={1.52} thick={.11}/>
  {leaf('left')}{leaf('right')}
  <Text position={[0,4.82,11.9]} color="#5a4638" fontSize={.22} maxWidth={3} anchorX="center">THE LIBRARY</Text>
  {open&&<Text position={[0,4.56,11.94]} color="#62442e" fontSize={.18} anchorX="center">WELCOME IN</Text>}
 </group>}
function CatFlap(){
 const door=useRef()
 useFrame(({clock})=>{if(door.current){const t=clock.elapsedTime%13;const active=t>7.0&&t<9.2;door.current.rotation.x=THREE.MathUtils.lerp(door.current.rotation.x,active?-.42:0,.045)}})
 return <group position={[3.44,0,11.78]}>
  {/* Actual 0.78m wide wall opening is left by the split facade masonry. */}
  <MeshBox p={[-.41,.45,.02]} s={[.11,.9,.30]} c={P.stone2}/><MeshBox p={[.41,.45,.02]} s={[.11,.9,.30]} c={P.stone2}/>
  <MeshBox p={[0,.92,.02]} s={[.91,.12,.30]} c={P.stone2}/>
  <group ref={door} position={[0,.85,.17]}><MeshBox p={[0,-.36,0]} s={[.67,.71,.065]} c={P.woodTrim}/><Round p={[0,-.41,.055]} r={.045} c={P.brass}/></group>
  <Text position={[0,1.15,.25]} fontSize={.14} color="#6d4b30" anchorX="center">CAT</Text>
 </group>
}
function Ivy({x,z}){return <group>{Array.from({length:15},(_,i)=>{const a=i*.67;return <group key={i}><Round p={[x+Math.sin(a)*.33,1.1+i*.36,z+.19]} r={.15+(i%3)*.03} c={i%4===0?'#829951':'#587a49'}/></group>})}</group>}
function Vestibule({evening}){return <group>
  {/* A compact entrance hall, connecting the door at z=11.66 with the library at z=7.8 */}
  <MeshBox p={[0,-.045,9.65]} s={[5.6,.09,4.25]} c="#918273"/>
  {Array.from({length:6},(_,i)=><MeshBox key={i} p={[-2.5+i, .002,9.65]} s={[.018,.015,4.0]} c="#c1a99a"/>)}
  {[-2.8,2.8].map(x=><group key={x}><MeshBox p={[x,1.1,9.60]} s={[.17,2.2,4]} c="#795743"/><MeshBox p={[x,3.15,9.60]} s={[.15,1.9,4]} c="#e9decd"/></group>)}
  <MeshBox p={[0,4.17,9.65]} s={[5.9,.19,4.35]} c="#d2bda4"/>
  <mesh position={[0,4.05,9.65]}><sphereGeometry args={[.36,16,12]}/><meshStandardMaterial color="#ffe6ae" emissive="#ffc477" emissiveIntensity={1.1}/></mesh><pointLight position={[0,3.8,9.65]} intensity={evening?3:1.1} distance={6} color="#ffe1b4"/>
  <MeshBox p={[-2.33,.85,9.55]} s={[.60,1.65,1.65]} c="#755440"/><MeshBox p={[-2.29,1.7,9.55]} s={[.64,.12,1.7]} c="#a8825e"/>
  <MeshBox p={[-2.23,2.53,9.55]} s={[.08,1.25,.98]} c={P.brass}/><MeshBox p={[-2.16,2.53,9.55]} s={[.045,1.05,.83]} c="#b3c0b6" metalness={.3}/>
  <mesh position={[-1.55,.003,9.3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.1,1.4]}/><meshStandardMaterial color="#7f6958"/></mesh>
  <Column p={[2.2,1.0,10]} h={2} r={.07} c="#5f4938"/>{[-.32,.32].map(x=><MeshBox key={x} p={[2.2+x,1.8,10]} s={[.64,.06,.10]} c="#6c503b"/>)}
  <MeshBox p={[2.29,.36,9.2]} s={[.32,.65,.32]} c="#89725b"/>
  {/* Flush threshold with the vestibule paving, no raised sill. */}<MeshBox p={[0,-.025,11.16]} s={[2.75,.05,.85]} c="#aa8360"/>
 </group>}
export default function ManorEntrance({open=false,onToggle=()=>{},season='spring',time='afternoon'}){
 const evening=time==='evening';
 const snow=season==='winter'||season==='christmas', autumn=season==='autumn'||season==='halloween';
 return <group><FrontDoor open={open} onToggle={onToggle}/><StaticBatch revision={season+evening}>
  {/* A level garden ground and a continuous stone footpath. The starting position is z=23. */}
  <MeshBox p={[-3.35,-.26,21.5]} s={[20.3,.32,25]} c="#788c65"/>
  <MeshBox p={[10.15,-.26,25.55]} s={[6.7,.32,16.9]} c="#788c65"/>
  {/* The eastern sunken garden opens daylight to the basement glazing. */}
  <MeshBox p={[6.8,-2.85,13]} s={[.32,5.4,8.2]} c="#858573"/>
  <MeshBox p={[10.15,-2.85,17.1]} s={[6.7,5.4,.32]} c="#858573"/>
  <MeshBox p={[6.8,1,13]} s={[.08,.08,8.2]} c="#65533b"/>
  <MeshBox p={[10.15,1,17.1]} s={[6.7,.08,.08]} c="#65533b"/>
  {[9,11,13,15,17].map(z=><MeshBox key={'well'+z} p={[6.8,.5,z]} s={[.08,1,.08]} c="#65533b"/>)}
  {[8,10,12,13.5].map(x=><MeshBox key={'edge'+x} p={[x,.5,17.1]} s={[.08,1,.08]} c="#65533b"/>)}
  <MeshBox p={[0,-.025,20.5]} s={[3.8,.1,17]} c="#c7b7a1"/>
  <MeshBox p={[0,-.025,11.75]} s={[3.8,.1,.5]} c="#aa8360"/>
  {[-1,1].map(side=><group key={side}>
    {Array.from({length:7},(_,i)=><group key={i}><Round p={[side*(3.4+(i%3)*.55),.24,17.7+i*1.55]} r={.29} c={i%3===0?'#a48862':i%3===1?'#809469':'#9da873'}/></group>)}
  </group>)}
  {/* The Blender estate supplies the masonry and roofs; keep the live door and lamps. */}
  {[-1.9,1.9].map(x=><WallLamp key={x} x={x} y={3.0} z={12.15} evening={evening}/>)}
  {/* Ivy, porch, garden details */}
  <Ivy x={-9.1} z={12.15}/><Ivy x={9.1} z={12.15}/>
  {[-1,1].map(i=><group key={i}><Planter x={i*2.9} z={13.55}/><MeshBox p={[i*2.6,.23,14.75]} s={[.60,.42,2.4]} c="#c9baaa"/></group>)}
  {/* A single continuous footpath, with grout lines raised above the paving to prevent z-fighting. */}{Array.from({length:24},(_,i)=><MeshBox key={i} p={[0,.036,11.45+i*.72]} s={[3.66,.012,.025]} c="#d8c5aa"/>)}
  <MeshBox p={[-5.45,1.12,13.4]} s={[.20,1.65,.22]} c={P.woodTrim}/><MeshBox p={[-5.45,1.88,13.56]} s={[.94,.58,.32]} c="#7b624c"/>
  <MeshBox p={[-5.45,1.87,13.77]} s={[.78,.30,.04]} c={P.brass} metalness={.4}/>
  <Vestibule evening={evening}/><GardenDetails season={season} evening={evening}/>
  {snow&&[-6.2,6.2].map(x=><MeshBox key={x} p={[x,.011,19.5]} s={[4,.025,9]} c="#eff0e8"/>)}
  {autumn&&[-7,7].map(x=><Round key={x} p={[x,.2,14.2]} r={.22} c="#ba7744"/>)}
 </StaticBatch></group>
}
