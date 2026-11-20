import React from 'react'
import {Box as B} from './GroundFloor'
import {GAME_SPOTS} from './miniGames'
export default function InteractiveProps({onOpen,secretOpen}){
 return <group><group position={[-13.4,.45,.15]} onClick={e=>{e.stopPropagation();onOpen('board')}}>
  <B p={[0,0,0]} s={[.74,.05,.60]} c="#b69b65"/>
  {Array.from({length:9},(_,i)=><B key={i} p={[(i%3-1)*.22,.03,(Math.floor(i/3)-1)*.18]} s={[.2,.016,.16]} c={i%2?'#71523a':'#d1ba8e'}/>)}
 </group>{GAME_SPOTS.filter(g=>g.id!=='cipher'||secretOpen).map(g=><group key={g.id} position={[g.x,g.y,g.z]} onClick={e=>{e.stopPropagation();onOpen(g.id)}}>
 <B p={[0,0,0]} s={[.62,.05,.4]} c="#6b4935"/>
 {[0,1,2,3,4].map(i=><B key={i} p={[(i-2)*.11,.055,0]} s={[.085,g.id==='shelves'?.23:.025,.3]} c={['#9cae8d','#bfa674','#7e555d','#738493','#c9bca1'][i]}/>)}
 </group>)}</group>
}
