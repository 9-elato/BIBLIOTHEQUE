import React,{useMemo,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {natureMood} from './natureMood'
export default function SeaWater({position,size,time,weather}){
 const m=natureMood(time,weather),clock=useMemo(()=>({value:0}),[])
 const material=useMemo(()=>{const mat=new THREE.MeshStandardMaterial({color:m.sea,metalness:.18,roughness:.26});mat.onBeforeCompile=s=>{s.uniforms.waveClock=clock;s.vertexShader='uniform float waveClock;varying vec2 waveUv;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n waveUv=position.xy;transformed.z+=sin(position.y*.65-waveClock*.8+sin(position.x*.12))*.075;');s.fragmentShader='uniform float waveClock;varying vec2 waveUv;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float crest=sin(waveUv.y*.65-waveClock*.8+sin(waveUv.x*.12));float breaks=smoothstep(.92,.995,crest)*smoothstep(.05,.6,sin(waveUv.x*.8+waveUv.y*.13));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.83,.92,.88),breaks*.55);')};return mat},[m.sea,clock])
 useEffect(()=>()=>material.dispose(),[material]);useFrame(({clock:c})=>{clock.value=c.elapsedTime})
 return <mesh userData={{noBatch:true}} position={position} rotation={[-Math.PI/2,0,0]} material={material}><planeGeometry args={[...size,100,60]}/></mesh>
}
