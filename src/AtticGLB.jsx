import AtticSky,{PanoramicRoofFrame} from './AtticSky'
import AtticCosmos from './AtticCosmos'
import AtticTextiles from './AtticTextiles'
import {makeAtticTexture,makeRoofPlanks,makeChalkboard} from './atticTextures'
import * as THREE from 'three'
import {WindowLandscape} from './WindowLandscape'
import React,{useMemo,useEffect} from 'react'
import {useLibraryModel} from './useLibraryModel'
import {AtticDetails} from './RoomDetails'
import {ATTIC_ORIGIN} from './navigation'

const modelUrl=`${import.meta.env.BASE_URL}models/starlight_attic.glb`
export default function AtticGLB({time,weather,event}){
 const {scene}=useLibraryModel(modelUrl)
 const textures=useMemo(()=>({wood:makeAtticTexture('wood'),fabric:makeAtticTexture('fabric'),wallpaper:makeAtticTexture('wallpaper'),roof:makeRoofPlanks(),chalk:makeChalkboard()}),[])
 useEffect(()=>()=>Object.values(textures).forEach(t=>t.dispose()),[textures])
 const model=useMemo(()=>{
  const copy=scene.clone(true)
  copy.traverse(object=>{
   if(/^SKYLIGHT/.test(object.name)||/^ROOF.*left/.test(object.name)||/^RAFTER.*side.-1.(0\.3|3\.4)/.test(object.name))object.visible=false
   if(/^(DAYBED|TELESCOPE)/.test(object.name))object.visible=false
   if(/^SKYLIGHT/.test(object.name)&&/mid.mullion/.test(object.name))object.visible=false
   if(/^DAYBED/.test(object.name)&&/pillow|fallen.linen.throw/.test(object.name))object.visible=false
   if(/^CHALKBOARD/.test(object.name)&&/star.dot|constellation.line/.test(object.name))object.visible=false
   if(object.isMesh&&/^CHALKBOARD/.test(object.name)&&/green.slate/.test(object.name)){object.material=object.material.clone();object.material.color.set('#171a1c');object.userData.atticMaterial=true}
   if(object.name.startsWith('BEANBAG')||/woven.rug/i.test(object.name))object.visible=false
   if(/^(CINEMA|PROJECTOR)/.test(object.name))object.visible=false
   if(object.isMesh&&/DAYBED.*carved.frame/.test(object.name)){
    object.material=object.material.clone();object.material.color.set('#694b38');object.material.roughness=.85
   }
   if(object.name.startsWith('SKYLIGHT')&&/transparent|highlight/.test(object.name))object.visible=false
   if(object.isMesh){
    const n=object.name;if(/^ROOF/.test(n)&&/slate/.test(n)){object.material=object.material.clone();object.material.color.set('#f0dfc8');object.material.emissive.set('#785b40');object.material.emissiveIntensity=.12;object.material.map=textures.roof;object.material.bumpMap=textures.roof;object.material.bumpScale=.035;object.material.roughness=.97;object.userData.atticMaterial=true}
    const kind=/FLOOR|beam|carved.frame|walnut|wainscot|trim/.test(n)?'wood':/linen|pillow|throw/.test(n)?'fabric':null
    if(kind){object.material=object.material.clone();object.material.map=textures[kind];object.material.roughness=.94;object.userData.atticMaterial=true;if(kind==='wood')object.material.color.set(/FLOOR/.test(n)?'#8e7966':'#80644e');else object.material.color.set(/throw/.test(n)?'#927181':'#fff2d9')}
   }
   if(object.isMesh&&object.userData.atticMaterial&&object.material.map&&!object.geometry.attributes.uv){
    object.geometry=object.geometry.clone();object.userData.atticGeometry=true
    const p=object.geometry.attributes.position,n=object.geometry.attributes.normal,uv=[]
    for(let i=0;i<p.count;i++){
     if(/^ROOF/.test(object.name))uv.push(p.getX(i)*.25,p.getZ(i)*.13)
     else if(Math.abs(n.getY(i))>.5)uv.push(p.getX(i)*.4,p.getZ(i)*.4)
     else if(Math.abs(n.getX(i))>.5)uv.push(p.getZ(i)*.4,p.getY(i)*.4)
     else uv.push(p.getX(i)*.4,p.getY(i)*.4)
    }
    object.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2))
   }
   // Replace the solid east wall and its trim with a doorway at the stair landing.
   if(object.name.startsWith('WALL')&&object.position.x>3.9&&
      /plaster.long.side|panel.*trim|vertical.wainscot/.test(object.name))object.visible=false
  })
  const architecture=new THREE.Group(),parts=[]
  copy.updateMatrixWorld(true)
  copy.traverse(o=>{if(o.isMesh&&/^(ROOF|WALL|WINDOW|SKYLIGHT)/.test(o.name))parts.push(o)})
  copy.add(architecture)
  parts.forEach(o=>{if(/rear.glazed/.test(o.name))o.visible=false;architecture.attach(o);if(o.visible){if(!o.userData.atticMaterial)o.material=o.material.clone();o.material.side=THREE.DoubleSide;o.userData.atticMaterial=true}})
  architecture.scale.y=1.2
  return copy
 },[scene,textures])
 useEffect(()=>()=>model.traverse(o=>{if(o.isMesh&&(o.userData.atticMaterial||/DAYBED.*carved.frame/.test(o.name)))o.material.dispose();if(o.userData.atticGeometry)o.geometry.dispose()}),[model])
 const rearGable=useMemo(()=>{
  const s=new THREE.Shape();s.moveTo(-4.36,0);s.lineTo(4.36,0);s.lineTo(4.36,4.26);s.lineTo(0,7.62);s.lineTo(-4.36,4.26);s.closePath()
  const hole=new THREE.Path();hole.moveTo(-1.93,2.03);hole.lineTo(1.93,2.03);hole.lineTo(1.93,3.28);hole.absarc(0,3.28,1.93,0,Math.PI,false);hole.closePath();s.holes.push(hole)
  return new THREE.ShapeGeometry(s)
 },[])
 useEffect(()=>()=>rearGable.dispose(),[rearGable])
 const panel=(p,s,color='#dfd2bd')=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.85}/></mesh>
 return <group><AtticDetails time={time}/><group position={ATTIC_ORIGIN}>
  <primitive object={model}/><mesh position={[0,0,6.59]} geometry={rearGable}><meshStandardMaterial color="#dfd2bd" roughness={.95} side={THREE.DoubleSide}/></mesh><AtticTextiles fabric={textures.fabric}/><mesh position={[-3.67,2.8,-3.7]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[2.87,2.09]}/><meshStandardMaterial map={textures.chalk} roughness={1}/></mesh><AtticSky time={time} weather={weather}/><PanoramicRoofFrame map={textures.roof}/><AtticCosmos time={time} textures={textures}/><group position={[0,3.62,6.56]} rotation={[0,Math.PI,0]}><WindowLandscape width={3.86} height={3.18} time={time} weather={weather} event={event}/></group>
  {panel([4.16,2.15,-.92],[.19,4.3,11.44])}
  {panel([4.16,2.15,6.56],[.19,4.3,.16])}
  {panel([4.16,3.48,5.64],[.19,1.64,1.68])}
  {[4.8,6.48].map(z=><group key={z}>{panel([4.02,1.35,z],[.22,2.7,.14],'#795337')}</group>)}
  {panel([4.02,2.72,5.64],[.22,.18,1.82],'#aa8251')}
  {panel([4.02,.14,-.92],[.12,.24,11.44],'#795337')}
 </group></group>
}
