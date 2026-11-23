import React,{useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {useLibraryModel} from './useLibraryModel'
import {FloatingBook} from './GhostGLB'
import {prepareLabrador,animateLabrador,disposeLabrador} from './labradorMotion'
const url=import.meta.env.BASE_URL+'models/labrador_arsenal.glb'
export default function LabradorAvatar({moving,book,pose}){
 const {scene}=useLibraryModel(url),root=useRef()
 const model=useMemo(()=>prepareLabrador(scene),[scene])
 useEffect(()=>()=>disposeLabrador(model),[model])
 useFrame(({clock},dt)=>{
  const sit=pose?.current?.amount||0,t=clock.elapsedTime
  animateLabrador(model,t,dt,moving.current,Boolean(book),sit)
  if(pose?.current?.climbing){for(const key of ['ArmL','ArmR']){const part=model.parts[key];if(part){part.node.rotation.x-=1.2;part.node.position.y+=.15}}if(model.parts.Football)model.parts.Football.node.visible=false}
  root.current.position.y=.02+Math.sin(t*9)*.018*(moving.current?1:0)*(1-sit)
 })
 return <group ref={root} rotation={[0,Math.PI,0]}><primitive object={model.copy}/>{book&&<FloatingBook key={book.id} book={book} pose={pose}/>}</group>
}
