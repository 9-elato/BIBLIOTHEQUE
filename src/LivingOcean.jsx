import {ambientUpdateDue} from './ambientUpdates'
import React,{useMemo,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {paintOcean} from './oceanLandscape'
import {natureMood} from './natureMood'
export default function LivingOcean({w,h,time,weather}){
 const m=natureMood(time,weather),map=useMemo(()=>paintOcean(time,weather),[time,weather]),ref=useRef()
 useEffect(()=>()=>map.dispose(),[map])
 const uniforms=useMemo(()=>({base:{value:map},clock:{value:0},sky:{value:new THREE.Color(m.sky)},horizon:{value:new THREE.Color(m.horizon)},evening:{value:m.evening?1:0},storm:{value:m.wet?1:0}}),[map])
 useFrame(({clock})=>{if(ambientUpdateDue(ref.current,clock.elapsedTime,null))ref.current.material.uniforms.clock.value=clock.elapsedTime})
 return <mesh position={[0,0,-.4]} userData={{noBatch:true}} ref={ref}><planeGeometry args={[w,h]}/><shaderMaterial uniforms={uniforms} toneMapped={false} vertexShader="varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={`
 varying vec2 uvv;uniform sampler2D base;uniform float clock,evening,storm;uniform vec3 sky,horizon;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return v;}
 void main(){vec2 uv=uvv;vec3 c=texture2D(base,uv).rgb;
 if(uv.y>.508){float y=(uv.y-.508)/.492;vec2 p=vec2(uv.x*5.-clock*.018,y*3.7);float billow=fbm(p+vec2(fbm(p*.7),0.));float band=exp(-pow((y-.43)/.29,2.));float cloud=smoothstep(.36,.67,billow)*band;float edge=fbm(p+vec2(0.,.13));vec3 white=mix(vec3(.78,.87,.91),vec3(1.,.98,.92),smoothstep(.32,.64,edge));white=mix(white,vec3(.61,.65,.72),evening*.5+storm*.25);c=mix(horizon,sky,smoothstep(0.,1.,y));c=mix(c,white,cloud*.96);
 }else{float depth=clamp((.508-uv.y)/.508,0.,1.);float phase=uv.y*95.+sin(uv.x*16.+clock*.3)*1.1-clock*(1.15+storm*.5);float wave=sin(phase);vec2 bend=vec2(sin(phase*.7)*.0008,wave*.002*depth);vec3 baseColor=texture2D(base,uv+bend).rgb;float foam=smoothstep(.80,.99,wave)*smoothstep(.44,.7,noise(vec2(uv.x*80.-clock*.1,uv.y*50.)))*depth;float surf=exp(-pow((uv.y-(.065+.015*sin(uv.x*13.+clock*.7)))/.018,2.));float rock=step(.08,uv.y)+step(.13,uv.x)*step(uv.x,.85);c=baseColor*(1.+wave*.045*depth);c=mix(c,vec3(.88,.96,.93),clamp((foam*.58+surf*.4)*rock,0.,.7)*(1.-evening*.55));}
 gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
 }`}/></mesh>
}
