import React,{useEffect} from 'react'
import {forestTexture} from './ForestReadingNook'
// Reusable exterior view. Its inputs remain independent of the window frame.
const paintedViews=new Map()
export function WindowLandscape({time='afternoon',weather='sunny',event='none',season,celestial=true,width=1.5,height=4}){
 const shape=useMemoShape(width,height)
 const variant=Math.round(width*13+height*7)%5
 const key=[time,weather,event,season,celestial,variant].join(':')
 const map=useMemo(()=>{let entry=paintedViews.get(key);if(!entry){entry={map:forestTexture(time,weather),users:0};paintedViews.set(key,entry)}return entry},[key])
 useEffect(()=>{map.users++;return()=>{if(--map.users===0){map.map.dispose();paintedViews.delete(key)}}},[map,key])
 return <mesh geometry={shape}><meshBasicMaterial map={map.map}/></mesh>
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
function useMemoShape(w,h){const geometry=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2-w/2);s.absarc(0,h/2-w/2,w/2,0,Math.PI,false);s.closePath();const g=new THREE.ShapeGeometry(s),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5);return g},[w,h]);useEffect(()=>()=>geometry.dispose(),[geometry]);return geometry}
