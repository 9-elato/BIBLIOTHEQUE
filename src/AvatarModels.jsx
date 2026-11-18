import React, {useMemo, useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

// v1.2 character models: original, lightweight mesh geometry.
// -Y is down and -Z is the forward/face direction.
const ghostFabric = '#f8f3e9'
const foxFur = '#df8749'
const foxCream = '#fff0d8'

function Ellipsoid({position, scale, color, material={}, castShadow=false, rotation=[0,0,0]}) {
  return <mesh position={position} scale={scale} rotation={rotation} castShadow={castShadow}>
    <sphereGeometry args={[1, 24, 16]}/>
    <meshStandardMaterial color={color} roughness={.94} {...material}/>
  </mesh>
}

/**
 * A single continuous cloth surface, rather than a head sphere stacked on a cone.
 * The bottom waves gently, like fabric falling over a little person.
 */
function useSheetGeometry() {
  return useMemo(() => {
    const radialSegments=40
    const profile=[
      [0.04,.60],[.12,.63],[.24,.62],[.38,.59],[.55,.56],
      [.74,.52],[.92,.49],[1.10,.47],[1.27,.43],
      [1.42,.36],[1.54,.26],[1.64,.13],[1.69,.012]
    ]
    const vertices=[]
    const uvs=[]
    const indices=[]
    profile.forEach(([y,r],j)=>{
      for(let i=0;i<=radialSegments;i++) {
        const a=i/radialSegments*Math.PI*2
        const isHem=j<3
        const hemWave=isHem ? Math.cos(a*6)*.055*(1-j/3) : 0
        const fold=(Math.cos(a*6+.3)*.015+Math.sin(a*3)*.008)*(1-j/(profile.length-1))
        const radius=r+fold
        vertices.push(radius*Math.cos(a),y+hemWave,radius*Math.sin(a))
        uvs.push(i/radialSegments,j/(profile.length-1))
      }
    })
    for(let j=0;j<profile.length-1;j++) for(let i=0;i<radialSegments;i++) {
      const a=j*(radialSegments+1)+i
      const b=a+radialSegments+1
      indices.push(a,b,a+1,b,b+1,a+1)
    }
    const geo=new THREE.BufferGeometry()
    geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3))
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  },[])
}

function GhostAvatar({moving}) {
  const root=useRef()
  const drape=useRef()
  const geometry=useSheetGeometry()
  useFrame(({clock})=>{
    const t=clock.elapsedTime
    if(root.current) {
      root.current.position.y=.17+Math.sin(t*1.9)*.065+(moving.current ? .025*Math.sin(t*7) : 0)
      root.current.rotation.z=Math.sin(t*1.25)*.025
    }
    if(drape.current) drape.current.rotation.y=Math.sin(t*.85)*.035
  })
  return <group ref={root}>
    <group ref={drape}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={ghostFabric} roughness={.99} side={THREE.DoubleSide}/>
      </mesh>
      {/* Two SMALL oval eyeholes: no oversized spherical googly eyes. */}
      {[-.145,.145].map((x,i)=><Ellipsoid key={i}
        position={[x,1.195,-.459]} scale={[.053,.089,.022]} color="#252526"
        material={{roughness:.97}}/>)}
      {/* Tiny rosy fabric shading, subtle and optional-looking */}
      {[-.245,.245].map((x,i)=><Ellipsoid key={i}
        position={[x,.998,-.474]} scale={[.070,.028,.011]} color="#e6bea9"
        material={{transparent:true,opacity:.32}}/>)}
      {/* Fabric-covered little arms blend visually into the sheet. */}
      {[-1,1].map(side=><Ellipsoid key={side}
        position={[side*.47,.76,-.045]} scale={[.18,.33,.21]}
        rotation={[0,0,side*.23]} color={ghostFabric}/>)}
    </group>
  </group>
}

