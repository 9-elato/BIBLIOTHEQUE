import StaticBatch from './StaticBatch'
import React from 'react'
import {CarvedBox as B,ReadingChair,AntiqueLamp,WovenRug,Folios,Quill,WallSconce} from './StorybookDecor'
import {STUDY_CHAIR} from './roomFurniture'
export default function SecretDetails({open,prepare=false,time}){
 if(!open&&!prepare)return null
 return <group visible={open}><StaticBatch revision={time}>
  <B p={[0,3.46,-17]} s={[3.1,.18,4.1]} c="#baa584"/>
  {[-15.4,-17,-18.7].map(z=><group key={z}>
   <B p={[0,3.26,z]} s={[2.9,.18,.18]} c="#6a4a35"/>
   {[-1,1].map(a=><group key={a}><B p={[a*1.31,1.62,z]} s={[.12,3.25,.14]} c="#77533c"/><WallSconce p={[a*1.29,2.2,z+.35]} turn={-a*Math.PI/2} time={time}/></group>)}
  </group>)}
  <WovenRug p={[0,.035,-17]} size={[1.4,3.7]} color="#6c3545"/>
  <B p={[0,7.68,-24.3]} s={[14.6,.18,10.7]} c="#c4af90"/>
  {[-28.8,-26.6,-23.5,-20].map(z=><B key={z} p={[0,7.45,z]} s={[14.4,.22,.18]} c="#71513a"/>)}
  {[-1,1].map(a=><group key={a}>
   {[.15,1.25,7.35].map(y=><B key={y} p={[a*7.06,y,-24.3]} s={[.12,.12,10.4]} c="#b09262"/>)}
   {[-28.8,-22.8,-24.3,-20.8,-19.8].map(z=><B key={z} p={[a*7.07,.7,z]} s={[.1,1,.045]} c="#98764f"/>)}
   <WallSconce p={[a*7.02,2.8,-21.2]} turn={-a*Math.PI/2} time={time}/>
   <Folios p={[a*5.55,1.22,-28.8]}/><Folios p={[a*5.55,1.91,-28.8]}/>
  </group>)}
  <ReadingChair item={STUDY_CHAIR}/>
  <AntiqueLamp p={[-4.6,0,-24.1]} time={time}/>


 </StaticBatch></group>
}
