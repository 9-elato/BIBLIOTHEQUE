import ForestTrees,{estateTrees} from './ForestTrees'
import Meadow from './Meadow'
import SeaWater from './SeaWater'
import {natureMood} from './natureMood'
import React,{useRef,useLayoutEffect,useMemo} from 'react'
import * as THREE from 'three'
import StaticBatch from './StaticBatch'
import {Box as B} from './GroundFloor'
// The same geography is seen from the garden and the walk-out basement:
// north/west coast, east/south woodland, a pond below the eastern slope.
export default function EstateLandscape({time,weather}){
 const trees=useMemo(estateTrees,[]),rocks=useRef(),hills=useRef(),m= natureMood(time,weather),night=m.evening
 useLayoutEffect(()=>{
  const o=new THREE.Object3D()
  for(let i=0;i<30;i++){
   const north=i<18;o.position.set(north?-39+i*4.8:-39,-4.8+(i%3)*.3,north?-34:-28+(i-18)*5.8);o.scale.set(3.7,3.1+(i%3),3);o.rotation.set(i*.3,i*.72,0);o.updateMatrix();rocks.current.setMatrixAt(i,o.matrix)
  }
  for(let i=0;i<6;i++){o.position.set(70+i*8,-7,8+i*13);o.scale.set(20,16+(i%3)*6,25);o.rotation.set(0,i*.7,0);o.updateMatrix();hills.current.setMatrixAt(i,o.matrix)}
  for(const r of [rocks,hills]){r.current.instanceMatrix.needsUpdate=true;r.current.computeBoundingSphere()}
 },[weather,time])
 return <group><Meadow time={time} weather={weather}/>
 <ForestTrees positions={trees} weather={weather}/>
 <instancedMesh ref={hills} castShadow receiveShadow args={[null,null,6]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color={m.far} roughness={1}/></instancedMesh>
 <instancedMesh ref={rocks} castShadow receiveShadow args={[null,null,30]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#797f74" roughness={1}/></instancedMesh>
 <StaticBatch revision={weather}>
 <B p={[16.7,-5.65,11.8]} s={[19,.3,10.3]} c={weather==='snow'?'#d4d9ca':'#66815a'}/>
 <B p={[20,-5.68,31]} s={[29,.36,34]} c={weather==='snow'?'#d4d9ca':'#577550'}/>
 <B p={[42,-5.7,22]} s={[46,.5,64]} c={weather==='snow'?'#d4d9ca':'#607950'}/>
 <B p={[0,-.6,49]} s={[74,.5,28]} c={weather==='snow'?'#d4d9ca':'#718661'}/>
 {/* Exposed stone plinth ties the lower forest rooms to the east wing. */}
 <B p={[16.7,-5.7,-.2]} s={[19.1,.7,14.1]} c="#747969"/>
 <B p={[7.0,-2.7,2]} s={[.5,5,9]} c="#82816c"/>
 </StaticBatch>
 <SeaWater position={[0,-7,-88]} size={[200,105]} time={time} weather={weather}/>
 <SeaWater position={[-83,-7,0]} size={[90,130]} time={time} weather={weather}/>
 <mesh position={[25,-5.38,17]} rotation={[-Math.PI/2,0,0]} scale={[1.5,1,1]}><circleGeometry args={[6,48]}/><meshPhysicalMaterial color={night?'#284a43':'#527f71'} metalness={.45} roughness={.18} clearcoat={1}/></mesh>
 </group>
}
