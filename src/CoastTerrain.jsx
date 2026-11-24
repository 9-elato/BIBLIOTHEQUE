import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {coastPoint} from './coastTerrainMath.js'
export default function CoastTerrain({weather}){
 const geometry=useMemo(()=>[false,true].map(west=>{
 const g=new THREE.PlaneGeometry(1,1,80,14),p=g.attributes.position,c=[]
 for(let i=0;i<p.count;i++){
 const along=west?-34+(p.getX(i)+.5)*66:-38+(p.getX(i)+.5)*158,t=p.getY(i)+.5
 p.setXYZ(i,...coastPoint(along,t,west))
 const color=new THREE.Color(weather==='snow'&&t<.25?'#d9e0d4':t<.18?'#719951':t<.63?'#9c9471':'#626e63');color.multiplyScalar(.94+.06*Math.sin(along*.6+t*11));c.push(color.r,color.g,color.b)
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return g
 }),[weather])
 useEffect(()=>()=>geometry.forEach(g=>g.dispose()),[geometry])
 return <group><mesh position={[41,-.07,-26]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[158,16]}/><meshStandardMaterial color={weather==='snow'?'#d9e0d4':'#719951'} roughness={1}/></mesh>{geometry.map((g,i)=><mesh key={i} geometry={g} receiveShadow><meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={.91}/></mesh>)}</group>
}
