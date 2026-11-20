import React,{useMemo} from 'react'
import {useGLTF} from '@react-three/drei'
export default function FacadeModel({visible=true}){
 const {scene}=useGLTF(import.meta.env.BASE_URL+'models/manor_estate.glb')
 const copy=useMemo(()=>{const c=scene.clone(true);c.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});return c},[scene])
 return <primitive object={copy} visible={visible}/>
}
