import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {upholstery} from './cafeUpholstery'
export default function CafeThrow(){
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(.75,.85,14,18),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=(p.getX(i)+.375)/.75,v=p.getY(i),t=Math.max(0,(u-.45)/.55);p.setXYZ(i,.22+Math.min(u,.68)*.75,.94-.62*t*t+.018*Math.sin(v*24+u*3),v+.08+.018*Math.sin(u*15))}g.computeVertexNormals();return g},[])
 const material=useMemo(()=>{const m=upholstery('#b6b09a').clone();m.side=THREE.DoubleSide;return m},[])
 useEffect(()=>()=>{geometry.dispose();material.dispose()},[geometry,material])
 return <mesh geometry={geometry} material={material} userData={{noCameraCollision:true}}/>
}
