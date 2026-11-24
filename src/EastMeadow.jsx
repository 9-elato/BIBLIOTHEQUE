import React,{useMemo} from 'react'
import ForestTrees from './ForestTrees'
import GrassField from './GrassField'
import {CarvedBox as B} from './StorybookDecor'
import StaticBatch from './StaticBatch'
import {EAST_MEADOW,STUDY_EXIT} from './eastMeadowLayout'

export function EastMeadow({studyOpen,end=43.1,weather}){
 const [left,baseRight,north,south]=EAST_MEADOW,right=Math.max(120,end+45)
 const trees=useMemo(()=>Array.from({length:20},(_,i)=>[10+i*1.58,0,-34.6+Math.sin(i*1.7)*1.4]),[])
 const exclude=useMemo(()=>((x,z)=>x>end-1&&x<end+12&&z>-16),[end])
 const halfDoor=STUDY_EXIT.width/2
 return <group><ForestTrees positions={trees} weather={weather}/><GrassField bounds={[8,right,-34,-6.1]} exclude={exclude} weather={weather}/><GrassField bounds={[end+12.4,right,-6.1,24]} weather={weather}/><StaticBatch revision={studyOpen}>
  <B p={[(left+right)/2,-.18,(north+south)/2]} s={[right-left,.34,south-north]} c="#74a348"/>
  <B p={[25,-.3,-34]} s={[49,.5,9]} c="#618f40"/>
  <B p={[44,-.3,-21]} s={[9,.5,31]} c="#618f40"/>
  <B p={[(end+12+right)/2,-.18,-5]} s={[right-end-12,.34,58]} c="#74a348"/><B p={[end+13,-.075,0]} s={[2,.15,5]} c="#c2b99b"/>
  <B p={[7.32,-.075,STUDY_EXIT.z]} s={[1.28,.15,STUDY_EXIT.width]} c="#c2b99b"/>
  <B p={[7.23,5.3,STUDY_EXIT.z]} s={[.23,4.6,STUDY_EXIT.width]} c="#ccc2a9"/>
  {[[ -29.61,STUDY_EXIT.z-halfDoor],[STUDY_EXIT.z+halfDoor,-18.99]].map(([a,b])=><B key={a} p={[7.23,3.8,(a+b)/2]} s={[.23,7.6,b-a]} c="#ccc2a9"/>)}
  {!studyOpen&&<B p={[7.23,1.5,STUDY_EXIT.z]} s={[.19,3,STUDY_EXIT.width]} c="#5e4131"/>}
  {Array.from({length:130},(_,i)=>{
   const x=9+(i*.6180339%1)*30,z=-8-(i*.41421356%1)*24
   return <mesh key={i} position={[x,.002,z]} rotation={[-Math.PI/2,0,i]} scale={[.32+(i%7)*.17,.17+(i%3)*.1,1]}>
    <circleGeometry args={[1,7]}/><meshStandardMaterial color={['#79a84c','#709f45','#759f44'][i%3]}/>
   </mesh>
  })}
 </StaticBatch></group>
}
