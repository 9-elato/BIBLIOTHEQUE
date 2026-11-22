import React,{useRef,useLayoutEffect} from 'react'
import * as THREE from 'three'
import StaticBatch from './StaticBatch'
import {Box as B} from './GroundFloor'
// The same geography is seen from the garden and the walk-out basement:
// north/west coast, east/south woodland, a pond below the eastern slope.
export default function EstateLandscape({time,weather}){
 const trunks=useRef(),crowns=useRef(),rocks=useRef(),night=time==='evening'
 useLayoutEffect(()=>{
  const o=new THREE.Object3D(),color=new THREE.Color()
  for(let i=0;i<64;i++){
   const east=i<42,x=east?30+(i*7.31)%34:-35+(i*5.17)%67,z=east?-3+(i*11.67)%47:43+(i*7.13)%18
   const ground=east?-5:0,height=5+(i%5)*1.3
   o.position.set(x,ground+height/2,z);o.scale.set(.22,height,.22);o.rotation.set(0,0,0);o.updateMatrix();trunks.current.setMatrixAt(i,o.matrix)
   o.position.y=ground+height;o.scale.set(2.3+(i%3)*.4,3.7,2.4);o.updateMatrix();crowns.current.setMatrixAt(i,o.matrix);color.set(weather==='snow'?'#c1cdbb':['#3e6245','#52704b','#294e3b'][i%3]);crowns.current.setColorAt(i,color)
  }
  for(let i=0;i<30;i++){
   const north=i<18;o.position.set(north?-39+i*4.8:-39,-4.8+(i%3)*.3,north?-34:-28+(i-18)*5.8);o.scale.set(3.7,3.1+(i%3),3);o.rotation.set(i*.3,i*.72,0);o.updateMatrix();rocks.current.setMatrixAt(i,o.matrix)
  }
  for(const r of [trunks,crowns,rocks]){r.current.instanceMatrix.needsUpdate=true;r.current.computeBoundingSphere()};crowns.current.instanceColor.needsUpdate=true
 },[weather])
 return <group>
 <instancedMesh ref={trunks} args={[null,null,64]}><cylinderGeometry args={[1,1.3,1,7]}/><meshStandardMaterial color="#5f5039" roughness={1}/></instancedMesh>
 <instancedMesh ref={crowns} args={[null,null,64]}><sphereGeometry args={[1,10,8]}/><meshStandardMaterial roughness={1}/></instancedMesh>
 <instancedMesh ref={rocks} args={[null,null,30]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#797f74" roughness={1}/></instancedMesh>
 <StaticBatch revision={weather}>
 <B p={[16.7,-5.65,11.8]} s={[19,.3,10.3]} c={weather==='snow'?'#d4d9ca':'#66815a'}/>
 <B p={[42,-5.7,22]} s={[46,.5,64]} c={weather==='snow'?'#d4d9ca':'#607950'}/>
 <B p={[0,-.6,49]} s={[74,.5,28]} c={weather==='snow'?'#d4d9ca':'#718661'}/>
 {/* Exposed stone plinth ties the lower forest rooms to the east wing. */}
 <B p={[16.7,-5.7,-.2]} s={[19.1,.7,14.1]} c="#747969"/>
 <B p={[7.0,-2.7,2]} s={[.5,5,9]} c="#82816c"/>
 </StaticBatch>
 <mesh position={[0,-7,-88]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[200,105]}/><meshStandardMaterial color={night?'#224e76':'#1689ca'} metalness={.3} roughness={.22}/></mesh>
 <mesh position={[-83,-7,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[90,130]}/><meshStandardMaterial color={night?'#224e76':'#1689ca'} metalness={.3} roughness={.22}/></mesh>
 <mesh position={[25,-5.38,17]} rotation={[-Math.PI/2,0,0]} scale={[1.5,1,1]}><circleGeometry args={[6,48]}/><meshPhysicalMaterial color={night?'#284a43':'#527f71'} metalness={.45} roughness={.18} clearcoat={1}/></mesh>
 </group>
}
