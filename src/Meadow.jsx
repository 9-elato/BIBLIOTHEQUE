import GrassField from './GrassField'
import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import {meadowHeight} from './meadowLayout'
export default function Meadow({time,weather}){
 const snow=weather==='snow',night=time==='evening'
 const ground=useMemo(()=>{const g=new THREE.PlaneGeometry(220,210,110,105);g.rotateX(-Math.PI/2);g.translate(0,0,137);const p=g.attributes.position,colors=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,meadowHeight(x,z)-.015);const k=.5+.25*Math.sin(x*.31+z*.19)+.25*Math.sin(z*.62-x*.13),c=new THREE.Color(snow?'#dce8dd':night?'#46754a':'#77a94a');c.multiplyScalar(.86+k*.22);colors.push(c.r,c.g,c.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g},[snow,night])
 const turf=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#b7c996';ctx.fillRect(0,0,256,256);for(let i=0;i<9000;i++){const x=(i*.61803398875%1)*256,y=(i*.41421356237%1)*256;ctx.strokeStyle=i%3?'#a6bd83':'#d1dba9';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+1.5,y-2-i%4);ctx.stroke()}const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(72,70);map.colorSpace=THREE.SRGBColorSpace;return map},[])
 useEffect(()=>()=>turf.dispose(),[turf])
 useEffect(()=>()=>ground.dispose(),[ground])
 return <group><mesh geometry={ground} castShadow receiveShadow><meshStandardMaterial vertexColors map={turf} roughness={.94}/></mesh><GrassField bounds={[-48,48,33,112]} height={meadowHeight} weather={weather}/></group>
}
