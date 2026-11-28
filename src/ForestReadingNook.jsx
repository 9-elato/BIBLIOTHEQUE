import ForestVista from './ForestVista'
import React,{Suspense,useMemo} from 'react'
import {useLibraryModel} from './useLibraryModel'
import {Box as B} from './GroundFloor'
import {CarvedBox, WovenRug,AntiqueLamp,Folios} from './StorybookDecor'
import StaticBatch from './StaticBatch'
export function ForestWindow({x,z=5.62,width,height=6.8,y=4.25,time,weather}){
 return <group position={[x,y,z]} rotation={[0,Math.PI,0]} userData={{noBatch:true}}>
  <ForestVista width={width} height={height} time={time} weather={weather}/>
  {[-.5,0,.5].map(a=><B key={a} p={[a*width,0,.05]} s={[.10,height+.15,.15]} c="#735739"/>)}
  {[-.5,.5].map(a=><B key={a} p={[0,a*height,.05]} s={[width,.14,.15]} c="#806343"/>)}
  <mesh position={[0,0,.025]}><planeGeometry args={[width,height]}/><meshStandardMaterial transparent opacity={.035} color="#e2f1de" roughness={.16} metalness={.25} depthWrite={false}/></mesh>
 </group>
}
export default function ForestReadingNook({time,weather}){return <group>
 <ForestWindow x={10.6} width={5.6} height={7.4} y={4.25} time={time} weather={weather}/>
 <Suspense fallback={null}><ReadingNookModel/></Suspense>
 <StaticBatch revision={time}>
 <WovenRug p={[11,.03,2.85]} size={[5.1,4.1]} color="#d4c8ad"/>
 <Folios p={[9.9,.59,1.85]}/>
 <AntiqueLamp p={[8.15,0,4.55]} time={time} scale={2}/>
 </StaticBatch>
 </group>}

function ReadingNookModel(){
 const {scene}=useLibraryModel(`${import.meta.env.BASE_URL}models/reading_nook.glb`)
 const model=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return copy},[scene])
 return <primitive object={model}/>
}
