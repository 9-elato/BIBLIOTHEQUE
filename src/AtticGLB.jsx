import AtticTerracePortal from './AtticTerracePortal'
import {ATTIC_SHELL_SCALE} from './atticLayout'
import {prepareAtticModel,disposeAtticModel} from './atticModel'
import AtticTerraceCinema from './AtticTerraceCinema'
import AtticSky,{PanoramicRoofFrame} from './AtticSky'
import AtticCosmos from './AtticCosmos'
import AtticTextiles from './AtticTextiles'
import {makeAtticTexture,makeRoofPlanks,makeChalkboard} from './atticTextures'
import React,{useMemo,useEffect} from 'react'
import {useLibraryModel} from './useLibraryModel'
import {AtticDetails} from './RoomDetails'
import {ATTIC_ORIGIN} from './navigation'

const modelUrl=`${import.meta.env.BASE_URL}models/starlight_attic.glb`
export default function AtticGLB({time,weather}){
 const {scene}=useLibraryModel(modelUrl)
 const textures=useMemo(()=>({wood:makeAtticTexture('wood'),fabric:makeAtticTexture('fabric'),wallpaper:makeAtticTexture('wallpaper'),roof:makeRoofPlanks(),chalk:makeChalkboard()}),[])
 useEffect(()=>()=>Object.values(textures).forEach(t=>t.dispose()),[textures])
 const model=useMemo(()=>prepareAtticModel(scene,textures),[scene,textures])
 useEffect(()=>()=>disposeAtticModel(model),[model])
 const panel=(p,s,color='#dfd2bd')=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.85}/></mesh>
 return <group><AtticDetails time={time}/><group position={ATTIC_ORIGIN}>
  <AtticTerracePortal/><AtticTerraceCinema time={time} weather={weather}/><primitive object={model}/><AtticTextiles fabric={textures.fabric}/><mesh position={[-3.67,2.8,-3.7]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[2.87,2.09]}/><meshStandardMaterial map={textures.chalk} roughness={1}/></mesh><group scale={[1,ATTIC_SHELL_SCALE,1]}><AtticSky time={time} weather={weather}/><PanoramicRoofFrame map={textures.roof}/></group><AtticCosmos time={time} textures={textures}/>
  <group scale={[1,ATTIC_SHELL_SCALE,1]}>
  {panel([4.16,2.15,-.92],[.19,4.3,11.44])}
  {panel([4.16,2.15,6.56],[.19,4.3,.16])}
  {panel([4.16,3.48,5.64],[.19,1.64,1.68])}
  {[4.8,6.48].map(z=><group key={z}>{panel([4.02,1.35,z],[.22,2.7,.14],'#795337')}</group>)}
  {panel([4.02,2.72,5.64],[.22,.18,1.82],'#aa8251')}
  {panel([4.02,.14,-.92],[.12,.24,11.44],'#795337')}
 </group></group></group>
}
