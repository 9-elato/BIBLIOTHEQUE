import React,{useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react'
import {useFrame} from '@react-three/fiber'
import {Box3,Matrix4,Vector3} from 'three'
import {recordStorage} from './recordStorage'
import {readCinemaKit} from './cinemaKitState'
import {cinemaInside} from './cafeExpansion'
import {subscribeDrink,drinkSnapshot} from './cafeDrink'
import SnowmanSlipper from './SnowmanSlipper'
import CafeDrinkModel from './CafeDrinkModel'
const wearing=()=>{try{return readCinemaKit(recordStorage.getItem('mll-cinema-kit')).slippers}catch{return false}}
export default function AvatarCafeAccessories({model,character,player,pose}){
 const root=useRef(),cup=useRef(),snackRoot=useRef(),kernel=useRef(),soda=useRef(),feet=useRef([]),drink=useSyncExternalStore(subscribeDrink,drinkSnapshot,drinkSnapshot),[slippers,setSlippers]=useState(wearing)
 useEffect(()=>{const sync=()=>setSlippers(wearing());window.addEventListener('library-records-dirty',sync);window.addEventListener('library-records-updated',sync);return()=>{window.removeEventListener('library-records-dirty',sync);window.removeEventListener('library-records-updated',sync)}},[])
 const rig=useMemo(()=>({feet:character==='fox'?['Boot L','Boot R'].map(n=>model.getObjectByName(n)):character==='labrador'?['LabradorLegL','LabradorLegR'].map(n=>model.getObjectByName(n)):[],hand:model.getObjectByName(character==='fox'?'Relaxed forepaw L':'LabradorArmL'),box:new Box3(),inverse:new Matrix4(),size:new Vector3(),center:new Vector3()}),[model,character])
 useFrame(()=>{
  if(!root.current)return
  root.current.updateWorldMatrix(true,false);rig.inverse.copy(root.current.matrixWorld).invert()
  const p=player?.current,wear=slippers&&p&&p.level>=0&&p.level<.6&&cinemaInside(p.x,p.z)
  rig.feet.forEach((node,i)=>{const shoe=feet.current[i];if(!shoe)return;shoe.visible=Boolean(wear&&node);if(!shoe.visible)return
   node.updateWorldMatrix(true,true);rig.box.setFromObject(node).applyMatrix4(rig.inverse);rig.box.getSize(rig.size);rig.box.getCenter(rig.center)
   shoe.position.set(rig.center.x,rig.box.min.y-.015,rig.center.z+.025)
   shoe.scale.set(rig.size.x*1.12,Math.max(.22,Math.min(.5,rig.size.y)),rig.size.z*1.12/1.8)
  })
  const snack=pose?.current?.snack;snackRoot.current.visible=Boolean(snack);if(snack){const lift=Math.sin(Math.PI*snack.elapsed/1.8);kernel.current.visible=snack.kind==='popcorn';soda.current.visible=snack.kind==='cola';snackRoot.current.position.set(.32*(1-lift),.55+.55*lift,.65);snackRoot.current.rotation.z=snack.kind==='cola'?-.25*lift:0}
  if(cup.current&&drink){
   cup.current.visible=!pose?.current?.climbing&&!pose?.current?.snack
   if(rig.hand){rig.hand.updateWorldMatrix(true,true);rig.box.setFromObject(rig.hand).applyMatrix4(rig.inverse);rig.box.getSize(rig.size);rig.box.getCenter(rig.center);cup.current.position.set(rig.center.x-.06,rig.box.min.y+rig.size.y*.3,rig.box.max.z+.06)}
   else cup.current.position.set(.27,.75-(pose?.current?.amount||0)*.25,.52)
  }
 })
 return <group ref={root} userData={{noCameraCollision:true}}>
  {rig.feet.map((_,i)=><group key={i} ref={node=>feet.current[i]=node} visible={false}><SnowmanSlipper/></group>)}
  <group ref={snackRoot} visible={false}><mesh ref={kernel}><icosahedronGeometry args={[.045,1]}/><meshStandardMaterial color="#f1deb0"/></mesh><group ref={soda}><CafeDrinkModel drink={{vessel:"glass",color:"#362820"}}/></group></group>
  {drink&&<group ref={cup}><CafeDrinkModel drink={drink}/></group>}
 </group>
}
