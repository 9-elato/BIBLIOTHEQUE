import React,{useMemo,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
const fragment=`
 varying vec2 vUv;uniform float clock;uniform float night;uniform float rain;uniform float snow;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){
 vec2 uv=vUv;float t=clock;
 vec3 sky=mix(vec3(.48,.67,.76),vec3(.035,.055,.15),night);
 float cloud=sin(uv.x*9.+t*.025)+sin(uv.y*13.+uv.x*5.-t*.018);
 sky+=vec3(.12,.10,.17)*smoothstep(.8,1.9,cloud)*(1.-night*.7);
 sky=mix(sky,vec3(.22,.29,.38),rain*.6);
 vec2 starUv=uv+vec2(t*.0007,t*.00025);vec2 grid=starUv*vec2(29.,23.);vec2 cell=floor(grid);float seed=hash(cell);
 float star=(1.-smoothstep(.025,.07,length(fract(grid)-.5)))*step(.70,seed);
 sky+=vec3(.8,.82,1.)*star*(.6+.4*sin(t*(.6+seed)+seed*50.))*night*(1.-rain*.8);
 vec2 moon=uv-vec2(.5+sin(t*.007)*.21,.64+cos(t*.006)*.08);float disk=1.-smoothstep(.075,.08,length(moon));
 float shade=1.-smoothstep(.075,.08,length(moon-vec2(.10*sin(t*.018),.012)));
 sky=mix(sky,vec3(.96,.9,.70),disk*(1.-shade)*night);
 float meteor=fract(t/18.);vec2 head=vec2(.15+meteor*.75,.88-meteor*.5);vec2 d=uv-head;
 float tail=exp(-abs(d.y+d.x*.66)*180.)*smoothstep(-.22,0.,d.x)*step(d.x,0.);
 sky+=vec3(.50,.7,1.)*tail*night*step(meteor,.8)*(1.-rain);
 vec2 drops=fract(uv*vec2(22.,14.)+vec2(0.,t*.35));float streak=step(.97,drops.x)*step(.65,drops.y);
 sky+=vec3(.23,.32,.4)*streak*rain;
 vec2 flakes=fract(uv*vec2(16.,12.)+vec2(sin(t*.3)*.12,t*.08));sky+=vec3(.7)* (1.-smoothstep(.02,.065,length(flakes-.5)))*snow;
 gl_FragColor=vec4(sky,1.);
 }`
export default function AtticSky({time,weather}){
 const material=useRef();const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-4.05,4.499,-.4,-.5,7.235,-.4,-4.05,4.499,5.9,-.5,7.235,5.9],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();return g},[])
 const uniforms=useMemo(()=>({clock:{value:0},night:{value:0},rain:{value:0},snow:{value:0}}),[])
 useFrame(()=>{const u=material.current.uniforms;u.clock.value=performance.now()/1000;u.night.value=['night','evening'].includes(time)?1:0;u.rain.value=weather==='rain'?1:0;u.snow.value=weather==='snow'?1:0})
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <mesh geometry={geometry} position={[0,-.012,0]}><shaderMaterial ref={material} uniforms={uniforms} vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={fragment} side={THREE.DoubleSide} toneMapped={false}/></mesh>
}

function RoofPatch({x0,x1,z0,z1,map}){
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry(),y=x=>7.62+x*(3.36/4.36);g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y(x0),z0,x1,y(x1),z0,x0,y(x0),z1,x1,y(x1),z1],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();return g},[x0,x1,z0,z1]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry}><meshStandardMaterial map={map} color="#ad9472" side={THREE.DoubleSide} roughness={.95}/></mesh>
}
export function PanoramicRoofFrame({map}){const low=[-4.05,4.499],high=[-.5,7.235];return <group>
 {[[ -4.36,0,-6.85,-.4],[-4.36,0,5.9,6.85],[-4.36,-4.05,-.4,5.9],[-.5,0,-.4,5.9]].map(([x0,x1,z0,z1],i)=><RoofPatch key={i} {...{x0,x1,z0,z1,map}}/>)}
 {[low,high].map(([x,y])=><mesh key={x} position={[x,y-.02,2.75]}><boxGeometry args={[.10,.13,6.4]}/><meshStandardMaterial color="#423b30" metalness={.3} roughness={.45}/></mesh>)}
 {[-.4,5.9].map(z=><mesh key={z} position={[-2.275,5.85,z]} rotation={[0,0,Math.atan2(2.736,3.55)]}><boxGeometry args={[4.5,.12,.10]}/><meshStandardMaterial color="#423b30" metalness={.3} roughness={.45}/></mesh>)}
 </group>}
