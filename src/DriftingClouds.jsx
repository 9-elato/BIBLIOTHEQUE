import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {natureMood} from './natureMood'
export default function DriftingClouds({time,weather}){
 const ref=useRef(),m=natureMood(time,weather),u=useMemo(()=>({clock:{value:0},color:{value:new THREE.Color(m.evening?'#a9a1aa':m.wet?'#bbc7ca':'#fff8e7')}}),[time,weather])
 useFrame(({clock,camera})=>{u.clock.value=clock.elapsedTime;ref.current?.position.copy(camera.position)})
 return <mesh ref={ref} renderOrder={-10}><sphereGeometry args={[150,40,20]}/><shaderMaterial side={THREE.BackSide} transparent depthWrite={false} uniforms={u} toneMapped={false} vertexShader="varying vec3 p;void main(){p=position/150.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={`varying vec3 p;uniform float clock;uniform vec3 color;
 float hash(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}float n(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}float fb(vec2 v){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(v);v=v*2.03+13.;a*=.5;}return s;}
 void main(){vec3 d=normalize(p);vec2 q=d.xz/max(.15,d.y)*1.4+vec2(clock*.006,0.);float mass=fb(q);float alpha=smoothstep(.40,.69,mass)*smoothstep(.05,.22,d.y);gl_FragColor=vec4(color*(.80+.20*fb(q+vec2(0.,.14))),alpha*.85);
 #include <colorspace_fragment>
 }`}/></mesh>
}
