import React from 'react'
import {Box as B} from './GroundFloor'
export default function InteractiveProps({onOpen}){
 return <group position={[-13.4,.45,.15]} onClick={e=>{e.stopPropagation();onOpen('board')}}>
  <B p={[0,0,0]} s={[.74,.05,.60]} c="#b69b65"/>
  {Array.from({length:9},(_,i)=><B key={i} p={[(i%3-1)*.22,.03,(Math.floor(i/3)-1)*.18]} s={[.2,.016,.16]} c={i%2?'#71523a':'#d1ba8e'}/>)}
 </group>
}
