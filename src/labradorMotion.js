import {Box3,MathUtils,Vector3} from 'three'
// Measured from fox_librarian.glb at its 1.7m display height and 1.25 depth scale.
export const FOX_MATCH={height:1.7,depth:2.2186747845*1.7/3.8635792658*1.25,eye:[.272*1.7/3.8635792658,.36*1.7/3.8635792658,.222*1.7/3.8635792658*1.25],eyeColor:[.006048833,.005605392,.005181517]}
const palette={
 'Fur / warm cream':['#DFC29C',.2995],
 'Fur / folded ear':['#D2B38D',.55126],
 'Uniform / red fabric':['#F21C33',.03684],
 'Uniform / white details':['#FFF0E9',.89104],
 'Scarf / red knit':['#ED1930',.04308],
 'Scarf / cream knit':['#FFF2E9',.74493],
 'Cap / red fabric':['#F22237',.02956],
}
function recolorMaterial(source,[color,bakedLuminance]){
 const material=source.clone()
 material.color.set(color)
 // The GLB stores the old colors in its textile maps. Retain their luminance
 // variation, while using the new palette as the base color.
 material.onBeforeCompile=shader=>{
  shader.uniforms.bakedLuminance={value:bakedLuminance}
  shader.fragmentShader=shader.fragmentShader
   .replace('#include <common>','#include <common>\nuniform float bakedLuminance;')
   .replace('#include <map_fragment>',`
    #ifdef USE_MAP
     vec4 texel=texture2D(map,vMapUv);
     float variation=dot(texel.rgb,vec3(0.2126,0.7152,0.0722))/bakedLuminance;
     diffuseColor*=vec4(vec3(clamp(variation,0.73,1.22)),texel.a);
    #endif`)
 }
 material.customProgramCacheKey=()=>'labrador-palette'
 return material
}
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
 const materials=new Map()
 copy.traverse(o=>{
  if(!o.isMesh)return
  o.castShadow=true
  const swatch=palette[o.material?.name]
  if(!swatch)return
  if(!materials.has(o.material))materials.set(o.material,recolorMaterial(o.material,swatch))
  o.material=materials.get(o.material)
 })
 return {copy,scale,parts,read:0,materials}
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
