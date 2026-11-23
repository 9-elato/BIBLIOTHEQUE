import {ambientUpdateDue} from './ambientUpdates'
import React,{useMemo,useEffect,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {createForestLayers} from './forestLandscape'
import {natureMood} from './natureMood'
const cache=new Map()
export default function ForestVista({width=1,height=1,geometry,time,weather}){
 const ref=useRef(),key=time+':'+weather,mood=natureMood(time,weather)
 const entry=useMemo(()=>{if(!cache.has(key))cache.set(key,{maps:createForestLayers(time,weather),users:0});return cache.get(key)},[key])
 useEffect(()=>{entry.users++;return()=>{if(--entry.users===0){entry.maps.forEach(t=>t.dispose());cache.delete(key)}}},[entry,key])
 const local=useMemo(()=>new THREE.Vector3(),[]),uniforms=useMemo(()=>({farMap:{value:entry.maps[0]},midMap:{value:entry.maps[1]},nearMap:{value:entry.maps[2]},clock:{value:0},shift:{value:0},wind:{value:mood.wind},rain:{value:mood.wet?1:0},snow:{value:mood.snow?1:0}}),[entry,mood.wind,mood.wet,mood.snow])
 useFrame(({clock,camera})=>{if(!ambientUpdateDue(ref.current,clock.elapsedTime,null))return;ref.current.worldToLocal(local.copy(camera.position));uniforms.clock.value=clock.elapsedTime;uniforms.shift.value=THREE.MathUtils.clamp(local.x/Math.max(2,Math.abs(local.z)),-1,1)*.018})
 return <mesh ref={ref} geometry={geometry}>{!geometry&&<planeGeometry args={[width,height]}/>}<shaderMaterial uniforms={uniforms} toneMapped={false} vertexShader="varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={`
 varying vec2 v;uniform sampler2D farMap,midMap,nearMap;uniform float clock,shift,wind,rain,snow;
 void main(){vec2 uv=v*.94+.03;float sway=sin(clock*.48+v.y*6.+v.x*9.)*.005*wind;vec4 a=texture2D(farMap,uv+vec2(shift*.15,0.));vec4 b=texture2D(midMap,uv+vec2(shift*.5+sway,0.));vec4 c=texture2D(nearMap,uv+vec2(shift+sway*2.+sin(clock*2.3+v.x*87.+v.y*43.)*.0013*wind,cos(clock*1.7+v.x*61.)*.0008*wind));vec3 color=mix(mix(a.rgb,b.rgb,b.a),c.rgb,c.a);
 vec2 d=fract(v*vec2(47.,15.)+vec2(0.,clock*.26));float streak=smoothstep(.965,1.,d.x)*smoothstep(.35,.9,d.y)*rain;vec2 f=fract(v*vec2(27.,23.)+vec2(sin(clock*.2)*.15,clock*.09));float flake=(1.-smoothstep(.02,.065,length(f-.5)))*snow;color=mix(color,vec3(.78,.86,.83),streak*.16+flake*.6);gl_FragColor=vec4(color,1.);
 #include <colorspace_fragment>
 }`}/></mesh>
}
