import React from 'react'
import {Box as B} from './GroundFloor'
import StaticBatch from './StaticBatch'

// Trim follows the actual walls and stops at doorways and the stair opening.
export default function CafeFinish(){return <StaticBatch>
 {[.12,7.04].map(y=><group key={y}>
  <B p={[-25,y,15.16]} s={[17.7,.16,.08]} c="#38322b"/>
  <B p={[-33.83,y,27.45]} s={[.08,.16,6.8]} c="#38322b"/>
  <B p={[-32.5,y,30.83]} s={[2.7,.16,.08]} c="#38322b"/>
  <B p={[-22.5,y,30.83]} s={[12.7,.16,.08]} c="#38322b"/>
 </group>)}
 {/* Rear passage: jambs, lintel and continuous sill connect the annex. */}
 {[-31.02,-28.98].map(x=><B key={x} p={[x,2.3,31.02]} s={[.12,4.6,.30]} c="#282a28"/>)}
 <B p={[-30,4.58,31.02]} s={[2.16,.12,.30]} c="#282a28"/>
 <B p={[-30,-.015,31.48]} s={[2,.03,1.2]} c="#9a7955"/>
 {/* Brass end caps finish the waist-high display dividers. */}
 {[18,22.6].map(z=><B key={z} p={[-27,1.315,z]} s={[.14,.03,1.8]} c="#a18b62"/>)}
 {/* Recessed kickboards and quiet panel seams on both coffee-bar legs. */}
 <B p={[-17.92,.09,18.2]} s={[.025,.16,2.1]} c="#151716"/>
 <B p={[-18.3,.09,20.405]} s={[3.15,.16,.025]} c="#151716"/>
 {[-19.3,-18.3,-17.3].map(x=><group key={x}>
  <B p={[x,.69,20.406]} s={[.012,1.05,.012]} c="#101312"/>
  <B p={[x+.32,1.06,20.425]} s={[.20,.025,.035]} c="#a18b62"/>
 </group>)}
 </StaticBatch>}
