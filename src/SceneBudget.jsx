import {useLayoutEffect,useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {PointLight,Vector3} from 'three'

// Fixed shader light count: source lamps animate normally; six world-space
// slots illuminate the scene without six-face point-light shadow renders.
export default function SceneBudget(){
 const {scene,gl,setDpr}=useThree()
 const state=useRef({elapsed:1,shadow:1,managed:new Map(),slots:[],selected:[],position:new Vector3()})
 const resolution=useRef({elapsed:0,frames:0,fastWindows:0,dpr:1})
 useLayoutEffect(()=>{
  const s=state.current,previous=gl.shadowMap.autoUpdate
  s.slots=Array.from({length:6},()=>{const light=new PointLight(0xffffff,0);light.userData.budgetLight=true;scene.add(light);return light})
  gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true
  return()=>{gl.shadowMap.autoUpdate=previous;for(const [light,visible] of s.managed)light.visible=visible;s.managed.clear();for(const light of s.slots){scene.remove(light);light.dispose()}s.slots=[]}
 },[scene,gl])
 useFrame(({camera},dt)=>{
  const quality=resolution.current
  // Ignore tab switches and demand-render gaps when estimating steady frame time.
  if(dt>0&&dt<.2){
   quality.elapsed+=dt
   quality.frames++
   if(quality.elapsed>=1.2){
    const fps=quality.frames/quality.elapsed
    quality.fastWindows=fps>55?quality.fastWindows+1:0
    const next=fps<42?Math.max(.65,quality.dpr-.1):quality.fastWindows>=3?Math.min(1,quality.dpr+.1):quality.dpr
    if(next!==quality.dpr){quality.dpr=next;quality.fastWindows=0;setDpr(next)}
    quality.elapsed=0;quality.frames=0
   }
  }
  const s=state.current;s.elapsed+=dt;s.shadow+=dt
  if(s.shadow>=(quality.dpr<.9?.25:.125)){gl.shadowMap.needsUpdate=true;s.shadow=0}
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
