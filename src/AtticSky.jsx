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
 const material=useRef();const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-3.6624,4.7976,1.65,-.7848,7.0152,1.65,-3.6624,4.7976,5.4,-.7848,7.0152,5.4],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();return g},[])
 const uniforms=useMemo(()=>({clock:{value:0},night:{value:0},rain:{value:0},snow:{value:0}}),[])
 useFrame(()=>{const u=material.current.uniforms;u.clock.value=performance.now()/1000;u.night.value=['night','evening'].includes(time)?1:0;u.rain.value=weather==='rain'?1:0;u.snow.value=weather==='snow'?1:0})
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <mesh geometry={geometry} position={[0,-.012,0]}><shaderMaterial ref={material} uniforms={uniforms} vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={fragment} side={THREE.DoubleSide} toneMapped={false}/></mesh>
}
