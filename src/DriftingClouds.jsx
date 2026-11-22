import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {natureMood} from './natureMood'
export default function DriftingClouds({time,weather}){
 const ref=useRef(),m=natureMood(time,weather),u=useMemo(()=>({clock:{value:0},color:{value:new THREE.Color(m.evening?'#a9a1aa':m.wet?'#bbc7ca':'#fffdf5')},sky:{value:new THREE.Color(m.evening?'#263e66':m.wet||m.snow?'#8ca9b9':'#1687df')},horizon:{value:new THREE.Color(m.evening?'#ad938e':m.wet||m.snow?'#b6c8cd':'#a9ddf4')},sunlight:{value:m.evening||m.wet||m.snow?0:1}}),[time,weather])
 useFrame(({clock,camera})=>{u.clock.value=clock.elapsedTime;ref.current?.position.copy(camera.position)})
 return <mesh ref={ref} renderOrder={-10} userData={{noCameraCollision:true}}><sphereGeometry args={[150,40,20]}/><shaderMaterial side={THREE.BackSide} transparent depthWrite={false} uniforms={u} toneMapped={false} vertexShader="varying vec3 p;void main(){p=position/150.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={`varying vec3 p;uniform float clock;uniform vec3 color,sky,horizon;uniform float sunlight;
 float hash(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}float n(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}float fb(vec2 v){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(v);v=v*2.03+13.;a*=.5;}return s;}
 void main(){vec3 d=normalize(p);vec2 q=d.xz/max(.28,d.y)*1.8+vec2(clock*.006,0.);float mass=fb(q*.8+vec2(fb(q*1.1)*.5));float detail=fb(q*3.5);float alpha=smoothstep(.43,.58,mass+detail*.09)*smoothstep(-.04,.15,d.y);float light=fb(q+vec2(.1,.25));vec3 cloud=color*mix(.68,1.08,smoothstep(.3,.66,light));vec3 background=mix(horizon,sky,smoothstep(-.08,.72,d.y));float sun=max(0.,dot(d,normalize(vec3(-.6,.45,.3))));background+=vec3(1.,.85,.58)*sunlight*(pow(sun,350.)*1.8+pow(sun,25.)*.16);gl_FragColor=vec4(mix(background,cloud,alpha),1.);

 #include <colorspace_fragment>
 }`}/></mesh>
}
