import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {BASEMENT_HEIGHT as H} from './basementLayout'
import {ambientUpdateDue} from './ambientUpdates'
export default function SpringFireflies({time}){
 const ref=useRef(),last=useRef(null),positions=useMemo(()=>new Float32Array(36*3),[])
 const uniforms=useMemo(()=>({clock:{value:0},strength:{value:1}}),[])
 useFrame(({clock})=>{
  if(!ref.current)return
  if(!ambientUpdateDue(ref.current,clock.elapsedTime,last.current))return
  last.current=clock.elapsedTime
  const t=clock.elapsedTime;uniforms.clock.value=t;uniforms.strength.value=time==='evening'?.72:.22
  const p=ref.current.geometry.attributes.position
  for(let i=0;i<36;i++){const a=i*2.399;p.setXYZ(i,22.1+Math.cos(a)*(2.5+i%3*.22)+Math.sin(t*.27+i)*.13,H+.55+(i%6)*.23+Math.sin(t*.35+i)*.12,5+Math.sin(a)*3.6)}
  p.needsUpdate=true
 })
 return <points ref={ref} frustumCulled={false} userData={{noCameraCollision:true,noBatch:true}}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><shaderMaterial uniforms={uniforms} transparent depthWrite={false} toneMapped={false} vertexShader="uniform float clock;varying float pulse;void main(){pulse=.35+.65*pow(.5+.5*sin(clock*.85+position.x*2.4+position.z*1.7),2.);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(38./max(1.,-p.z),2.,8.);}" fragmentShader="uniform float strength;varying float pulse;void main(){float r=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(.1,1.,r))*pulse*strength;if(a<.01)discard;gl_FragColor=vec4(1.,.86,.43,a);}"/></points>
}
