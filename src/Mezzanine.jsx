import React from 'react'
import {UpperDetails} from './RoomDetails'
import {Text} from '@react-three/drei'

import {GALLERY_HEIGHT,STAIRS,stairPoint} from './navigation'
export {GALLERY_HEIGHT,ATTIC_HEIGHT} from './navigation'
import * as THREE from 'three'

const oak='#815539', trim='#c59b66', rail='#9b6746'
function B({p,s,c=oak,rot=[0,0,0],onClick}){return <mesh position={p} rotation={rot} castShadow receiveShadow onClick={onClick}><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.78}/></mesh>}
function Plate({title,p,rotation=[0,0,0]}){return <Text position={p} rotation={rotation} color="#f6dfad" fontSize={.21} anchorX="center" maxWidth={3.3}>{title}</Text>}
function HandRail({axis='z',constant=0,start=-6.5,end=6.5,level=GALLERY_HEIGHT,omit=[]}){const alongZ=axis==='z',length=end-start,amount=Math.max(2,Math.ceil(length/1.05));return <group>
  <B p={alongZ?[constant,level+1.12,(start+end)/2]:[(start+end)/2,level+1.12,constant]} s={alongZ?[.12,.12,length]:[length,.12,.12]} c={trim}/>
  {Array.from({length:amount+1},(_,i)=>{const t=i/amount,a=start+t*length;if(omit.some(([lo,hi])=>a>lo&&a<hi))return null;return <group key={i}><B p={alongZ?[constant,level+.55,a]:[a,level+.55,constant]} s={[.105,1.13,.105]} c={rail}/><B p={alongZ?[constant,level+.62,a]:[a,level+.62,constant]} s={[.20,.10,.20]} c={trim}/></group>})}
 </group>}
