import StaticBatch from './StaticBatch'
import * as THREE from 'three'
import React,{useRef,useLayoutEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import {Box as B} from './GroundFloor'
import StoryWindow from './WindowLandscape'
import {toggleLadder} from './ladderSystem'
function Ladder({item}){
 const ref=useRef();useFrame(()=>{if(ref.current)ref.current.position.x=item.x})
 return <group ref={ref} position={[item.x,0,item.z]} onClick={e=>{e.stopPropagation();toggleLadder(item)}}>
  {[-.35,.35].map(x=><B key={x} p={[x,3.7,-.4]} s={[.09,7.5,.11]} rot={[-.12,0,0]} c="#8f613b"/>)}
  {Array.from({length:23},(_,i)=><B key={i} p={[0,.18+i*.32,-i*.038]} s={[.8,.07,.15]} c="#b18a59"/>)}
  {[-.35,.35].map(x=><mesh key={x} position={[x,.12,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.12,.12,.08,14]}/><meshStandardMaterial color="#775733" metalness={.7}/></mesh>)}
 </group>
}
const colors=['#735342','#4c6657','#6c4b56','#b09569','#475570']
function BookRows({offset=0,rows=6}){
 const ref=useRef()
 useLayoutEffect(()=>{const m=new THREE.Object3D();for(let k=0;k<rows;k++)for(let i=0;i<12;i++){
  m.position.set(-1.23+i*.22,4.41+k*.75,.08);m.scale.set(.16,.43+(i%3)*.06,.35);m.updateMatrix()
  ref.current.setMatrixAt(k*12+i,m.matrix);ref.current.setColorAt(k*12+i,new THREE.Color(colors[(i+k+offset)%5]))
 }ref.current.instanceMatrix.needsUpdate=true;ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere()},[offset,rows])
 return <instancedMesh ref={ref} args={[null,null,rows*12]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial roughness={.85}/></instancedMesh>
}
export default function TallStacks({layout,ladders,time,weather,event}){
 return <StaticBatch revision={layout}>
 {[-3.25,0,3.25].map(z=><group key={z} position={[layout.end-.25,0,z]} rotation={[0,-Math.PI/2,0]}>
  <B p={[0,4.4,-.2]} s={[3.1,8.8,.22]} c="#654632"/>
  {Array.from({length:12},(_,k)=><B key={k} p={[0,.35+k*.75,.06]} s={[3.2,.1,.7]} c="#aa8757"/>)}
  <BookRows/><group position={[0,-4.1,0]}><BookRows rows={5}/></group>
 </group>)}
 {layout.sections.map(({start,cases,genre},j)=><group key={genre.id}>
  {cases.map(c=><group key={c.number} position={[c.x,0,c.z]} rotation={[0,c.z>0?Math.PI:0,0]}>
   <B p={[0,6.35,-.3]} s={[2.95,4.8,.3]} c={genre.wood}/>
   {[-1.4,1.4].map(x=><B key={x} p={[x,6.35,.02]} s={[.14,4.8,.65]} c={genre.trim}/>)}
   {[4.1,4.85,5.6,6.35,7.1,7.85,8.6].map((y,k)=><group key={y}>
    <B p={[0,y,.02]} s={[3,.12,.7]} c={genre.trim}/>

   </group>)}
   <BookRows offset={j}/>
   {/* Decorative folios fill unused lower shelves; real records keep their slots. */}
   {Array.from({length:24},(_,i)=>!c.books[i]&&<B key={i} p={[(i%6-2.5)*.373,.9+Math.floor(i/6)*.65,.1]} s={[.23,.4,.3]} c={colors[(i+j)%5]}/>)}
  </group>)}
  {j<layout.sections.length-1&&[-1,1].map(a=><group key={a} userData={{noBatch:true}}><StoryWindow position={[Math.max(...cases.map(c=>c.x))+2.5,4.6,a*5.65]} rotation={[0,a>0?Math.PI:0,0]} width={1.35} height={6.4} time={time} weather={weather} event={event} curtain={j%2?'#582d3a':'#294b3d'}/></group>)}
  <mesh position={[(ladders[j].min+ladders[j].max)/2,7.25,-4.7]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.045,.045,ladders[j].max-ladders[j].min+1,12]}/><meshStandardMaterial color="#b4975b" metalness={.75}/></mesh>
  <group userData={{noBatch:true}}><Ladder item={ladders[j]}/></group>
 </group>)}
 </StaticBatch>
}
