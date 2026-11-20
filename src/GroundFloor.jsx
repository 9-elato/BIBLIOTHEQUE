import {advanceGate,gatePose} from './secretGate'
import React, {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {DESKS} from './layout'
import LoungeRoom from './LoungeRoom'
import {BookCoverMesh} from './BookCover'

const cream='#cbb394', oak='#765036', gold='#c79c55'
const covers=['#7a4739','#536047','#7a6a46','#4b596c','#734d57','#a27a52']
const click = action => action ? {onClick:e=>{e.stopPropagation();action()},onPointerOver:()=>{document.body.style.cursor='pointer'},onPointerOut:()=>{document.body.style.cursor=''}} : {}

export function Box({p,s,c=oak,rot=[0,0,0],metal=0,opacity=1,glow}) {
  return <mesh position={p} rotation={rot} receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} metalness={metal} roughness={.72} transparent={opacity<1} opacity={opacity} depthWrite={opacity===1} emissive={glow||'#000'} emissiveIntensity={glow?.length?1.5:0}/></mesh>
}
function Round({p,r=.2,c=gold,scale=[1,1,1]}) {
  return <mesh position={p} scale={scale}><sphereGeometry args={[r,16,12]}/><meshStandardMaterial color={c} roughness={.55}/></mesh>
}
function Ring({p,r=.3,c=gold,rot=[0,0,0]}) {
  return <mesh position={p} rotation={rot}><torusGeometry args={[r,.021,8,30]}/><meshStandardMaterial color={c} metalness={.45} roughness={.5}/></mesh>
}
function Plate({p,label,w=1.65,h=.32,c=gold,onClick}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas')
    canvas.width=768;canvas.height=160
    const ctx=canvas.getContext('2d')
    ctx.fillStyle=c;ctx.fillRect(0,0,768,160)
    ctx.strokeStyle='#62472d';ctx.lineWidth=4;ctx.strokeRect(13,13,742,134)
    ctx.font='bold 69px "Malgun Gothic", "Noto Sans CJK KR", sans-serif'
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#271b13'
    ctx.fillText(label,384,82,705)
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace
    return map
  },[c,label])
  useEffect(()=>()=>texture.dispose(),[texture])
  return <group position={p} {...click(onClick)}>
    <Box p={[0,0,0]} s={[w,h,.07]} c={c} metal={.42}/>
    <mesh position={[0,0,.038]}><planeGeometry args={[w*.97,h*.93]}/><meshBasicMaterial map={texture}/></mesh>
  </group>
}
function Floor({x,z,w,d,c=oak}) {
  return <group>
    <Box p={[x,-.14,z]} s={[w,.27,d]} c={c}/>
    {Array.from({length:Math.ceil(d/.75)-1},(_,i)=><Box key={i} p={[x,.001,z-d/2+(i+1)*.75]} s={[w,.008,.012]} c="#4b3026"/>)}
  </group>
}
function Wall({x,z,w,d,h=5}) {
  return <group>
    <Box p={[x,h/2,z]} s={[w,h,d]} c={cream}/>
    <Box p={[x,.59,z]} s={[w+.04,1.18,d+.04]} c="#63402d"/>
    <Box p={[x,1.19,z]} s={[w+.08,.11,d+.08]} c="#926744"/>
    <Box p={[x,h-.15,z]} s={[w+.06,.21,d+.06]} c="#8f6746"/>
  </group>
}
function Arch({x=0,z,turn=0,title}) {
  const curve=useMemo(()=>new THREE.CatmullRomCurve3(Array.from({length:31},(_,i)=>{
    const t=i*Math.PI/30
    return new THREE.Vector3(2.02*Math.cos(t),2.72+1.5*Math.sin(t),0)
  })),[])
  return <group position={[x,0,z]} rotation={[0,turn,0]}>
    {[-2.02,2.02].map(a=><group key={a}><Box p={[a,1.35,0]} s={[.33,2.7,.39]} c="#976d48"/><Box p={[a,.16,0]} s={[.54,.32,.54]}/><Box p={[a,2.68,0]} s={[.46,.22,.51]} c={gold}/></group>)}
    <mesh><tubeGeometry args={[curve,36,.15,10,false]}/><meshStandardMaterial color="#a78059"/></mesh>
    <Plate p={[0,4.55,.13]} label={title} w={1.65}/>
  </group>
}
function Lamp({p}) {
  return <group position={p}><Box p={[0,.35,0]} s={[.06,.75,.06]} c={gold}/><Round p={[0,0,0]} r={.23} c="#ffdfa1"/><Box p={[0,-.03,0]} s={[.58,.12,.58]} c="#876143" metal={.6}/></group>
}
function Rug({x,z,w,d,c}) {
  return <group>
    <Box p={[x,.018,z]} s={[w,.024,d]} c={gold}/>
    <Box p={[x,.033,z]} s={[w-.14,.014,d-.14]} c={c}/>
    <Ring p={[x,.052,z]} r={Math.min(w,d)*.3} rot={[Math.PI/2,0,0]}/>
  </group>
}
function Desk({x,z,wide=false,onNote}) {
  const w=wide?3.2:1.95
  return <group position={[x,0,z]}>
    <Box p={[0,.86,0]} s={[w,.15,.8]}/>
    {[-w/2+.14,w/2-.14].flatMap(a=>[-.28,.28].map(b=><Box key={a+'/'+b} p={[a,.42,b]} s={[.12,.82,.12]} c="#503226"/>))}
    <group {...click(onNote)}><Box p={[-.25,.95,.06]} s={[.53,.05,.36]} c="#ead6ab"/><Box p={[-.25,.981,.06]} s={[.012,.012,.34]} c="#95704d"/></group>
    <Round p={[.55,1.14,-.16]} r={.17} c="#d9ae59"/>
    <Box p={[.55,1,-.16]} s={[.07,.19,.08]} c={gold}/>
    <Box p={[0,.46,.78]} s={[.65,.16,.62]} c="#526754"/>
    <Box p={[0,.76,1.04]} s={[.66,.57,.12]} c="#526754"/>
    <Box p={[0,.21,.78]} s={[.38,.42,.37]} c="#4c3020"/>
  </group>
}
function ArtFrame({x,y,z,kind='map'}) {
  const colors=kind==='art'?['#c98e5b','#53695d','#a85f4b']:['#ad8656','#906d46','#c8a870']
  return <group position={[x,y,z]}><Box p={[0,0,0]} s={[.7,.63,.075]} c={gold}/><Box p={[0,0,.046]} s={[.59,.52,.025]} c="#e2c89a"/>
    {colors.map((c,i)=><Box key={c} p={[i*.12-.12,(i%2-.5)*.13,.066]} s={[.22,.07+i*.065,.015]} c={c} rot={[0,0,i*.43-.4]}/>)}
  </group>
}
function Display({id}) {
  if (id==='literature') return <>{[0,1,2].map(i=><Box key={i} p={[.3,3.78+i*.085,.18]} s={[.57-i*.025,.073,.37]} c={covers[i]} rot={[0,i*.1,0]}/>)}</>
  if (id==='humanities') return <>
    <Box p={[-.55,3.77,.17]} s={[.43,.13,.33]} c="#cdbca0"/>
    <Round p={[-.55,3.94,.17]} r={.19} c="#dacbb1" scale={[1,.66,.74]}/>
    <Round p={[-.55,4.16,.17]} r={.13} c="#dacbb1" scale={[.81,1.21,.84]}/>
    <Round p={[.5,3.99,.18]} r={.23} c="#708784"/><Ring p={[.5,3.99,.18]} r={.26} rot={[.4,0,-.5]}/>
    <ArtFrame x={0} y={4.72} z={-.14} kind="portrait"/>
  </>
  if (id==='history') return <>{[-.79,0,.79].map(x=><ArtFrame key={x} x={x} y={4.23} z={-.14}/>)}<Ring p={[0,4.23,-.048]} r={.17}/></>
  if (id==='science') return <>
    <Round p={[-.57,4.01,.12]} r={.18} c="#dfb365"/><Ring p={[-.57,4.01,.12]} r={.3} rot={[1,.2,0]}/><Round p={[-.32,4.08,.17]} r={.073} c="#819a9c"/>
    <Box p={[.56,4.22,.15]} s={[.66,.16,.17]} c={gold} rot={[0,0,.44]}/>
    <Box p={[.51,3.96,.15]} s={[.07,.39,.07]} c="#483628"/>
    <Box p={[.97,3.9,.16]} s={[.085,.26,.09]} c="#ab9c79" rot={[0,0,-.27]}/>
    <Box p={[.97,3.78,.15]} s={[.24,.045,.23]} c={gold}/>
  </>
  if (id==='art') return <>
    <ArtFrame x={-.55} y={4.17} z={-.08} kind="art"/><ArtFrame x={.16} y={4.45} z={-.13} kind="art"/>
    <Round p={[.76,3.93,.16]} r={.17} c="#c48663" scale={[1,1.38,1]}/>
    <Round p={[.9,3.83,.29]} r={.14} c="#dfb476" scale={[1.5,.63,.82]}/>
  </>
  return <>
    <ArtFrame x={-.68} y={4.17} z={-.08}/><ArtFrame x={.48} y={4.17} z={-.08} kind="art"/>
    <Round p={[.07,3.85,.23]} r={.13} c="#e0c6a4" scale={[1,.6,1]}/><Ring p={[.22,3.85,.23]} r={.065}/>
  </>
}
function Bookcase({item,genre,onGenre,onPick,heldBook}) {
  const {wood,trim,plate,id,name}=genre
  const history=id==='history'
  return <group position={[item.x,0,item.z]} rotation={[0,item.z>0?Math.PI:0,0]}>
    <Box p={[0,1.83,-.27]} s={[2.9,3.66,.22]} c={wood}/>
    <Box p={[0,.28,.02]} s={[2.95,.56,.75]} c={wood}/>
    {[.19,.39].map(y=><group key={y}><Box p={[0,y,.41]} s={[2.53,.15,.06]} c={trim}/>{(history||id==='science'?[-.81,0,.81]:[0]).map(x=><Box key={x} p={[x,y,.46]} s={[.13,.04,.045]} c={plate} metal={.5}/>)}</group>)}
    {[-1.37,1.37].map(x=><group key={x}>
      <Box p={[x,1.96,.02]} s={[.22,3.33,.66]} c={wood}/>
      {(id==='literature'?[-.072,0,.072]:[0]).map(a=><Box key={a} p={[x+a,1.96,.363]} s={[.022,3.02,.025]} c={trim}/>)}
      {[.6,3.37].map(y=><Box key={y} p={[x,y,.07]} s={[.33,.18,.73]} c={trim}/>)}
    </group>)}
    {[.67,1.32,1.97,2.62].map((y,row)=><group key={y}>
      <Box p={[0,y-.05,.02]} s={[2.55,.11,.68]} c={trim}/>
      {Array.from({length:6},(_,i)=>{
        const book=item.books[row*6+i]
        if(!book||book.id===heldBook)return null
        const h=.35+(row+i)%4*.047
        return <group key={i} position={[(i-2.5)*.373,y+h/2,.15]} {...click(book?()=>onPick(book.id):null)}>
          <Box p={[0,0,0]} s={[.3,h,.35]} c={book?.color||covers[(i+row)%covers.length]}/>
          <Box p={[0,h*.23,.178]} s={[.255,.025,.014]} c={book?gold:'#a18262'} metal={book ? .45 : 0}/>
          {book?.cover&&<BookCoverMesh url={book.cover} position={[0,0,.196]} size={[.28,h-.02]}/>}
          {book&&<Round p={[0,-h*.23,.182]} r={.034} scale={[1,1,.28]}/>}
        </group>
      })}
    </group>)}
    {history&&[-.65,.65].map(x=><group key={x}>
      <Box p={[x,1.96,.34]} s={[1.16,2.6,.02]} c="#b3c8c6" opacity={.16}/>
      <Box p={[x-.61,1.96,.35]} s={[.052,2.66,.065]} c={trim}/>
    </group>)}
    <Box p={[0,3.51,.02]} s={[3.01,.31,.73]} c={wood}/>
    <Box p={[0,3.7,.03]} s={[3.14,.13,.82]} c={trim}/>
    {(id==='literature'||id==='humanities'||id==='art')&&[-.97,.97].map(x=><Round key={x} p={[x,3.51,.41]} r={.105} c={trim} scale={[1.32,.82,.52]}/>)}
    <Plate label={`${name} · ${item.number}`} p={[0,3.5,.437]} c={plate} onClick={()=>onGenre(id)}/>
    {id==='languages'&&<><Plate p={[-.68,3.16,.36]} label="English" w={.82} h={.21} c={plate}/><Plate p={[.68,3.16,.36]} label="Français" w={.82} h={.21} c={plate}/></>}
    <Display id={id}/>
  </group>
}
function Stacks({layout,onGenre,onPick,heldBook}) {
  const w=layout.end-7.15,x=7.15+w/2
  return <group>
    <Floor x={x} z={0} w={w} d={11.65} c="#825e43"/>
    {[-5.85,5.85].map(z=><Wall key={z} x={x} z={z} w={w} d={.26} h={8.8}/>)}
    <Wall x={layout.end+.1} z={0} w={.28} d={11.8} h={8.8}/>
    {DESKS.map(([a,z])=><Desk key={a+'/'+z} x={a} z={z}/>)}
    {layout.sections.map(({genre,cases,start})=><group key={genre.id}>
      <Rug x={start} z={0} w={2.45} d={3.45} c={genre.wood}/>

      {cases.map(item=><Bookcase key={item.number} item={item} genre={genre} onGenre={onGenre} onPick={onPick} heldBook={heldBook}/>)}
    </group>)}
  </group>
}
function SecretCabinet({x=0,half=0,moving,open,onKey,onReady}) {
  const ref=useRef()
  const ready=useRef(false),progress=useRef(0)
  useFrame((_,dt)=>{
    if(!moving||!ref.current)return
    progress.current=advanceGate(progress.current,open,dt)
    const pose=gatePose(progress.current,half)
    ref.current.position.set(pose.x,0,pose.z)
    ref.current.rotation.y=pose.rotation
    if(open&&half===1&&!ready.current&&progress.current===1){ready.current=true;onReady()}

  })
  useEffect(()=>{if(!open)ready.current=false},[open])
  const w=moving?1.48:2.72
  return <group position={[x,0,-14.65]}><group ref={ref}>
    <Box p={[0,1.79,-.24]} s={[w,3.58,.27]} c="#57382a"/>
    {[-1,1].map(a=><Box key={a} p={[a*(w/2-.065),1.8,0]} s={[.13,3.6,.57]} c="#67422e"/>)}
    {[.44,1.12,1.8,2.48,3.19].map((y,j)=><group key={y}>
      <Box p={[0,y,0]} s={[w,.115,.64]} c="#986943"/>
      {j<4&&Array.from({length:moving?5:10},(_,i)=>{
        const flag=moving&&half===1&&j===1&&i===1
        return <group key={i} position={[-w/2+.24+i*(moving ? .235 : .245),y+.29,.08]} {...click(flag&&!open?onKey:null)}>
          {<><Box p={[0,0,0]} s={[.185,.45+(i%3)*.045,.34]} c={flag?'#9c5636':covers[(i+j)%covers.length]}/>{flag&&<><Box p={[0,.08,.177]} s={[.185,.046,.026]} c="#ffce76" glow="#b17b2b"/><Round p={[0,-.056,.177]} r={.057}/></>}</>}
        </group>
      })}
    </group>)}
    <Box p={[0,3.57,.01]} s={[w+.04,.14,.68]} c="#a07349"/>
  </group></group>
}
function North({open,onKey,onReady,onNote}) {
  return <group>
    <Floor x={0} z={-9.97} w={4.55} d={6.36}/>
    <Floor x={0} z={-14.03} w={9.5} d={1.87}/>
    {[-1,1].map(a=><group key={a}>
      <Wall x={a*2.24} z={-10} w={.22} d={6.48} h={4.4}/>
      <Wall x={a*3.5} z={-13.08} w={2.62} d={.22} h={4.4}/>
      <Wall x={a*4.74} z={-14.01} w={.22} d={1.95} h={4.4}/>
      <Wall x={a*3.12} z={-14.96} w={3.46} d={.22} h={4.4}/>
      <SecretCabinet x={a*3.13}/>
    </group>)}
    {[-1,1].map(a=><SecretCabinet key={a} x={a*.75} half={a} moving open={open} onKey={onKey} onReady={onReady}/>)}
    <Lamp p={[0,3.63,-10.6]}/><Lamp p={[0,3.4,-13.3]}/>
    {open&&<>
      <Floor x={0} z={-17} w={2.95} d={4.08}/>
      <Floor x={0} z={-24.3} w={14.5} d={10.65} c="#79523b"/>
      {[-1,1].map(a=><group key={a}>
        <Wall x={a*1.47} z={-16.95} w={.21} d={4.08} h={3.35}/>
        <Wall x={a*4.3} z={-19} w={5.6} d={.23} h={7.6}/>
        <Wall x={a*7.23} z={-24.3} w={.23} d={10.62} h={7.6}/>
        <group position={[a*5.55,0,-29]}><Box p={[0,1.25,0]} s={[2,2.5,.55]} c="#593a2d"/>{[.46,1.15,1.84].map(y=><Box key={y} p={[0,y,.25]} s={[1.8,.11,.4]} c="#ac7e55"/>)}</group>
      </group>)}
      <Wall x={0} z={-29.63} w={14.6} d={.24} h={7.6}/>
      <Lamp p={[0,2.93,-17.2]}/>




      <pointLight position={[0,5.8,-25]} intensity={12} distance={10} color="#ffd4a4"/>
    </>}
  </group>
}
export default function GroundFloor({sceneTime,event,layout,map,weather,time,open,onKey,onReady,onGenre,onPick,onNote,heldBook}) {
  return <group>
    <Floor x={0} z={7.39} w={5.6} d={.54} c="#76685c"/>
    {map&&<Floor x={0} z={9.45} w={5.6} d={4.5} c="#76685c"/>}
    <Floor x={0} z={.15} w={15} d={14.1} c="#8a654a"/>
    <Rug x={0} z={0} w={5.1} d={4.7} c="#684a41"/>
    {[-1,1].map(a=><group key={a}>
      <Wall x={a*4.79} z={-6.8} w={5.44} d={.28} h={7.2}/>
      <Wall x={a*5.15} z={7.2} w={4.72} d={.24} h={7.2}/>
      {[-4.48,4.65].map(z=><Wall key={z} x={a*7.5} z={z} w={.25} d={z<0?4.78:5.1} h={7.2}/>)}
      <Arch x={a*7.5} z={0} turn={-a*Math.PI/2} title={a<0?'벽난로 라운지':'서가'}/>
    </group>)}
    <Arch z={-6.82} title="북쪽 복도"/><Arch z={7.25} turn={Math.PI} title="중앙 홀"/>
    <LoungeRoom time={sceneTime||time} weather={weather} event={event}/>
    <Stacks layout={layout} onGenre={onGenre} onPick={onPick} heldBook={heldBook}/>
    <North open={open} onKey={onKey} onReady={onReady} onNote={onNote}/>
  </group>
}
