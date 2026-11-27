import React from 'react'
import {Box as B} from './GroundFloor'
import {SoftPad} from './CafeSoftSeat'
import {PRIVATE_ROOMS,CAFE_SCALE} from './cafeExpansion'
import CafeThrow from './CafeThrow'
export default function CafePrivateFloor({Sign}){return <group position={[0,7.2,0]}>
 <B p={[-23.75,-.1,23]} s={[15.5,.2,16]} c="#78614c"/><B p={[-32.75,-.1,16.45]} s={[2.5,.2,2.7]} c="#78614c"/>
 <B p={[-25,6.5,23]} s={[18,.25,16]} c="#ece4d6"/>
 {[-34,-16].map(x=><B key={x} p={[x,3.2,23]} s={[.16,6.4,16]} c="#233e34"/>)}
 <B p={[-25,3.2,31]} s={[18,6.4,.16]} c="#233e34"/>
 <B p={[-25,.45,15]} s={[18,.9,.16]} c="#233e34"/><B p={[-25,5.65,15]} s={[18,1.5,.16]} c="#233e34"/>
 <mesh position={[-25,2.9,15]}><planeGeometry args={[18,4]}/><meshStandardMaterial color="#dbe8e4" transparent opacity={.08} depthWrite={false} side={2}/></mesh>
 {[-34,-30.5,-26.5,-22.5,-18.5,-16].map(x=><B key={x} p={[x,2.9,15]} s={[.10,4,.15]} c="#403c34"/>)}
 <B p={[-31.62,.55,24.2]} s={[.1,1.1,12.8]} c="#463d31"/>
 {[-30.5,-26.5,-22.5,-18.5].map(x=><B key={x} p={[x,3.2,18.5]} s={[.14,6.4,7]} c="#2d483b"/>)}
 {PRIVATE_ROOMS.map(r=><group key={r.id}>
  <B p={[r.x,.14,15.15]} s={[3.8,.28,.12]} c="#453e30"/>
  <B p={[r.x,1.12,15.16]} s={[3.8,.07,.14]} c="#9e8b65"/>
  {[-1.85,1.85].map(dx=><group key={dx}><B p={[r.x+dx,2.95,15.25]} s={[.18,3.8,.10]} c="#8e9281"/><B p={[r.x+dx,4.88,15.25]} s={[.21,.05,.14]} c="#a38c65"/></group>)}
  {[-1.35,1.35].map(dx=><B key={dx} p={[r.x+dx,3.2,22]} s={[1.3,6.4,.16]} c="#2d483b"/>)}<B p={[r.x,5.4,22]} s={[1.4,2,.16]} c="#2d483b"/>
  <Sign text={r.name+'\n1인 사색실 · 예약 수첩'} position={[r.x+1.2,2,22.1]} size={[.9,.55]} compact dark action={{type:'cafe-sign',privateBooking:true,roomId:r.id}}/>
  <group position={[r.x,0,r.z]} rotation={[0,Math.PI,0]} scale={[1/CAFE_SCALE,1,1/CAFE_SCALE]}>
   <mesh position={[-.25,.012,.25]} rotation={[-Math.PI/2,0,0]} userData={{noCameraCollision:true}}><planeGeometry args={[3.6,4.4]}/><meshStandardMaterial color="#a5a18b" roughness={1}/></mesh>
   <B p={[0,.135,0]} s={[1.16,.27,1.18]} c="#292d27"/>
   <SoftPad p={[0,.45,0]} s={[1.3,.36,1.3]} c="#344f3f" fabric="velvet" seam/><SoftPad p={[0,1.02,-.5]} s={[1.3,1,.3]} c="#3d5947" fabric="velvet"/>
   {[-.58,.58].map(x=><SoftPad key={x} p={[x,.7,0]} s={[.2,.45,1.3]} c="#344f3f" fabric="velvet" seam/>)}
   <SoftPad p={[0,.28,1.35]} s={[1,.56,.6]} c="#405b46" fabric="velvet" seam/><CafeThrow/>
   <B p={[-1.5,.58,0]} s={[.8,.10,.8]} c="#73583e"/><B p={[-1.5,.28,0]} s={[.12,.56,.12]} c="#38352f"/>
   <B p={[-1.5,.67,0]} s={[.25,.06,.34]} c="#e8dfce"/>
   <group position={[-1.5,.65,-.24]}><B p={[0,.015,0]} s={[.22,.03,.22]} c="#282b27"/><B p={[0,.22,0]} s={[.025,.4,.025]} c="#a38c65"/><mesh position={[0,.42,0]}><coneGeometry args={[.18,.22,16,1,true]}/><meshStandardMaterial color="#d7c8a7" emissive="#ad8952" emissiveIntensity={.3} roughness={1} side={2}/></mesh></group>
  </group>
 </group>)}
 <Sign text={'PRIVATE LOUNGE\n창가에서 혼자 머무는 시간\n예약 수첩 열기'} position={[-17,2.4,30.85]} rotation={[0,Math.PI,0]} size={[1.2,.9]} dark compact action={{type:'cafe-sign',privateBooking:true}}/>
 </group>}
