import {nextVegetationPoll} from './vegetationSchedule.js'
import useGraphicsQuality from './useGraphicsQuality'
import React,{useMemo,useLayoutEffect,useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {seeded,windStrength,windEnvelope,windMaterial,grassDensity} from './vegetationWind'
const flat=()=>0
function Tile({x,z,height,exclude,assets,snow,quality}){
 const ref=useRef(),last=useRef(-1),center=useMemo(()=>new THREE.Vector3(),[]),max=960
 useLayoutEffect(()=>{
  const r=seeded(Math.round((x+300)*197+(z+300)*331)),o=new THREE.Object3D(),c=new THREE.Color();let count=0
  for(let i=0;i<max;i++){
   const px=x+r()*12,pz=z+r()*12;if(exclude?.(px,pz))continue
   o.position.set(px,height(px,pz),pz);o.rotation.set((r()-.5)*.25,r()*Math.PI*2,(r()-.5)*.35);o.scale.set(.55+r()*.9,.3+r()*.85,1);o.updateMatrix();ref.current.setMatrixAt(count,o.matrix)
   c.setHSL(.20+r()*.10,snow?.16:.4+r()*.3,snow?.73:.23+r()*.17);ref.current.setColorAt(count++,c)
  }
  ref.current.userData.total=count;ref.current.count=count;ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere();if(ref.current.boundingSphere)ref.current.boundingSphere.radius+=1
 },[x,z,height,exclude,snow])
 useFrame(({camera,clock},dt)=>{
  if(!ref.current)return
  if(clock.elapsedTime>=last.current){last.current=nextVegetationPoll(clock.elapsedTime,x,z,.2);center.set(x+6,height(x+6,z+6),z+6);ref.current.localToWorld(center);const d=camera.position.distanceTo(center);ref.current.visible=d<190;ref.current.castShadow=d<quality.grassShadow;ref.current.userData.target=Math.min(ref.current.userData.total,Math.ceil(max*(grassDensity(d-9)+.03)*quality.density))}
  // Gradually change the population instead of swapping whole patches at once.
  const target=ref.current.userData.target??ref.current.userData.total,delta=Math.ceil(dt*1500)
  ref.current.count+=Math.sign(target-ref.current.count)*Math.min(delta,Math.abs(target-ref.current.count))
 })
 return <instancedMesh ref={ref} args={[assets.geometry,assets.material,max]} customDepthMaterial={assets.depth} receiveShadow userData={{noBatch:true,noCameraCollision:true}}/>
}
export default function GrassField({bounds,height=flat,exclude,weather='sunny'}){
 const quality=useGraphicsQuality()
 const root=useRef(),uniforms=useMemo(()=>({clock:{value:0},strength:{value:0},gust:{value:0},eye:{value:new THREE.Vector3()}}),[])
 const assets=useMemo(()=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.025,0,0,.025,0,0,-.018,.22,.015,.018,.22,.015,-.01,.43,.045,.01,.43,.045,.015,.65,.09],3));geometry.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);geometry.computeVertexNormals();geometry.setAttribute('plantRank',new THREE.InstancedBufferAttribute(Float32Array.from({length:960},(_,i)=>i/960),1));return {geometry,material:windMaterial('grass',uniforms),depth:windMaterial('grass',uniforms,true)}},[uniforms])
 useEffect(()=>()=>Object.values(assets).forEach(a=>a.dispose()),[assets])
 const tiles=useMemo(()=>{const a=[];for(let x=bounds[0];x<bounds[1];x+=12)for(let z=bounds[2];z<bounds[3];z+=12)a.push([x,z]);return a},[bounds[0],bounds[1],bounds[2],bounds[3]])
 const mask=useMemo(()=>((x,z)=>x>=bounds[1]||z>=bounds[3]||exclude?.(x,z)),[bounds[1],bounds[3],exclude])
 useFrame(({clock,camera})=>{uniforms.eye.value.copy(camera.position);uniforms.clock.value=clock.elapsedTime;uniforms.strength.value=windStrength(weather);uniforms.gust.value=windEnvelope(clock.elapsedTime,uniforms.strength.value)})
 return <group ref={root}>{tiles.map(([x,z])=><Tile key={x+':'+z} x={x} z={z} assets={assets} height={height} exclude={mask} snow={weather==='snow'} quality={quality}/>)}</group>
}
