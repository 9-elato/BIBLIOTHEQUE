import useGraphicsQuality from './useGraphicsQuality'
import {oceanSegments} from './oceanGeometry.js'
import React,{useMemo,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {natureMood} from './natureMood'
export default function SeaWater({position,size,time,weather}){
 const quality=useGraphicsQuality(),segments=oceanSegments(size,quality.density<1)
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
    vec3 wavePhase=vec3(dot(wp,vec2(.22,.38))-waveClock*.65,dot(wp,vec2(-.51,.19))-waveClock*.91,dot(wp,vec2(1.35,.72))-waveClock*1.4);
    vec3 slopes=cos(wavePhase)*vec3(.12,.055,.018);
    float dx=dot(slopes,vec3(.22,-.51,1.35));
    float dz=dot(slopes,vec3(.38,.19,.72));
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
 return <mesh userData={{noBatch:true}} position={position} rotation={[-Math.PI/2,0,0]} material={material}><planeGeometry args={[...size,...segments]}/></mesh>
}
