import React,{useRef,useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
// A camera-following shadow region avoids a huge, low-resolution estate map.
export default function VegetationSun({light}){
 const ref=useRef(),target=useMemo(()=>new THREE.Object3D(),[]),last=useRef(-1),direction=useMemo(()=>new THREE.Vector3(),[])
 useFrame(({camera,clock})=>{if(clock.elapsedTime-last.current<.2)return;last.current=clock.elapsedTime;const p=camera.position;target.position.set(p.x,p.y-3,p.z);target.updateMatrixWorld();ref.current.position.copy(target.position).addScaledVector(direction.fromArray(light.sunDirection),35);ref.current.updateMatrixWorld()})
 return <><primitive object={target}/><directionalLight ref={ref} target={target} color={light.sun} intensity={light.direct} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-near={.5} shadow-camera-far={90} shadow-normalBias={.035} shadow-bias={-.0003}/></>
}
