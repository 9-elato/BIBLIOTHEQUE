import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {menuItems} from './cafeMenu'
import {Box as B} from './GroundFloor'
export default function CafeCoffeeBar({onOpen,menu}){
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=600;canvas.height=800;const c=canvas.getContext('2d');c.fillStyle='#f5f0e6';c.fillRect(0,0,600,800);c.fillStyle='#232323';c.textAlign='center';c.font='48px Georgia';c.fillText('BOOk',300,76);c.font='18px Georgia';c.fillText('BOOKS & COFFEE',300,112);c.strokeStyle='#b9aa8c';c.strokeRect(18,18,564,764);menuItems(menu).slice(0,12).forEach((item,i)=>{c.textAlign='left';c.font='20px sans-serif';c.fillText(item.name,38,170+i*50,400);c.textAlign='right';c.font='17px sans-serif';c.fillText(item.price,560,170+i*50,110)});const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t},[menu]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <group>
 <group position={[-18.3,1.43,17.3]}><B p={[0,.25,0]} s={[.32,.5,.3]} c="#252525"/><mesh position={[0,.63,0]}><cylinderGeometry args={[.16,.10,.3,16]}/><meshStandardMaterial color="#614632" roughness={.5}/></mesh><B p={[.18,.35,0]} s={[.18,.08,.12]} c="#b1a48d"/><mesh position={[.25,.09,0]}><cylinderGeometry args={[.1,.1,.17,16]}/><meshStandardMaterial color="#e5dac3"/></mesh></group>
 {[-17.3,-17.8].map(x=><group key={x} position={[x,1.43,18.3]}><B p={[0,0,0]} s={[.38,.05,.4]} c="#b19a78"/><mesh position={[0,.16,0]}><cylinderGeometry args={[.09,.13,.27,18]}/><meshStandardMaterial color="#d0c2a5" roughness={.22}/></mesh><mesh position={[0,.37,0]}><coneGeometry args={[.17,.23,24,1,true]}/><meshStandardMaterial color="#f1e7d3" side={2}/></mesh></group>)}
 <group position={[-18.2,1.6,19.3]}><mesh><sphereGeometry args={[.2,20,12]}/><meshStandardMaterial color="#343332" roughness={.3} metalness={.65}/></mesh><mesh rotation={[0,0,-.6]} position={[.22,.12,0]}><torusGeometry args={[.2,.025,8,20,2]}/><meshStandardMaterial color="#343332" metalness={.65} roughness={.3}/></mesh></group>
 <group position={[-19.26,1.83,19.8]} rotation={[0,-Math.PI/2,0]} onClick={e=>{e.stopPropagation();onOpen('cafe-menu')}}><B p={[0,0,0]} s={[.29,.72,.035]} c="#222323"/><mesh position={[0,0,.022]}><planeGeometry args={[.27,.68]}/><meshBasicMaterial map={texture}/></mesh><B p={[0,-.37,0]} s={[.34,.04,.2]} c="#222323"/></group>
 </group>}
