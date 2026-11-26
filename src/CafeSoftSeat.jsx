import React from 'react'
import {RoundedBox} from '@react-three/drei'
import * as THREE from 'three'
const pixels=new Uint8Array(64*64*4);for(let i=0;i<4096;i++){const n=150+Math.floor((Math.sin(i*127.1)*43758.5453%1+1)*30);pixels.set([n,n,n,255],i*4)}
const weave=new THREE.DataTexture(pixels,64,64);weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(8,8);weave.needsUpdate=true
export function SoftPad({p,s,c='#ddd1bc'}){return <RoundedBox position={p} args={s} radius={Math.min(...s)*.3} smoothness={3}><meshPhysicalMaterial color={c} roughness={.96} sheen={1} sheenColor="#eee3cf" sheenRoughness={.9} bumpMap={weave} bumpScale={.006}/></RoundedBox>}
export default function CafeSoftSeat({floor=false,dark=false}){const c=dark?'#66564c':'#ded3bf';return <group><SoftPad p={[0,floor?.15:.43,0]} s={[1.2,floor?.2:.4,.96]} c={c}/><SoftPad p={[0,floor?.38:.95,.35]} s={[1.2,floor?.3:.8,.27]} c={c}/>{!floor&&[-.49,.49].map(x=><SoftPad key={x} p={[x,.70,0]} s={[.22,.35,.9]} c={c}/>)}<SoftPad p={[.19,floor?.33:.85,.17]} s={[.37,.31,.15]} c={dark?'#a18d77':'#eee4d3'}/></group>}
