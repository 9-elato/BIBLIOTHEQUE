import {Box3,MathUtils,Vector3} from 'three'
// Measured from fox_librarian.glb at its 1.7m display height and 1.25 depth scale.
export const FOX_MATCH={height:1.7,depth:2.2186747845*1.7/3.8635792658*1.25,eye:[.272*1.7/3.8635792658,.36*1.7/3.8635792658,.222*1.7/3.8635792658*1.25],eyeColor:[.006048833,.005605392,.005181517]}
export function prepareLabrador(scene){
 const copy=scene.clone(true),bounds=new Box3().setFromObject(copy),scale=1.7/(bounds.max.y-bounds.min.y)
 const depthScale=FOX_MATCH.depth/(bounds.max.z-bounds.min.z)
 copy.updateMatrixWorld(true)
 for(const name of ['LabradorEyeL','LabradorEyeR']){
  const eye=copy.getObjectByName(name)
  if(!eye?.isMesh)continue
  // Bake the eye's local transform temporarily so dimensions refer to world
  // axes even though Blender exports the mesh with a rotated coordinate frame.
  const g=eye.geometry.clone().applyMatrix4(eye.matrixWorld),box=new Box3().setFromBufferAttribute(g.attributes.position),center=box.getCenter(new Vector3()),size=box.getSize(new Vector3())
  g.translate(-center.x,-center.y,-center.z)
  g.scale(FOX_MATCH.eye[0]/scale/size.x,FOX_MATCH.eye[1]/scale/size.y,FOX_MATCH.eye[2]/depthScale/size.z)
  g.translate(center.x,center.y,center.z);g.applyMatrix4(eye.matrixWorld.clone().invert());g.computeBoundingBox();g.computeBoundingSphere()
  eye.geometry=g;eye.material=eye.material.clone();eye.material.color.fromArray(FOX_MATCH.eyeColor);eye.material.roughness=.22
 }
 copy.scale.set(scale,scale,depthScale);copy.position.y=-bounds.min.y*scale
 const parts={}
 for(const name of ['LegL','LegR','ArmL','ArmR','Tail','Football']){
  const node=copy.getObjectByName('Labrador'+name)
  if(node)parts[name]={node,position:node.position.clone(),rotation:node.rotation.clone()}
 }
 copy.traverse(o=>{if(o.isMesh)o.castShadow=true})
 return {copy,scale,parts,read:0}
}
export function animateLabrador(model,t,dt,moving,reading,sit){
 const a=MathUtils.clamp(sit||0,0,1),walk=moving?(1-a):0
 model.read=MathUtils.damp(model.read,reading?1:0,7,Math.min(dt,.1))
 model.copy.scale.y=MathUtils.damp(model.copy.scale.y,model.scale*(1-.16*a),8,Math.min(dt,.1))
 for(const [name,{node,position,rotation}] of Object.entries(model.parts)){
  node.position.copy(position);node.rotation.copy(rotation)
  const sign=name.endsWith('L')?1:-1
  if(name.startsWith('Leg')){
   node.rotation.x+=Math.sin(t*9)*.38*walk*sign-.65*a
   node.position.z+=.20*a;node.position.y+=Math.max(0,Math.cos(t*9)*sign)*.07*walk
  }
  if(name.startsWith('Arm'))node.rotation.x+=Math.sin(t*9)*.08*walk*sign-.42*model.read
  if(name==='Tail'){node.rotation.y+=Math.sin(t*2.6)*.14*(1-.7*a);node.rotation.x+=.15*a}
  if(name==='Football'){node.visible=!reading;node.position.y+=Math.sin(t*9)*.025*walk}
 }
}
