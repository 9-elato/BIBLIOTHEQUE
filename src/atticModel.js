import * as THREE from 'three'
import {ATTIC_MODEL_SCALE,replaceAtticEndWall,atticArchitecture} from './atticLayout.js'
// GLTFLoader caches shared source materials. Clone once before customizing a mesh,
// including overlapping finish rules such as the daybed frame's wood treatment.
function ownMaterial(object){
 if(!object.userData.atticMaterial){
  object.material=object.material.clone()
  object.userData.atticMaterial=true
 }
}
export function prepareAtticModel(scene,textures){
  const copy=scene.clone(true)
  copy.traverse(object=>{
   if(replaceAtticEndWall(object.name,object.position.z))object.visible=false
   if(/^RAFTER/.test(object.name)&&object.position.x<0&&object.position.z>-.4&&object.position.z<5.8)object.visible=false
   if(/^SKYLIGHT/.test(object.name)||/^ROOF.*left/.test(object.name))object.visible=false
   if(/^(DAYBED|TELESCOPE)/.test(object.name))object.visible=false
   if(/^SKYLIGHT/.test(object.name)&&/mid.mullion/.test(object.name))object.visible=false
   if(/^DAYBED/.test(object.name)&&/pillow|fallen.linen.throw/.test(object.name))object.visible=false
   if(/^CHALKBOARD/.test(object.name)&&/star.dot|constellation.line/.test(object.name))object.visible=false
   if(object.isMesh&&/^CHALKBOARD/.test(object.name)&&/green.slate/.test(object.name)){ownMaterial(object);object.material.color.set('#171a1c');object.userData.atticMaterial=true}
   if(object.name.startsWith('BEANBAG')||/woven.rug/i.test(object.name))object.visible=false
   if(/^(CINEMA|PROJECTOR)/.test(object.name))object.visible=false
   if(object.isMesh&&/DAYBED.*carved.frame/.test(object.name)){
    ownMaterial(object);object.material.color.set('#694b38');object.material.roughness=.85
   }
   if(object.name.startsWith('SKYLIGHT')&&/transparent|highlight/.test(object.name))object.visible=false
   if(object.isMesh){
    const n=object.name;if(/^ROOF/.test(n)&&/slate/.test(n)){ownMaterial(object);object.material.color.set('#f0dfc8');object.material.emissive.set('#785b40');object.material.emissiveIntensity=.12;object.material.map=textures.roof;object.material.bumpMap=textures.roof;object.material.bumpScale=.035;object.material.roughness=.97;object.userData.atticMaterial=true}
    const kind=/FLOOR|beam|carved.frame|walnut|wainscot|trim/.test(n)?'wood':/linen|pillow|throw/.test(n)?'fabric':null
    if(kind){ownMaterial(object);object.material.map=textures[kind];object.material.roughness=.94;object.userData.atticMaterial=true;if(kind==='wood')object.material.color.set(/FLOOR/.test(n)?'#8e7966':'#80644e');else object.material.color.set(/throw/.test(n)?'#927181':'#fff2d9')}
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
  copy.traverse(o=>{if(o.isMesh&&atticArchitecture(o.name))parts.push(o)})
  copy.add(architecture)
  parts.forEach(o=>{if(/rear.glazed/.test(o.name))o.visible=false;architecture.attach(o);if(o.visible){ownMaterial(o);o.material.side=THREE.DoubleSide;o.userData.atticMaterial=true}})
  architecture.scale.y=ATTIC_MODEL_SCALE
  return copy

}
export function disposeAtticModel(model){
 model.traverse(o=>{
  if(o.isMesh&&o.userData.atticMaterial)o.material.dispose()
  if(o.userData.atticGeometry)o.geometry.dispose()
 })
}
