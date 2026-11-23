import React,{useMemo,useEffect} from 'react'
import {rockFieldGeometry,rockMaterial} from './rockSurface'
export default function NaturalRocks({rocks}){
 const geometry=useMemo(()=>rockFieldGeometry(rocks),[rocks]),material=useMemo(rockMaterial,[])
 useEffect(()=>()=>geometry.dispose(),[geometry]);useEffect(()=>()=>material.dispose(),[material])
 return <mesh geometry={geometry} material={material} castShadow receiveShadow userData={{noBatch:true}}/>
}
