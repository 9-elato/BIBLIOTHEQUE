import React from 'react'
import {SoftPad} from './CafeSoftSeat'
// Shared display/wearable design, normalized to 1 x 1.8 footprint.
export default function SnowmanSlipper(){return <group>
 <SoftPad p={[0,.065,0]} s={[1,.13,1.8]} c="#bcb6aa"/>
 <SoftPad p={[0,.15,-.10]} s={[.94,.18,1.60]} c="#eee8dc" fabric="velvet"/>
 <SoftPad p={[0,.235,-.43]} s={[.64,.05,.62]} c="#242b29"/>
 {[-.18,.18].map(x=><mesh key={'stripe'+x} position={[x,.266,-.43]}><boxGeometry args={[.015,.005,.59]}/><meshStandardMaterial color="#8a8c80"/></mesh>)}
 {[-.6,-.4,-.2].map(z=><mesh key={z} position={[0,.267,z]}><boxGeometry args={[.61,.005,.012]}/><meshStandardMaterial color="#676d62"/></mesh>)}
 <SoftPad p={[0,.30,.30]} s={[.99,.40,1.08]} c="#f5efe3" fabric="velvet"/>
 {[-.16,.16].map(x=><mesh key={x} position={[x,.493,.42]} scale={[1,.4,1.25]}><sphereGeometry args={[.045,10,6]}/><meshStandardMaterial color="#202b2b"/></mesh>)}
 <mesh position={[0,.515,.56]} rotation={[Math.PI/2,0,.25]}><coneGeometry args={[.075,.25,12]}/><meshStandardMaterial color="#e17b32" roughness={.9}/></mesh>
 <mesh position={[0,.495,.61]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.16,.012,5,16,Math.PI]}/><meshStandardMaterial color="#303932"/></mesh>
 </group>}
