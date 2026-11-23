import React from 'react'
import {CarvedBox as B} from './StorybookDecor'
import StaticBatch from './StaticBatch'
import {EAST_MEADOW,STACKS_EXIT,STUDY_EXIT} from './eastMeadowLayout'

export function EastMeadow({studyOpen}){
 const [left,right,north,south]=EAST_MEADOW
 const halfDoor=STUDY_EXIT.width/2
 return <StaticBatch revision={studyOpen}>
  <B p={[(left+right)/2,-.18,(north+south)/2]} s={[right-left,.34,south-north]} c="#74a348"/>
  <B p={[25,-.3,-34]} s={[49,.5,9]} c="#618f40"/>
  <B p={[44,-.3,-21]} s={[9,.5,31]} c="#618f40"/>
  <B p={[STACKS_EXIT.x,-.075,-6.8]} s={[1.55,.15,2]} c="#c2b99b"/>
  <B p={[7.32,-.075,STUDY_EXIT.z]} s={[1.28,.15,STUDY_EXIT.width]} c="#c2b99b"/>
  <B p={[7.23,5.3,STUDY_EXIT.z]} s={[.23,4.6,STUDY_EXIT.width]} c="#ccc2a9"/>
  {[[ -29.61,STUDY_EXIT.z-halfDoor],[STUDY_EXIT.z+halfDoor,-18.99]].map(([a,b])=><B key={a} p={[7.23,3.8,(a+b)/2]} s={[.23,7.6,b-a]} c="#ccc2a9"/>)}
  {!studyOpen&&<B p={[7.23,1.5,STUDY_EXIT.z]} s={[.19,3,STUDY_EXIT.width]} c="#5e4131"/>}
  {Array.from({length:20},(_,i)=>{
   const x=10+i*1.58,z=-34.6+Math.sin(i*1.7)*1.4
   return <group key={i} position={[x,0,z]}>
    <B p={[0,1,0]} s={[.18,2,.18]} c="#665342"/>
    <mesh position={[0,2.2,0]} scale={[1.1,1.38,1.04]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={['#477b3e','#628c43','#537d38'][i%3]} roughness={.94}/></mesh>
   </group>
  })}
  {Array.from({length:130},(_,i)=>{
   const x=9+(i*.6180339%1)*30,z=-8-(i*.41421356%1)*24
   return <mesh key={i} position={[x,.002,z]} rotation={[-Math.PI/2,0,i]} scale={[.32+(i%7)*.17,.17+(i%3)*.1,1]}>
    <circleGeometry args={[1,7]}/><meshStandardMaterial color={['#79a84c','#709f45','#759f44'][i%3]}/>
   </mesh>
  })}
 </StaticBatch>
}
