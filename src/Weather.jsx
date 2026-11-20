import React,{useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
export default function Weather({weather}){
 const ref=useRef(),snow=weather==='snow'
 const data=useMemo(()=>Float32Array.from({length:900},(_,i)=>{const n=(Math.sin(i*127.1+31)*43758.5453)%1;return i%3===0?n*13:i%3===1?Math.abs(n)*14:13+Math.abs(n)*20}),[])
 useFrame((_,dt)=>{if(!ref.current||weather==='sunny')return;const a=ref.current.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-Math.min(dt,.1)*(snow?1.3:12);if(y<.1)y=14;a.setY(i,y)}a.needsUpdate=true})
 if(weather==='sunny')return null
 return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data,3]}/></bufferGeometry><pointsMaterial key={weather} onBeforeCompile={shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nvec2 drop = gl_PointCoord - 0.5;\n'+(snow?'if(length(drop) > 0.48) discard;':'if(abs(drop.x) > 0.10 || abs(drop.y) > 0.48) discard;'))}} color={snow?'#f6f8ff':'#a7c4d3'} size={snow?.10:.19} transparent opacity={snow?.85:.6} depthWrite={false}/></points>
}
