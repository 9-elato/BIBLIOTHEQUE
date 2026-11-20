import React from 'react'
// Reusable exterior view. Its inputs remain independent of the window frame.
export function WindowLandscape({time='afternoon',weather='sunny',event='none',season,celestial=true,width=1.5,height=4}){
 const shape=useMemoShape(width,height)
 const dark=['evening','night'].includes(time),snow=weather==='snow'
 const sky=dark?'#223751':weather==='rain'?'#798b94':time==='morning'?'#c4d9d7':'#9dbfc5'
 return <group>
  <mesh geometry={shape}><meshBasicMaterial color={sky}/></mesh>
  {celestial&&<mesh position={[width*.22,height*.26,.012]}><circleGeometry args={[width*.13,24]}/><meshBasicMaterial color={dark?'#f1e6bd':'#f8ddb0'}/></mesh>}
  {[-.35,0,.35].map((a,i)=><group key={a} position={[width*a,-height*.28,.025]}>
   <mesh position={[0,.4,0]}><coneGeometry args={[width*.14,height*.35,7]}/><meshBasicMaterial color={snow?'#dfe7df':dark?'#183b39':season==='winter'?'#b7c3bb':season==='autumn'?'#a7794c':season==='spring'?'#7e9c6a':'#4e705b'}/></mesh>
   {event==='christmas'&&<mesh position={[0,.5,.03]}><sphereGeometry args={[.04,8,6]}/><meshBasicMaterial color="#ffc675"/></mesh>}
  </group>)}
  {weather!=='sunny'&&Array.from({length:22},(_,i)=><mesh key={i} position={[((i*13%23)/23-.5)*width,((i*7%23)/23-.5)*height,.06]}><planeGeometry args={[snow?.035:.012,snow?.035:.18]}/><meshBasicMaterial color={snow?'#ffffff':'#c6d9e5'} transparent opacity={.75}/></mesh>)}
  {event==='halloween'&&<mesh position={[0,-height*.38,.06]}><sphereGeometry args={[width*.13,12,8]}/><meshBasicMaterial color="#df913f"/></mesh>}
 </group>
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
import * as THREE from 'three'
import {useMemo} from 'react'
function useMemoShape(w,h){return useMemo(()=>{const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2-w/2);s.absarc(0,h/2-w/2,w/2,0,Math.PI,false);s.closePath();return new THREE.ShapeGeometry(s)},[w,h])}
