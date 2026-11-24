import React from 'react'
import {GROUND_BACKING,SEABED_BACKING} from './terrainContinuityLayout.js'
import {natureMood} from './natureMood'
export default function TerrainContinuity({time,weather}){
 const mood=natureMood(time,weather)
 return <group>
  {GROUND_BACKING.map(([l,r,b,f],i)=><mesh key={i} position={[(l+r)/2,-.16,(b+f)/2]} receiveShadow>
   <boxGeometry args={[r-l,.08,f-b]}/><meshStandardMaterial color={weather==='snow'?'#d9e0d4':'#719951'} roughness={1}/>
  </mesh>)}
  {/* Low-cost continuous water below the detailed coastal wave meshes. */}
  <mesh position={SEABED_BACKING.position} rotation={[-Math.PI/2,0,0]}>
   <planeGeometry args={SEABED_BACKING.size}/><meshStandardMaterial color={mood.sea} roughness={.34} metalness={.18}/>
  </mesh>
 </group>
}
