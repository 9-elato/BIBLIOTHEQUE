import React,{useMemo,useEffect} from 'react'
import * as THREE from 'three'
import GrassField from './GrassField'
import ForestTrees from './ForestTrees'
import {CAFE_GARDEN_BOUNDS,CAFE_GARDEN_TREES,cafeGardenHeight} from './cafeGroundLayout.js'
export default function CafeWindowGarden({weather}){
 const ground=useMemo(()=>{
  const [l,r,b,f]=CAFE_GARDEN_BOUNDS,g=new THREE.PlaneGeometry(r-l,f-b,8,32)
  g.rotateX(-Math.PI/2);g.translate((l+r)/2,0,(b+f)/2)
  const p=g.attributes.position,colors=[]
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,cafeGardenHeight(x,z));const c=new THREE.Color(weather==='snow'?'#d9e0d4':'#719951');c.multiplyScalar(.94+.06*Math.sin(z*1.3+x));colors.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g
 },[weather])
 useEffect(()=>()=>ground.dispose(),[ground])
 return <group><mesh geometry={ground} receiveShadow><meshStandardMaterial vertexColors roughness={1}/></mesh><GrassField bounds={CAFE_GARDEN_BOUNDS} height={cafeGardenHeight} weather={weather}/><ForestTrees positions={CAFE_GARDEN_TREES} weather={weather}/></group>
}
