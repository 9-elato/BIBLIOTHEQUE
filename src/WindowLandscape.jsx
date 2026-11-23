import {createWindowGeometry} from './windowGeometry'
import React,{useEffect} from 'react'
import ForestVista from './ForestVista'
export function WindowLandscape({time='afternoon',weather='sunny',width=1.5,height=4,rectangular=false}){
 const shape=useMemoShape(width,height,rectangular)
 return <ForestVista geometry={shape} time={time} weather={weather}/>
}
export default function StoryWindow({position,rotation=[0,0,0],width=1.5,height=5,time,weather,event,season,curtain='#294b3d',curtainFinish}){
 const r=width/2,base=height/2-r
 const arch=useMemoShape(width,height)
 return <group position={position} rotation={rotation}>
  <mesh geometry={arch}><meshStandardMaterial color="#e0cba8" side={2}/></mesh>
  <group position={[0,-.08,.025]}><WindowLandscape width={width-.18} height={height-.22} time={time} weather={weather} event={event} season={season}/></group>
  {[-1,1].map(a=><mesh key={a} position={[a*(width/2+.05),-.05,.09]}><boxGeometry args={[.14,height,.17]}/><meshStandardMaterial color="#634531"/></mesh>)}
  <mesh position={[0,base,.12]} rotation={[0,0,0]}><torusGeometry args={[r,.09,8,32,Math.PI]}/><meshStandardMaterial color="#dbc39c"/></mesh>
  {[-.25,0,.25].map(a=><mesh key={a} position={[width*a,-.05,.12]}><boxGeometry args={[.035,height-.25,.04]}/><meshStandardMaterial color="#806144"/></mesh>)}
  {[-.3,0,.3].map(a=><mesh key={a} position={[0,height*a,.13]}><boxGeometry args={[width,.04,.04]}/><meshStandardMaterial color="#806144"/></mesh>)}
  <mesh position={[0,height/2+.18,.24]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.035,.035,width+1,12]}/><meshStandardMaterial color="#b59656" metalness={.7}/></mesh>
  {[-1,1].map(a=><group key={a}>
   {[0,1,2,3].map(i=><mesh key={i} position={[a*(width/2+.12+i*.09),0,.22]}><cylinderGeometry args={[.07,.095,height,10]}/>{curtainFinish?<meshPhysicalMaterial color={curtain} {...curtainFinish}/>:<meshStandardMaterial color={curtain} roughness={1}/>}</mesh>)}
   <mesh position={[a*(width/2+.25),-height*.15,.28]}><torusGeometry args={[.19,.025,8,16]}/><meshStandardMaterial color="#c6a35b" metalness={.6}/></mesh>
  </group>)}
 </group>
}
import {useMemo} from 'react'
function useMemoShape(w,h,rectangular=false){const geometry=useMemo(()=>createWindowGeometry(w,h,rectangular),[w,h,rectangular]);useEffect(()=>()=>geometry.dispose(),[geometry]);return geometry}