function FoxAvatar({moving}) {
  const root=useRef()
  const tail=useRef()
  const limbs=useRef([])
  const blink=useRef([])
  useFrame(({clock})=>{
    const t=clock.elapsedTime
    const step=moving.current?Math.sin(t*8)*.29:0
    if(root.current) root.current.position.y=(moving.current?Math.abs(Math.sin(t*8))*.027:Math.sin(t*1.9)*.012)
    if(tail.current) tail.current.rotation.y=Math.sin(t*2.2)*.20
    limbs.current.forEach((limb,i)=>{if(limb)limb.rotation.x=(i%2===0?1:-1)*step})
    // Slow blink every ~5 seconds; deliberately subtle.
    const phase=t%5.1
    const blinking=phase>4.90&&phase<5.07
    blink.current.forEach(eye=>{if(eye)eye.scale.y=blinking?.14:1})
  })
  return <group ref={root}>
    {/* Rounded, tapering torso: no rectangular box arms. */}
    <Ellipsoid position={[0,.99,.035]} scale={[.40,.57,.32]} color={foxFur} castShadow/>
    <Ellipsoid position={[0,.98,-.258]} scale={[.255,.43,.095]} color={foxCream}/>
    <Ellipsoid position={[0,1.61,-.025]} scale={[.465,.465,.41]} color={foxFur} castShadow/>
    {/* Wide creamy cheek tufts and gently pointed muzzle. */}
    {[-1,1].map(side=><group key={side}>
      <Ellipsoid position={[side*.22,1.43,-.305]} scale={[.26,.18,.185]} color={foxCream}/>
      <Ellipsoid position={[side*.305,1.465,-.22]} scale={[.15,.12,.13]} color={foxCream}/>
    </group>)}
    <Ellipsoid position={[0,1.43,-.440]} scale={[.23,.135,.15]} color={foxCream}/>
    <Ellipsoid position={[0,1.48,-.572]} scale={[.073,.058,.057]} color="#332821" material={{roughness:.55}}/>
    {/* Small expressive eyes and simple brow line. */}
    {[-1,1].map((side,i)=><group key={side}>
      <group ref={el=>blink.current[i]=el}>
        <Ellipsoid position={[side*.198,1.735,-.360]} scale={[.045,.065,.03]} color="#242625"
          material={{roughness:.34}}/>
        <Ellipsoid position={[side*.189,1.757,-.389]} scale={[.011,.016,.008]} color="#fffdf2"/>
      </group>
      <Ellipsoid position={[side*.285,1.48,-.352]} scale={[.045,.023,.011]} color="#eba88c"
        material={{transparent:true,opacity:.70}}/>
      {/* Rounded triangular ears with inner peach detail. */}
      <mesh position={[side*.30,2.035,-.020]} rotation={[0,0,-side*.20]} castShadow>
        <coneGeometry args={[.205,.51,5]}/><meshStandardMaterial color={foxFur} roughness={.96}/>
      </mesh>
      <mesh position={[side*.30,2.042,-.130]} rotation={[0,0,-side*.20]}>
        <coneGeometry args={[.112,.32,5]}/><meshStandardMaterial color="#f7c4ae" roughness={1}/>
      </mesh>
    </group>)}
    {/* Fine thin circular glasses sit in front of the eyes, with sidearms. */}
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.198,1.735,-.411]}>
        <torusGeometry args={[.117,.012,8,32]}/>
        <meshStandardMaterial color="#624534" roughness={.48}/>
      </mesh>
      <mesh position={[side*.368,1.755,-.326]} rotation={[0,side*.34,0]}>
        <boxGeometry args={[.17,.015,.015]}/>
        <meshStandardMaterial color="#624534" roughness={.5}/>
      </mesh>
    </group>)}
    <mesh position={[0,1.74,-.413]}><boxGeometry args={[.11,.015,.018]}/>
      <meshStandardMaterial color="#624534"/></mesh>
    {/* A little muted-green scarf makes the fox feel at home among books. */}
    <mesh position={[0,1.24,-.035]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[.255,.052,8,32]}/><meshStandardMaterial color="#5c8068" roughness={1}/>
    </mesh>
    <Ellipsoid position={[.16,1.10,-.245]} scale={[.11,.21,.06]} rotation={[0,0,-.25]} color="#5c8068"/>
    {/* Organic arms and paws, animated about the shoulder. */}
    {[-1,1].map((side,i)=><group key={side} ref={el=>limbs.current[i]=el} position={[side*.385,1.20,0]}>
      <Ellipsoid position={[side*.09,-.22,-.025]} scale={[.14,.32,.155]} rotation={[0,0,side*.14]} color={foxFur} castShadow/>
      <Ellipsoid position={[side*.12,-.46,-.10]} scale={[.15,.13,.16]} color="#72523e"/>
    </group>)}
    {/* Short warm-brown legs. */}
    {[-1,1].map((side,i)=><group key={side} ref={el=>limbs.current[2+i]=el} position={[side*.22,.63,0]}>
      <Ellipsoid position={[0,-.21,.035]} scale={[.16,.29,.18]} color="#8b6448" castShadow/>
      <Ellipsoid position={[0,-.47,-.10]} scale={[.18,.13,.27]} color="#4f4238"/>
    </group>)}
    {/* Distinctive sweeping fox tail behind the torso, with white tip. */}
    <group ref={tail} position={[.18,.88,.27]} rotation={[0,0,-.22]}>
      <Ellipsoid position={[.22,.06,.35]} scale={[.31,.32,.57]} rotation={[.22,-.13,-.38]} color="#cb713c" castShadow/>
      <Ellipsoid position={[.42,.12,.76]} scale={[.24,.23,.27]} rotation={[0,0,-.25]} color={foxCream}/>
    </group>
  </group>
}

export default function AvatarModels({moving,character='fox'}) {
  return character==='ghost'?<GhostAvatar moving={moving}/>:<FoxAvatar moving={moving}/>
}