function Rail({a,b,r=.045,color=trim}){
 const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a))
 const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize())
 return <mesh position={a.map((n,i)=>(n+b[i])/2)} quaternion={q} castShadow><cylinderGeometry args={[r,r,v.length(),10]}/><meshStandardMaterial color={color} roughness={.4}/></mesh>
}
function Staircase({stair}){
 const length=Math.hypot(stair.to[0]-stair.from[0],stair.to[2]-stair.from[2])
 const alongX=stair.from[0]!==stair.to[0]
 return <group>
  {Array.from({length:stair.steps},(_,i)=>{
   const t=(i+.5)/stair.steps,p=stairPoint(stair,t),rise=(stair.to[1]-stair.from[1])/stair.steps
   return <group key={i}><B p={[p[0],p[1]-rise/2-.05,p[2]]} s={alongX?[length/stair.steps+.012,rise+.1,stair.width]:[stair.width,rise+.1,length/stair.steps+.012]} c={oak}/>
    <B p={[p[0],p[1]-.008,p[2]]} s={alongX?[length/stair.steps,.025,stair.width*.63]:[stair.width*.63,.025,length/stair.steps]} c="#6e4545"/>
   </group>
  })}
  {[-1,1].map(side=><group key={side}>
   <Rail r={.11} color={oak} a={stairPoint(stair,0,side*(stair.width/2-.06)).map((v,i)=>i===1?v-.12:v)} b={stairPoint(stair,1,side*(stair.width/2-.06)).map((v,i)=>i===1?v-.12:v)}/>
   <Rail a={stairPoint(stair,0,side*(stair.width/2-.03)).map((v,i)=>i===1?v+1:v)} b={stairPoint(stair,1,side*(stair.width/2-.03)).map((v,i)=>i===1?v+1:v)}/>
   {Array.from({length:stair.steps/2+1},(_,i)=>{const p=stairPoint(stair,Math.min(1,i*2/stair.steps),side*(stair.width/2-.03));return <group key={i}><B p={[p[0],p[1]+.48,p[2]]} s={[.07,.96,.07]} c={rail}/><mesh position={[p[0],p[1]+1.02,p[2]]}><sphereGeometry args={[.065,10,8]}/><meshStandardMaterial color="#b99458" metalness={.5} roughness={.4}/></mesh></group>})}
  </group>)}
 </group>
}
function UpperReadingRoom({time}){const y=GALLERY_HEIGHT;return <group>
  {/* Genuine additional second-floor room beyond the east gallery, with a continuous floor. */}
  <B p={[11.25,y-.13,0]} s={[7.5,.26,10.2]} c="#765038"/>
  <B p={[11.25,y+.014,0]} s={[7.42,.035,10.1]} c="#a4774f"/>
  {/* Plastered walls and decorative walnut wainscoting. West side stays open into the balcony. */}
  <B p={[15.18,y+1.9,0]} s={[.24,3.8,10.2]} c="#e2d1bc"/>
  {[-5.02,5.02].map(z=><group key={z}><B p={[11.25,y+1.9,z]} s={[7.65,3.8,.22]} c="#e3d5c3"/>
    <B p={[11.25,y+.61,z+(z<0?.14:-.14)]} s={[7.45,1.2,.10]} c="#654735"/></group>)}
  <B p={[11.25,y+3.9,0]} s={[7.7,.16,10.2]} c="#d2b794"/>
  {/* Three collections with carved cap mouldings and grouped non-interactive books. */}
  {[-3.05,0,3.05].map((z,j)=><group key={z} position={[14.25,y,z]}>
    <B p={[0,1.2,0]} s={[.65,2.4,2.3]} c="#513528"/>
    {[.42,1.03,1.66,2.26].map((h,k)=><group key={h}>
      <B p={[-.39,h,0]} s={[.17,.11,2.38]} c="#ab7b50"/>
      {Array.from({length:9},(_,i)=><B key={i} p={[-.49,h+.24,-.94+i*.23]} s={[.18,.42+((i+j+k)%3)*.07,.16]} c={['#8f6147','#596c5e','#9c7a62','#626c88'][i%4]}/>) }
    </group>)}
    <B p={[-.05,2.46,0]} s={[.82,.18,2.58]} c={trim}/>
  </group>)}
  {/* Comfortable seats, writing table, old prints and warm brass lamps. */}
  <B p={[10.25,y+.75,0]} s={[2.7,.16,1.28]} c="#633f2f"/>
  {[-1.06,1.06].flatMap(x=>[-.45,.45].map(z=><B key={`${x}/${z}`} p={[10.25+x,y+.36,z]} s={[.12,.7,.12]} c={oak}/>))}
  <UpperDetails time={time}/>
 </group>}
export default function Mezzanine({time}){const y=GALLERY_HEIGHT;return <group>
  <UpperReadingRoom time={time}/>
  {/* Leave a real stairwell in the west balcony; the east balcony remains continuous. */}
  <B p={[6.5,y-.13,0]} s={[2.25,.26,13.4]}/>
  {[[-5.775,1.85],[5.975,1.45]].map(([z,d])=><B key={z} p={[-6.45,y-.13,z]} s={[2.3,.26,d]}/>)}
  {[-5.58,5.72].map(z=><B key={z} p={[.6,y-.13,z]} s={[11.8,.26,2.25]}/>)}
  <HandRail axis="z" constant={5.28} start={-4.42} end={4.6}/>
  <HandRail axis="x" constant={-4.4} start={-5.2} end={5.2}/>
  <HandRail axis="x" constant={4.58} start={-5.2} end={5.2}/>
  <HandRail axis="x" constant={-6.65} start={-7.5} end={-1.5}/><HandRail axis="x" constant={-6.65} start={1.5} end={7.5}/>
  <HandRail axis="x" constant={6.65} start={-7.5} end={7.5}/>
  {/* Guard the upper balcony's dead-end above the foot of the stair. */}
  <HandRail axis="x" constant={5.28} start={-7.45} end={-5.35}/>
  {STAIRS.filter(stair=>stair.id!=='basement').map(stair=><Staircase key={stair.id} stair={stair}/>)}
  <Plate title="2층 · 걸어서 올라가기" p={[-5.15,1.3,5.4]}/>
  <Plate title="다락 · 연결 계단" p={[-7.25,y+1.5,6.5]}/>
 </group>}
