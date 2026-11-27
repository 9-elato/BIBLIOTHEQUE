import React,{useState,useEffect,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {recordStorage} from './recordStorage'
import {cinemaInside} from './cafeExpansion'
import {SoftPad} from './CafeSoftSeat'
import LoungeBlanket from './LoungeBlanket'
const read=()=>{try{return recordStorage.getItem('mll-cinema-kit')||'{}'}catch{return '{}'}}
export default function CinemaKit({player,pose,character}){
 const [saved,setSaved]=useState(read),root=useRef(),lap=useRef()
 useEffect(()=>{const sync=()=>setSaved(read());window.addEventListener('library-records-dirty',sync);window.addEventListener('library-records-updated',sync);return()=>{window.removeEventListener('library-records-dirty',sync);window.removeEventListener('library-records-updated',sync)}},[])
 let kit;try{kit=JSON.parse(saved)}catch{kit={}}
 useFrame(()=>{const p=player.current;root.current.visible=Math.abs(p.level)<.18&&cinemaInside(p.x,p.z);lap.current.visible=Boolean(p.seated?.seat.id.startsWith('cinema-recliner-'))})
 return <group ref={root} visible={false} userData={{noCameraCollision:true}}>
  {kit.slippers&&character!=='ghost'&&[-.22,.22].map(x=><SoftPad key={x} p={[x,.09,-.12]} s={[.36,.18,.55]} c="#e7ddc9"/>)}
  <group ref={lap} visible={false}>
   {kit.blanket&&<LoungeBlanket lap pose={pose}/>}
   {kit.cushion&&<SoftPad p={[0,.52,.27]} s={[.65,.5,.2]} c="#b4a58b"/>}
   {kit.popcorn&&<group position={[.65,.35,-.15]}><mesh><cylinderGeometry args={[.18,.13,.35,14]}/><meshStandardMaterial color="#eadfc5"/></mesh>{Array.from({length:9},(_,i)=><mesh key={i} position={[Math.cos(i*2.4)*.1,.18+Math.sin(i)*.03,Math.sin(i*2.4)*.1]}><icosahedronGeometry args={[.055,0]}/><meshStandardMaterial color="#efe0ac"/></mesh>)}</group>}
   {kit.cola&&<group position={[-.65,.35,-.15]}><mesh><cylinderGeometry args={[.09,.07,.3,14]}/><meshStandardMaterial color="#302b27"/></mesh><mesh position={[.02,.24,0]}><cylinderGeometry args={[.008,.008,.2,6]}/><meshStandardMaterial color="#e6d9c3"/></mesh></group>}
  </group>
 </group>
}
