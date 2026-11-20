import {useEffect,useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {Vector3} from 'three'

// Lamp meshes stay visible. Only the most relevant point lights enter shaders.
// Otherwise every fragment in every room evaluates dozens of remote lights.
export default function SceneBudget(){
 const {scene,gl}=useThree()
 const state=useRef({elapsed:1,shadow:1,managed:new Set(),position:new Vector3()})
 useEffect(()=>{const previous=gl.shadowMap.autoUpdate;gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true;return()=>{gl.shadowMap.autoUpdate=previous;for(const light of state.current.managed)light.visible=true}},[gl])
 useFrame(({camera},dt)=>{
  const s=state.current;s.elapsed+=dt;s.shadow+=dt
  if(s.shadow>=.125){gl.shadowMap.needsUpdate=true;s.shadow=0}
  if(s.elapsed<.2)return
  s.elapsed=0
  for(const light of s.managed)light.visible=true
  s.managed.clear()
  const candidates=[]
  function visit(node){
   if(!node.visible&&!node.isPointLight)return
   if(node.isPointLight){
    s.managed.add(node)
    node.getWorldPosition(s.position)
    const distance=s.position.distanceTo(camera.position)
    if(node.intensity>0)candidates.push({light:node,score:node.intensity/(4+distance*distance)})
   }
   for(const child of node.children)visit(child)
  }
  visit(scene)
  candidates.sort((a,b)=>b.score-a.score)
  const enabled=new Set(candidates.slice(0,6).map(c=>c.light))
  for(const light of s.managed)light.visible=enabled.has(light)
 },-.5)
 return null
}
