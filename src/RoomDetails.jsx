import SolarMobile from './SolarMobile'
import {Beanbag,CreamRugs,SofaBed,DetailedTelescope} from './AtticComfort'
import {originalAtticX} from './atticLayout'
import React from 'react'
import {CarvedBox as B,ReadingChair,AntiqueLamp,WovenRug,Folios,Quill,WallSconce} from './StorybookDecor'
import {READING_CHAIRS} from './roomFurniture'
import {ATTIC_ORIGIN,GALLERY_HEIGHT} from './navigation'

export function UpperDetails({time}){const y=GALLERY_HEIGHT;return <group>
 {READING_CHAIRS.filter(s=>s.level===y).map(s=><ReadingChair key={s.id} item={s}/>)}
 <WovenRug p={[10.4,y+.043,0]} size={[4.8,7.5]} color="#4e6157"/>
 {/* Keep the table's saved book positions clear; accessories occupy its east end. */}
 <B p={[10.25,y+.838,0]} s={[2.45,.012,1.05]} c="#475c4b"/>
 <AntiqueLamp p={[11.26,y+.84,-.39]} banker time={time}/>
 <Quill p={[11.3,y+.85,.39]}/>
 {[-1.06,1.06].flatMap(x=>[-.45,.45].map(z=><group key={`${x}/${z}`}>
  <B p={[10.25+x,y+.17,z]} s={[.23,.11,.23]} c="#b0925f"/>
  <B p={[10.25+x,y+.62,z]} s={[.23,.10,.23]} c="#8c6545"/>
 </group>))}
 <B p={[10.25,y+.23,0]} s={[2.3,.10,.14]} c="#6c4731"/>
 {[-4.86,4.86].map(z=><group key={z} position={[11.2,y,z]} rotation={[0,z>0?Math.PI:0,0]}>
  {[.12,1.24,2.91].map(h=><B key={h} p={[0,h,0]} s={[7.4,.10,.12]} c={h>2?'#bc9e70':'#624332'}/>)}
  {[-3,-2,-1,0,1,2,3].map(x=><B key={x} p={[x,.64,.03]} s={[.045,1.12,.045]} c="#a18157"/>)}
  <B p={[0,2.08,.02]} s={[2.85,1.40,.11]} c="#6a4d39"/>
  <B p={[0,2.08,.09]} s={[2.66,1.22,.04]} c={time==='evening'?'#526475':'#9ea995'}/>
  {[-.86,0,.86].map(x=><B key={x} p={[x,2.08,.15]} s={[.055,1.28,.05]} c="#b99a68"/>)}
  <B p={[0,2.08,.16]} s={[2.7,.05,.05]} c="#b99a68"/>
  {[-1,1].map(a=><group key={a}>
   {Array.from({length:4},(_,i)=><mesh key={i} position={[a*(1.47+i*.065),2.04,.21]}><cylinderGeometry args={[.06,.075,1.56,12]}/><meshStandardMaterial color={i%2?'#536955':'#657b63'} roughness={1}/></mesh>)}
   <B p={[a*1.56,1.66,.25]} s={[.3,.06,.12]} c="#b89c6a"/>
  </group>)}
  <B p={[0,2.86,.20]} s={[3.6,.055,.055]} c="#aa8a54"/>
 </group>)}
 {[-3.05,0,3.05].map(z=><group key={z}>
  <B p={[13.8,y+2.58,z]} s={[.13,.08,2.1]} c="#b79b68"/>
  <Folios p={[14.25,y+2.61,z-.6]}/>
 </group>)}
 <WallSconce p={[15.02,y+2.2,1.5]} turn={-Math.PI/2} time={time}/>
 <WallSconce p={[15.02,y+2.2,-1.5]} turn={-Math.PI/2} time={time}/>
 <pointLight position={[11.4,y+2.6,0]} color="#ffe4b6" intensity={time==='evening'?7:5} distance={8}/>
 </group>}

