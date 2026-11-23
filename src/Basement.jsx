import ForestSpring from './ForestSpring'
import React from 'react'
import * as THREE from 'three'
import StaticBatch from './StaticBatch'
import {Box as B} from './GroundFloor'
import {CarvedBox as Soft,WovenRug,Folios} from './StorybookDecor'
import {BASEMENT_HEIGHT as H,BASEMENT_STAIR as STAIR,BASEMENT_BOUNDS,BASEMENT_CEILING,BASEMENT_PORTAL,cutFloor} from './basementLayout'
function Beam({a,b,r=.045,c='#816143'}){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return <mesh position={new THREE.Vector3(...a).addScaledVector(d,.5)} quaternion={q}><cylinderGeometry args={[r,r,d.length(),8]}/><meshStandardMaterial color={c} roughness={.65}/></mesh>}
function Candle({p}){return <group position={p}><mesh><cylinderGeometry args={[.07,.075,.2,10]}/><meshStandardMaterial color="#f0dcb5"/></mesh><mesh position={[0,.14,0]}><sphereGeometry args={[.035,8,6]}/><meshBasicMaterial color="#ffce77"/></mesh></group>}
export default function Basement({time,visible=true}){return <group>
 <StaticBatch>
 {Array.from({length:STAIR.steps},(_,i)=>{const t=(i+.5)/STAIR.steps;return <B key={i} p={[3.5+9.2*t,H*t-.09,-4.8]} s={[9.2/STAIR.steps+.015,.18,1.6]} c="#8c6b4a"/>})}
 {[-1,1].map(a=><group key={a}>
  {/* Stairwell lining closes the void beyond the cut slabs. */}
  <B p={[8.125,(H+BASEMENT_CEILING)/2,-4.8+a*.94]} s={[9.25,BASEMENT_CEILING-H,.18]} c="#6b6050"/>
  {[.18,.42,.66,.88].map(t=><group key={'step-light'+t} position={[3.5+9.2*t,H*t+.24,-4.8+a*.835]}>
   <B p={[0,0,0]} s={[.22,.10,.018]} c="#b39b70"/>
   <mesh position={[0,0,-a*.014]}><boxGeometry args={[.15,.032,.008]}/><meshStandardMaterial color="#ffe6b2" emissive="#ffd28d" emissiveIntensity={time==='evening'?1.2:.55}/></mesh>
  </group>)}
  <Beam a={[3.5,.88,-4.8+a*.82]} b={[12.7,H+.88,-4.8+a*.82]}/>
  {Array.from({length:9},(_,i)=>{const t=i/8;return <Beam key={i} a={[3.5+9.2*t,H*t,-4.8+a*.82]} b={[3.5+9.2*t,H*t+.88,-4.8+a*.82]} r={.025}/>})}
  {Array.from({length:24},(_,i)=><B key={'guard'+i} p={[3.55+i*(9.15/23),.52,-4.8+a*.85]} s={[.035,1.04,.035]} c="#95754d"/>)}
  <B p={[8.12,1.04,-4.8+a*.85]} s={[9.25,.07,.07]} c="#95754d"/>
 </group>)}
 </StaticBatch>
 <group visible={visible}><StaticBatch revision={time}>
 <B p={[16.7,H-.13,-.075]} s={[18.6,.26,13.15]} c="#78604a"/>
 {Array.from({length:24},(_,i)=><B key={i} p={[16.7,H+.008,-6.4+i*.54]} s={[18.5,.012,.018]} c="#4a392e"/>)}
 {cutFloor(BASEMENT_BOUNDS).map(([l,r,b,f],i)=><B key={i} p={[(l+r)/2,BASEMENT_CEILING,(b+f)/2]} s={[r-l,.16,f-b]} c="#6b5946"/>)}
 <B p={[16.7,H+2.45,-6.72]} s={[18.8,4.9,.18]} c="#75624c"/>
 <B p={[7.3,H+2.45,1.375]} s={[.18,4.9,10.65]} c="#86765e"/><B p={[7.3,H+2.45,-6.2]} s={[.18,4.9,1.05]} c="#86765e"/>
 <B p={[26.1,H+2.45,0]} s={[.18,4.9,13.4]} c="#6e6a5c"/>
 {/* Open doorway between the lounge and the private bath. */}
 <B p={[17.92,H+2.45,-3.87]} s={[.24,4.9,5.55]} c="#8d7e68"/><B p={[17.92,H+2.45,3.75]} s={[.24,4.9,5.5]} c="#8d7e68"/><B p={[BASEMENT_PORTAL.x,H+(4.9+BASEMENT_PORTAL.clearHeight)/2,BASEMENT_PORTAL.z]} s={[.24,4.9-BASEMENT_PORTAL.clearHeight,BASEMENT_PORTAL.width]} c="#8d7e68"/>
 {[-1.1,1].map(z=><B key={'jamb'+z} p={[17.78,H+BASEMENT_PORTAL.clearHeight/2,z]} s={[.08,BASEMENT_PORTAL.clearHeight,.06]} c="#b0a080"/>)}
 <B p={[17.92,H+.012,-.05]} s={[.32,.024,2.1]} c="#9b9a85"/>
 {/* Flush drainage strip separates dry timber and wet stone without a step. */}
 <B p={[18.2,H+.018,-.05]} s={[.18,.026,1.95]} c="#323e37"/>
 {Array.from({length:16},(_,i)=><B key={'drain'+i} p={[18.2,H+.034,-.94+i*.12]} s={[.17,.01,.022]} c="#858f80"/>)}
 {[8,11,14,17].map(x=><B key={x} p={[x,H+2.45,6.54]} s={[.12,4.9,.18]} c="#3b493c"/>)}
 {[H+.08,-.42].map(y=><B key={y} p={[12.7,y,6.54]} s={[10.6,.14,.18]} c="#3b493c"/>)}
 <mesh position={[12.7,H+2.45,6.56]}><planeGeometry args={[10.6,4.7]}/><meshPhysicalMaterial color="#bcd3c4" transparent opacity={.12} metalness={.15} roughness={.12} side={2} depthWrite={false}/></mesh>
 <WovenRug p={[12,H+.035,2.3]} size={[7.4,5.5]} color="#c3b397"/>
 <group position={[12,H,4.4]}><Soft p={[0,.34,0]} s={[5.9,.5,1.5]} c="#cfccb9" r={.22}/><Soft p={[0,.88,.62]} s={[5.9,1.05,.30]} c="#ddd6c1" r={.14}/>{[-2,-1,0,1,2].map(a=><group key={a}><Soft p={[a,.64,-.06]} s={[1.03,.23,1.3]} c="#e4dfcb" r={.11}/><Soft p={[a,1.02,.39]} s={[.73,.55,.22]} c="#e2dcc7" r={.12} rot={[.12,.08*a,.09*a]}/></group>)}{[-2.85,2.85].map(a=><Soft key={a} p={[a,.7,0]} s={[.32,.66,1.5]} c="#d5cfbb" r={.15}/>)}</group>
 <group position={[12,H+.47,2.5]}><mesh scale={[1.65,1,.65]}><cylinderGeometry args={[1,1,.13,40]}/><meshStandardMaterial color="#695534" roughness={.7}/></mesh><B p={[0,-.25,0]} s={[1.5,.4,.55]} c="#453a28"/><Folios p={[-.4,.09,0]}/><Candle p={[.45,.2,.1]}/></group>
 <B p={[7.75,H+1.25,2.1]} s={[.8,2.5,4.1]} c="#393d32"/><B p={[8.18,H+.95,2.1]} s={[.05,1.3,2.8]} c="#171e19"/>
 {[1.3,1.9,2.5,2.9].map(z=><mesh key={z} position={[8.24,H+.70,z]}><coneGeometry args={[.13,.7,9]}/><meshBasicMaterial color="#e7a34e"/></mesh>)}
 <pointLight position={[8.7,H+1.1,2]} color="#ffbf74" intensity={time==='evening'?5:2} distance={7}/>

 <B p={[25.38,H+.85,-2.7]} s={[1.12,.18,3.4]} c="#b2a68c"/><B p={[25.38,H+.24,-2.7]} s={[1.08,.12,3.4]} c="#5a4935"/>
 <mesh position={[25.35,H+.94,-2.7]}><latheGeometry args={[[[.06,0],[.29,.03],[.43,.19],[.44,.27],[.40,.29],[.36,.19],[.23,.09],[.06,.07]].map(([x,y])=>new THREE.Vector2(x,y)),32]}/><meshStandardMaterial color="#5e584a" side={THREE.DoubleSide} roughness={.36}/></mesh>
 <mesh position={[25.35,H+1.015,-2.7]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.055,16]}/><meshStandardMaterial color="#323735" metalness={.7}/></mesh>
 <Beam a={[25.75,H+.94,-2.7]} b={[25.75,H+1.46,-2.7]} r={.035} c="#444b40"/>
 <Beam a={[25.75,H+1.46,-2.7]} b={[25.35,H+1.46,-2.7]} r={.035} c="#444b40"/>
 <Beam a={[25.35,H+1.46,-2.7]} b={[25.35,H+1.38,-2.7]} r={.035} c="#444b40"/>
 <mesh position={[25.97,H+2.4,-2.7]} rotation={[0,-Math.PI/2,0]}><circleGeometry args={[.9,40]}/><meshStandardMaterial color="#a6b3a3" metalness={.85} roughness={.25}/></mesh>
 <B p={[23,H+.45,-.7]} s={[2.5,.12,.75]} c="#806b50"/>{[22,24].map(x=><B key={x} p={[x,H+.23,-.7]} s={[.12,.46,.65]} c="#5c4937"/>)}
 {[22.5,23].map(x=><Soft key={x} p={[x,H+.56,-.7]} s={[.42,.12,.54]} c="#aba994" r={.04}/>)}

 </StaticBatch><ForestSpring time={time} active={visible}/></group>
 </group>}
