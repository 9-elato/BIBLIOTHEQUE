import {Box3,MathUtils} from 'three'
const palette={
 'Fur / warm cream':['#F6D6AD',.2995],
 'Fur / folded ear':['#EBC397',.55126],
 'Uniform / red fabric':['#D70C20',.03684],
 'Uniform / white details':['#FFF0E9',.89104],
 'Scarf / red knit':['#CA0D21',.04308],
 'Scarf / cream knit':['#FFF2E9',.74493],
 'Cap / red fabric':['#D91023',.02956],
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
 copy.scale.setScalar(scale);copy.position.y=-bounds.min.y*scale
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