export function AtticDetails({time}){return <group>
 {READING_CHAIRS.filter(s=>s.level===10.6).map(s=><Beanbag key={s.id} item={{...s,x:originalAtticX(s.x)}}/>)}
 <group position={ATTIC_ORIGIN}>
  <CreamRugs/><SofaBed/><DetailedTelescope/>
  {/* The daybed remains accessible from the east. Decorative cushions stay at its back. */}
  {[-.65,.35].map(z=><B key={z} p={[-2.95,1.02,z]} s={[.24,.4,.49]} c={z<0?'#7c616d':'#7b8b89'} r={.09} rot={[0,0,-.13]}/>)}
  <B p={[-2.7,.88,-.92]} s={[.9,.055,.44]} c="#ad997b"/>
  {Array.from({length:9},(_,i)=><B key={i} p={[-3.12+i*.1,.915,-.92]} s={[.025,.012,.42]} c="#d4c3a1"/>)}
  <pointLight position={[-2,1.55,-4.1]} color="#ffd29b" intensity={time==='evening'?9:6} distance={7}/>
  <AntiqueLamp p={[2.3,1.25,-5.4]} time={time}/>
  <Folios p={[3.1,1.28,-5.4]}/>
  <B p={[0,2.13,-6.38]} s={[8.72,4.26,.13]} c="#c5b697"/>
  <mesh position={[0,4.26,-6.38]}>
   <bufferGeometry>
    <bufferAttribute attach="attributes-position" args={[new Float32Array([-4.36,0,0,4.36,0,0,0,3.36,0]),3]}/>
   </bufferGeometry>
   <meshBasicMaterial color="#bcad91" side={2}/>
  </mesh>
  {[.17,1.16,3.35].map(h=><B key={h} p={[0,h,-6.28]} s={[8.25,.10,.11]} c="#896846"/>)}
  <B p={[3.99,.6,-.77]} s={[.11,1.2,11.25]} c="#795d46"/>
  {[.16,1.22].map(h=><B key={h} p={[3.9,h,-.77]} s={[.13,.09,11.25]} c="#b3996c"/>)}
  {[-5.8,-4.5,-3.2,-1.9,-.6,.7,2,3.3,4.5].map(z=><B key={z} p={[3.91,.68,z]} s={[.08,.98,.055]} c="#a98a60"/>)}
  <group position={[3.94,2.13,-3.6]} rotation={[0,-Math.PI/2,0]}>
   <B s={[1.5,1.1,.08]} c="#ac8c55"/><B p={[0,0,.05]} s={[1.32,.92,.025]} c="#3d5065"/>
   {[[.4,.21],[-.3,.27],[-.13,-.1],[.38,-.24],[-.5,-.21]].map(([x,y],i)=><mesh key={i} position={[x,y,.08]}><circleGeometry args={[.025,8]}/><meshBasicMaterial color="#dbc28b"/></mesh>)}
   <mesh position={[.05,.15,.08]}><ringGeometry args={[.13,.15,32]}/><meshBasicMaterial color="#c4ac7e"/></mesh>
  </group>
  <WallSconce p={[3.98,2.1,4.3]} turn={-Math.PI/2} time={time}/>
  <WallSconce p={[-3.96,2.1,2.7]} turn={Math.PI/2} time={time}/>
  <SolarMobile/>
  <pointLight position={[-1.4,4.4,3.5]} color={time==='evening'?'#aebfe1':'#dbe2db'} intensity={time==='evening'?7:11} distance={10}/>
 </group>
 </group>}

export function HallDetails({time}){return <group>
 {/* Wall-mounted fittings and thin runners preserve all existing walking routes. */}
 {[-8.8,-11.2].flatMap(z=>[-1,1].map(a=><WallSconce key={`${a}/${z}`} p={[a*2.08,2.4,z]} turn={-a*Math.PI/2} time={time}/>))}
 <WovenRug p={[0,.025,-9.65]} size={[2.5,4.1]} color="#625d60"/>
 <group position={[-2.3,.99,9.4]}><Folios p={[0,0,0]}/><Quill p={[0,0,.46]}/></group>
 {[-5,5].map(x=><group key={x} position={[x,7.9,-6.77]}>
  <B s={[1.16,1.45,.08]} c="#af8c52"/>
  <B p={[0,0,.05]} s={[1.01,1.30,.03]} c="#5d7369"/>
  <mesh position={[.12,.2,.08]}><circleGeometry args={[.24,24]}/><meshStandardMaterial color="#d1b77e"/></mesh>
  <B p={[0,-.28,.08]} s={[.8,.22,.02]} c="#3f544c" rot={[0,0,-.12]}/>
 </group>)}
 </group>}
