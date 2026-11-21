import {Box3,MathUtils} from 'three'
export function prepareLabrador(scene){
 const copy=scene.clone(true),bounds=new Box3().setFromObject(copy),scale=1.7/(bounds.max.y-bounds.min.y)
 copy.scale.setScalar(scale);copy.position.y=-bounds.min.y*scale
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
