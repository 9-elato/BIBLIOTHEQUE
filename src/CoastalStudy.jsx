import {paintOcean} from './oceanLandscape'
import {useFrame} from '@react-three/fiber'
import React,{useMemo,useEffect,useRef} from 'react'
import * as THREE from 'three'
import {CarvedBox as B} from './StorybookDecor'
function OceanGlints({w,h,time,weather}){
 const material=useRef()
 const positions=useMemo(()=>new Float32Array(Array.from({length:96},(_,i)=>[(i*1.618%1-.5)*w,-(.04+(i*.371%1)*.44)*h,.025]).flat()),[w,h])
 const uniforms=useMemo(()=>({clock:{value:0},strength:{value:1}}),[])
 useFrame(({clock})=>{if(material.current){material.current.uniforms.clock.value=clock.elapsedTime;material.current.uniforms.strength.value=weather==='sunny'?(time==='afternoon'?.85:.25):.08}})
 return <points userData={{noBatch:true}}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false}
 vertexShader={`uniform float clock; varying float glow; void main(){glow=pow(max(0.0,sin(clock*1.6+position.x*13.0+position.y*27.0)),8.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=2.0+glow*3.0;}`}
 fragmentShader={`uniform float strength; varying float glow; void main(){vec2 p=gl_PointCoord-.5;float a=max(0.0,1.0-length(p)*2.0);gl_FragColor=vec4(.92,.98,1.0,a*glow*strength);}`}/></points>
}
export function OceanWindow({p,turn=0,w,h=5.2,time,weather}){
 const map=useMemo(()=>paintOcean(time,weather),[time,weather])
 useEffect(()=>()=>map.dispose(),[map])
 return <group position={p} rotation={[0,turn,0]} userData={{noBatch:true}}><OceanGlints w={w} h={h} time={time} weather={weather}/><mesh><planeGeometry args={[w,h]}/><meshBasicMaterial map={map} toneMapped={false} fog={false}/></mesh>{[-1,1].map(a=><group key={a}><B p={[a*w/2,0,.055]} s={[.12,h+.2,.16]} c="#3d332c"/><B p={[0,a*h/2,.055]} s={[w,.12,.16]} c="#3d332c"/></group>)}<mesh position={[0,0,.07]}><planeGeometry args={[w-.05,h-.05]}/><meshStandardMaterial color="#b7d6db" transparent opacity={.035} roughness={.15} metalness={.15} depthWrite={false}/></mesh></group>
}
export default function CoastalStudy({time,weather,onMusic}){return <group>
 <OceanWindow p={[0,4.10,-29.30]} w={13.7} time={time} weather={weather}/>
 <OceanWindow p={[-6.91,4.10,-25.28]} turn={Math.PI/2} w={8.02} time={time} weather={weather}/>
 <B p={[0,.91,-28.75]} s={[13.7,.18,.9]} c="#715039"/>
 <B p={[-6.45,.91,-24.80]} s={[.92,.18,7.9]} c="#715039"/>
 {[-5.7,-3.9,3.9,5.7].map(x=><group key={x}><B p={[x,.43,-28.75]} s={[1.3,.86,.8]} c="#493429"/>{[.25,.55,.8].map(y=><B key={y} p={[x,y,-28.31]} s={[.22,.025,.03]} c="#b2935d"/>)}</group>)}
 {[-27.5,-24.7,-21.5].map(z=><B key={z} p={[-6.45,.43,z]} s={[.8,.86,.7]} c="#4c382b"/>)}
 <group position={[6.53,0,-25.9]} rotation={[0,-Math.PI/2,0]} scale={[1.5,1,1]}>
  <B p={[0,.56,0]} s={[4.1,1.12,.85]} c="#3e3027"/><B p={[0,1.17,0]} s={[4.25,.13,.95]} c="#8b6746"/>
  {Array.from({length:38},(_,i)=><B key={i} p={[-1.9+i*.067,.57,.44]} s={[.035,.76,.045]} c={['#aa8a66','#716e65','#52665e','#8f5b56'][i%4]}/>)}
  {[1.9,3.05].map((y,row)=><group key={y}><B p={[0,y,-.08]} s={[4.3,.10,.46]} c="#876244"/><B p={[0,y+.065,.14]} s={[4.1,.02,.025]} c="#f0ca85"/><mesh position={[0,y+.05,.17]}><boxGeometry args={[4.12,.015,.02]}/><meshBasicMaterial color="#ffd99a"/></mesh>{[0,1,2,3,4].map(i=><group key={i} position={[-1.65+i*.82,y+.60,.02]} scale={[1,1.5,1]} userData={{noBatch:true}} onClick={e=>{e.stopPropagation();onMusic(row*5+i)}}><B s={[.73,.74,.055]} c={['#314b53','#ad9973','#814f49','#5f6b51','#383849'][(i+row)%5]}/><mesh position={[0,0,.035]}><ringGeometry args={[.10,.23,24]}/><meshStandardMaterial color={row%2?'#c3a973':'#d9c7a1'} roughness={.9}/></mesh><B p={[0,-.27,.04]} s={[.46,.018,.01]} c="#ddd0af"/></group>)}</group>)}
  {[-1,1].map(a=><group key={a} position={[a*2.1,0,0]}><B p={[0,.73,0]} s={[.55,1.46,.60]} c="#282d2c"/>{[.42,.94].map(y=><mesh key={y} position={[0,y,.31]}><circleGeometry args={[.19,28]}/><meshStandardMaterial color="#151b1e" metalness={.25} roughness={.5}/></mesh>)}</group>)}
 </group>
 </group>}
