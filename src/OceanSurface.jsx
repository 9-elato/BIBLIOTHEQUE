import NaturalRocks from './NaturalRocks'
import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {natureMood} from './natureMood'
import {ambientUpdateDue} from './ambientUpdates'

// Geometric displacement and its analytic derivatives share the same spectrum.
// No particles: highlights come from the sun / surface normal / view half-vector.
const waves=`
float wave(vec2 p,float t,out vec2 slope){
 float h=0.;slope=vec2(0.);
 for(int i=0;i<6;i++){
  float f=float(i),k=1.3*pow(1.74,f),a=.075*pow(.55,f);
  vec2 d=normalize(vec2(1.,.25+sin(f*2.4)*.8));
  float q=dot(p,d)*k-t*sqrt(9.81*k)*(1.+f*.06)+f*1.7;
  h+=a*sin(q);slope+=a*k*cos(q)*d;
 }return h;
}`
export default function OceanSurface({w,h,time,weather}){
 const rocks=useMemo(()=>[-1,1].map(side=>({position:[side*w*.40,-h*.46,.01],scale:[w*.075,h*.08,.19],seed:side+8,waterLevel:-h*.49,moss:side===1})),[w,h])
 const lastUpdate=useRef(null),ref=useRef(),uniforms=useMemo(()=>({clock:{value:0},size:{value:new THREE.Vector2(w,h)},sun:{value:new THREE.Vector3(.3,.65,.7).normalize()},dim:{value:1},storm:{value:0}}),[w,h])
 useFrame(({clock})=>{if(!ambientUpdateDue(ref.current,clock.elapsedTime,lastUpdate.current))return;lastUpdate.current=clock.elapsedTime;uniforms.clock.value=clock.elapsedTime;uniforms.dim.value=time==='evening'?.35:1;uniforms.sun.value.fromArray(natureMood(time,weather).sunDirection);uniforms.storm.value=weather==='rain'?1:0})
 return <group><mesh ref={ref} userData={{noBatch:true}} frustumCulled={false}>
  <planeGeometry args={[w,h*.5,112,64]}/>
  <shaderMaterial uniforms={uniforms} toneMapped={false} side={THREE.DoubleSide}
   vertexShader={`${waves}
   uniform float clock;uniform vec2 size;varying vec2 sea;varying vec3 worldPoint;varying vec3 worldNormal;varying float crest;
   void main(){float depth=clamp(.5-position.y/(size.y*.5),0.,1.);sea=vec2(position.x,depth*12.);vec2 slope;
    float height=wave(sea,clock,slope);float fade=smoothstep(0.,.12,depth);
    vec3 p=position;p.y-=size.y*.25;p.y+=height*.3*fade;p.z=-.10+height*fade;
    crest=height;worldNormal=normalize(mat3(modelMatrix)*normalize(vec3(-slope.x,-slope.y*.5,1.)));
    worldPoint=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(worldPoint,1.);
   }`}
   fragmentShader={`${waves}
   uniform float clock,dim,storm;uniform vec2 size;uniform vec3 sun;varying vec2 sea;varying vec3 worldPoint,worldNormal;varying float crest;
   void main(){float depth=clamp(sea.y/12.,0.,1.);vec3 V=normalize(cameraPosition-worldPoint);vec2 ripple;
    wave(sea*3.7,clock*1.23,ripple);
    vec3 surface=normalize(cross(dFdx(worldPoint),dFdy(worldPoint)));if(dot(surface,V)<0.)surface=-surface;
    vec3 N=normalize(surface+vec3(ripple.x,ripple.y,0.)*.14*depth);
    vec3 L=normalize(sun),H=normalize(L+V);
    float spec=pow(max(dot(N,H),0.),mix(35.,140.,depth));
    float fresnel=.025+.975*pow(1.-max(dot(N,V),0.),5.);
    vec3 color=mix(vec3(.07,.30,.53),vec3(.025,.38,.48),depth);
    color=mix(color,vec3(.50,.73,.87),fresnel*.65);
    color+=vec3(1.,.91,.69)*spec*(1.-storm*.85)*dim*1.9;
    float rocks=smoothstep(.27,.48,abs(sea.x)/size.x);
    vec2 shorePoint=vec2((abs(sea.x)-size.x*.40)/(size.x*.075),(depth-.92)/.08);
    float shore=exp(-abs(length(shorePoint)-1.1)*5.)*smoothstep(.65,.90,depth);
    float pulse=smoothstep(.015,.085,crest)*(.6+.4*sin(sea.x*23.+clock*1.4));
    float foam=shore*pulse;
    color=mix(color,vec3(.85,.94,.92),foam);
    color=mix(vec3(.23,.43,.59),color,smoothstep(0.,.12,depth));
    gl_FragColor=vec4(color*(.4+.6*dim),1.);
    #include <colorspace_fragment>
   }`}/>
 </mesh>
 <NaturalRocks rocks={rocks}/>
 </group>
}
