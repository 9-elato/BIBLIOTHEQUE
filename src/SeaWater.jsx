import React,{useMemo,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {natureMood} from './natureMood'
export default function SeaWater({position,size,time,weather}){
 const m=natureMood(time,weather),clock=useMemo(()=>({value:0}),[])
 const material=useMemo(()=>{
  const mat=new THREE.MeshStandardMaterial({color:m.sea,metalness:.18,roughness:.26})
  mat.onBeforeCompile=s=>{
   s.uniforms.waveClock=clock;s.uniforms.waveOrigin={value:new THREE.Vector2(position[0],position[2])}
   const waves=`uniform float waveClock;uniform vec2 waveOrigin;
    float waveHeight(vec2 p){return sin(dot(p,vec2(.22,.38))-waveClock*.65)*.12+sin(dot(p,vec2(-.51,.19))-waveClock*.91)*.055+sin(dot(p,vec2(1.35,.72))-waveClock*1.4)*.018;}`
   s.vertexShader=waves+'varying vec2 waveUv;\n'+s.vertexShader
   s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
    vec2 wp=vec2(position.x,-position.y)+waveOrigin;
    float dx=(waveHeight(wp+vec2(.04,0.))-waveHeight(wp-vec2(.04,0.)))/.08;
    float dz=(waveHeight(wp+vec2(0.,.04))-waveHeight(wp-vec2(0.,.04)))/.08;
    objectNormal=normalize(vec3(-dx,dz,1.));`)
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    waveUv=vec2(position.x,-position.y)+waveOrigin;transformed.z+=waveHeight(waveUv);`)
   s.fragmentShader=waves+'varying vec2 waveUv;\n'+s.fragmentShader
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float crest=waveHeight(waveUv);float breaks=smoothstep(.13,.18,crest)*smoothstep(.05,.6,sin(waveUv.x*.8+waveUv.y*.13));
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.83,.92,.88),breaks*.28);`)
  }
  return mat
 },[m.sea,clock,position[0],position[2]])
 useEffect(()=>()=>material.dispose(),[material]);useFrame(({clock:c})=>{clock.value=c.elapsedTime})
 return <mesh userData={{noBatch:true}} position={position} rotation={[-Math.PI/2,0,0]} material={material}><planeGeometry args={[...size,100,60]}/></mesh>
}
