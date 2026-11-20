import {BookCoverMesh} from './BookCover'
import React,{useMemo,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import {Box3,Vector3,MathUtils,DoubleSide} from 'three'
const url=`${import.meta.env.BASE_URL}models/ghost_avatar.glb`

export function FloatingBook({book,pose}){
 const root=useRef(),leaf=useRef(),left=useRef(),right=useRef()
 const opened=useRef(0)
 useFrame(({clock},dt)=>{
  if(!root.current)return
  const sit=pose?.current?.amount||0,t=clock.elapsedTime
  opened.current=MathUtils.damp(opened.current,1,6,dt)
  root.current.scale.setScalar(Math.max(.01,opened.current))
  root.current.position.set(0, .83-.33*sit+Math.sin(t*1.2)*.012,.86-.06*sit)
  root.current.rotation.set(.15+.43*sit,Math.PI,.012*Math.sin(t*.7))
  const fold=(1-opened.current)*1.35+.12
  left.current.rotation.y=-fold;right.current.rotation.y=fold
  const phase=(t%9-7.5)/1.5
  leaf.current.visible=sit>.8&&!book.isKey&&phase>0
  leaf.current.rotation.y=-Math.PI*MathUtils.smoothstep(phase,0,1)
 })
 return <group ref={root} position={[0,1,.86]} rotation={[.15,Math.PI,0]}>
  {[-1,1].map(side=><group key={side} ref={side<0?left:right} position={[side*.18,0,0]}>
   {side===1&&<BookCoverMesh url={book.cover} position={[0,0,-.026]} rotation={[0,Math.PI,0]} size={[.345,.435]}/>}
   <mesh castShadow><boxGeometry args={[.36,.45,.045]}/><meshStandardMaterial color={book.color||'#795440'} roughness={.8}/></mesh>
   <mesh position={[0,0,.029]}><boxGeometry args={[.33,.41,.012]}/><meshStandardMaterial color="#f2e4c8" roughness={.92}/></mesh>
   {[0,1,2,3,4].map(i=><mesh key={i} position={[0,.12-i*.055,.038]}><boxGeometry args={[i===4?.13:.23,.006,.003]}/><meshStandardMaterial color="#a69a81"/></mesh>)}
  </group>)}
  <mesh position={[0,0,.015]}><boxGeometry args={[.024,.46,.09]}/><meshStandardMaterial color="#b89b6c"/></mesh>
  <group ref={leaf} position={[0,0,.045]}><mesh position={[-.16,0,0]}><planeGeometry args={[.32,.41]}/><meshStandardMaterial color="#f4e8d0" side={DoubleSide} roughness={.92}/></mesh></group>
 </group>
}

export default function GhostGLB({moving,book=null,pose}){
 const {scene}=useGLTF(url)
 const model=useMemo(()=>{
  const copy=scene.clone(true),bounds=new Box3().setFromObject(copy)
  const size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3())
  const scale=1.45/Math.max(size.y,.001)
  copy.scale.multiplyScalar(scale);copy.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale)
  const sheet=copy.getObjectByName('GHOST_OnePiece_Sheet')
  let original=null,minY=0
  if(sheet?.isMesh){
   sheet.geometry=sheet.geometry.clone()
   original=sheet.geometry.attributes.position.array.slice()
   sheet.geometry.computeBoundingBox();minY=sheet.geometry.boundingBox.min.y
   sheet.geometry.boundingSphere=null
  }
  const eyes=['GHOST_Eye_L','GHOST_Eye_R'].map(name=>copy.getObjectByName(name)).filter(Boolean).map(object=>{object.position.z+=.035;return {object,y:object.position.y}})
  return {copy,sheet,original,minY,eyes}
 },[scene])
 useEffect(()=>()=>{model.sheet?.geometry.dispose()},[model])
 const root=useRef(),body=useRef(),lastAmount=useRef(-1),reading=useRef(0)
 useFrame(({clock},dt)=>{
  if(!root.current)return
  const t=clock.elapsedTime,amount=pose?.current?.amount||0
  reading.current=MathUtils.damp(reading.current,book&&!book.isKey?1:0,5,dt)
  root.current.position.y=.14*(1-amount)+.015*amount+Math.sin(t*1.8)*(.045*(1-amount)+.008*amount)
  root.current.rotation.z=.012*Math.sin(t*1.3)*(1-amount*.8)
  body.current.rotation.x=amount*(.035+.07*reading.current)
  if(model.original&&Math.abs(lastAmount.current-amount)>.001){
   const array=model.sheet.geometry.attributes.position.array,source=model.original
   for(let i=0;i<array.length;i+=3){
    const h=source[i+1]-model.minY,lower=1-MathUtils.smoothstep(h,0,1)
    array[i]=source[i]*(1-amount*.16+amount*.04*lower*lower)
    array[i+1]=source[i+1]-amount*.34*MathUtils.smoothstep(h,0,.85)
    array[i+2]=source[i+2]*(1+amount*.1*lower*lower)
   }
   model.sheet.geometry.attributes.position.needsUpdate=true
   model.sheet.geometry.computeVertexNormals();model.sheet.geometry.computeBoundingSphere()
   model.eyes.forEach(({object,y})=>{object.position.y=y-.34*amount})
   lastAmount.current=amount
  }
 })
 return <group ref={root} rotation={[0,Math.PI,0]}>
  <group ref={body}><primitive object={model.copy}/></group>
  {book&&<FloatingBook key={book.id||'key'} book={book} pose={pose}/>}
 </group>
}
useGLTF.preload(url)
