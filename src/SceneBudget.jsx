import {useLayoutEffect,useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {PointLight,Vector3} from 'three'

// Fixed shader light count: source lamps animate normally; six world-space
// slots illuminate the scene without six-face point-light shadow renders.
export default function SceneBudget(){
 const {scene,gl}=useThree()
 const state=useRef({elapsed:1,shadow:1,managed:new Map(),slots:[],selected:[],position:new Vector3()})
 useLayoutEffect(()=>{
  const s=state.current,previous=gl.shadowMap.autoUpdate
  s.slots=Array.from({length:6},()=>{const light=new PointLight(0xffffff,0);light.userData.budgetLight=true;scene.add(light);return light})
  gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true
  return()=>{gl.shadowMap.autoUpdate=previous;for(const [light,visible] of s.managed)light.visible=visible;s.managed.clear();for(const light of s.slots){scene.remove(light);light.dispose()}s.slots=[]}
 },[scene,gl])
 useFrame(({camera},dt)=>{
  const s=state.current;s.elapsed+=dt;s.shadow+=dt
  if(s.shadow>=.125){gl.shadowMap.needsUpdate=true;s.shadow=0}
  if(s.elapsed>=.2){
   s.elapsed=0
   for(const [light,visible] of s.managed)light.visible=visible
   s.managed.clear()
   const candidates=[]
   function visit(node){
    if(!node.visible||node.userData.budgetLight)return
    if(node.isPointLight){
     s.managed.set(node,node.visible);node.getWorldPosition(s.position)
     const distance=s.position.distanceTo(camera.position)
     if(node.intensity>0)candidates.push({light:node,score:node.intensity/(4+distance*distance)})
     node.visible=false
    }
    for(const child of node.children)visit(child)
   }
   visit(scene);candidates.sort((a,b)=>b.score-a.score);s.selected=candidates.slice(0,6).map(c=>c.light)
  }
  s.slots.forEach((slot,i)=>{const source=s.selected[i];slot.intensity=source?.intensity||0;if(source){source.getWorldPosition(slot.position);slot.color.copy(source.color);slot.distance=source.distance;slot.decay=source.decay;slot.updateMatrixWorld()}})
 },-.5)
 return null
}
