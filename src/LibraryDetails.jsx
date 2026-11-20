import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'

function Piece({p,s,c='#654332',map,metal=0}){
 return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} map={map} metalness={metal} roughness={metal ? .4 : .8}/></mesh>
}
export default function LibraryDetails(){
 const wood=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128
  const ctx=canvas.getContext('2d');ctx.fillStyle='#c9a579';ctx.fillRect(0,0,256,128)
  for(let i=0;i<100;i++){
   ctx.strokeStyle=`rgba(70,35,15,${.04+(i%7)*.012})`;ctx.lineWidth=i%4===0?2:1;ctx.beginPath()
   for(let x=0;x<=256;x+=8){const y=i*1.31+Math.sin(x*.025+i)*1.4;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,2)
  return texture
 },[])
 useEffect(()=>()=>wood.dispose(),[wood])
 return <group>
  {/* A full-size reading table occupies the same footprint as navigation.js. */}
  <group position={[0,0,1.75]}>
   <Piece p={[0,1.04,0]} s={[4,.16,2.6]} c="#92633e" map={wood}/>
   <Piece p={[0,.9,0]} s={[3.84,.18,2.44]} c="#573923"/>
   <Piece p={[0,1.128,0]} s={[3.42,.012,1.96]} c="#4b6052"/>
   {[-1.7,1.7].flatMap(x=>[-1,1].map(z=><group key={`${x}/${z}`}>
    <Piece p={[x,.45,z]} s={[.22,.9,.22]} c="#68432b" map={wood}/>
    <Piece p={[x,.13,z]} s={[.3,.22,.3]} c="#533721"/>
    <Piece p={[x,.8,z]} s={[.29,.09,.29]} c="#b3945d" metal={.55}/>
   </group>))}
   <Piece p={[0,.23,0]} s={[3.5,.12,.15]} c="#68432b" map={wood}/>
   {/* Rear lamp leaves all six book places free. */}
   <mesh position={[0,1.17,-1.08]}><cylinderGeometry args={[.15,.19,.06,20]}/><meshStandardMaterial color="#b39152" metalness={.6} roughness={.4}/></mesh>
   <Piece p={[0,1.38,-1.08]} s={[.045,.42,.045]} c="#b39152" metal={.6}/>
   <mesh position={[0,1.6,-1.08]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.15,.15,.55,24,1,true,0,Math.PI]}/><meshStandardMaterial color="#355c46" side={THREE.DoubleSide} roughness={.38}/></mesh>
   <pointLight position={[0,1.48,-.98]} color="#ffe0a1" intensity={1.8} distance={3.5}/>
  </group>
  {/* Close the hall above the ground-floor openings; layered cornices frame the atrium. */}
  {[-6.95,7.35].map(z=><group key={z}>
   {z<0?<><Piece p={[-4.65,8.5,z]} s={[6.3,6.4,.23]} c="#d8c6aa"/><Piece p={[4.65,8.5,z]} s={[6.3,6.4,.23]} c="#d8c6aa"/><Piece p={[0,11.2,z]} s={[3,1,.23]} c="#d8c6aa"/><Piece p={[0,6.1,z]} s={[3,2,.23]} c="#d8c6aa"/></>:<Piece p={[0,8.5,z]} s={[15.6,6.4,.23]} c="#d8c6aa"/>}
   {[7.1,11.3,11.5].map(y=><Piece key={y} p={[0,y,z+(z<0?.15:-.15)]} s={[15.5,.16,.25]} c={y<6?'#795334':'#c1a477'}/>)}
   {(z<0?[-5,-2.5,2.5,5]:[-5,-2.5,0,2.5,5]).map(x=><Piece key={x} p={[x,7.6,z+(z<0?.14:-.14)]} s={[.095,3.9,.12]} c="#bd9a70"/>)}
  </group>)}
  <Piece p={[-7.75,8,-.95]} s={[.2,5.4,11.6]} c="#d8c6aa"/>
  <Piece p={[0,11.75,.1]} s={[15.7,.2,14.6]} c="#e4d3b8"/>
  {[-5,-2.5,0,2.5,5].map(z=><group key={z}>
   <Piece p={[0,11.53,z]} s={[15.5,.28,.22]} c="#67472e" map={wood}/>
   <Piece p={[0,11.35,z]} s={[15.5,.08,.32]} c="#b59056"/>
  </group>)}
 </group>
}
