import {tourEnabled} from './FurnitureTourPanel'
import {createFurnitureTour,advanceFurnitureTour} from './furnitureTour'
import StaticBatch from './StaticBatch'
import SceneBudget from './SceneBudget'
import {profiling,FrameProfiler} from './PerformancePanel'
import LoungeBlanket from './LoungeBlanket'
import {toggleGlassDoor} from './greenhouseLayout'
import StudyRoom from './StudyRoom'
import {toggleStudyDoor} from './studyLayout'
import {movementVector,facingForMovement} from './cameraMovement'
import {ATTIC_EXPANSION} from './atticLayout'
import PaperSpirits from './PaperSpirits'
import AtmosphereDetails from './AtmosphereDetails'
import TallStacks from './TallStacks'
import Greenhouse from './Greenhouse'
import FacadeModel from './FacadeModel'
import InteractiveProps from './InteractiveProps'
import {makeLadders,advanceLadders,toggleLadder} from './ladderSystem'
import React,{lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react'
import {collectCameraObstacles} from './cameraOcclusion'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {OrthographicCamera} from '@react-three/drei'
import * as THREE from 'three'
import Weather from './Weather'
import SecretDetails from './SecretDetails'
import {WORLD_HEIGHT_SCALE} from './worldScale'
import AvatarModels from './AvatarModels'
import GroundFloor from './GroundFloor'
import WorldAdditions from './WorldAdditions'
import InteriorDetails from './InteriorDetails'
import Mezzanine from './Mezzanine'
import {movePlayer,floorName} from './navigation'
import {makeStacks,ROOM_SPOTS,zoneAt} from './layout'
import {interactionAt} from './interactions'
import PlacedBooks from './PlacedBooks'
import LibraryDetails from './LibraryDetails'
import MainRoomDetails from './MainRoomDetails'
import {HallDetails} from './RoomDetails'
import {startSitting,startStanding,advanceSeating} from './seating'

const MOVE=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']
const AtticGLB=lazy(()=>import('./AtticGLB'))
function WalkControl({blanket,onBlanket,glassDoor,studyDoor,onMusic,ladders,onExperience,onCloseSecret,mode,blocked,joy,books,onZone,teleport,character,heldBook,keyHeld,layout,entranceOpen,gateReady,onKey,onInteraction,onToggleEntrance,onOpenNotes,onGenre,onTravel,onRead,canPlace,onPlaceNearby,onSeatStatus}) {
  const {gl,scene}=useThree()
  const ray=useMemo(()=>new THREE.Raycaster(),[])
  const rayDirection=useMemo(()=>new THREE.Vector3(),[])
  const eye=useMemo(()=>new THREE.Vector3(),[])
  const cameraDistance=useRef(6)
  const occlusion=useRef({elapsed:1,safe:6,objects:[],hits:[]})
  const cameraYaw=useRef(0)
  const avatar=useRef()
  const moving=useRef(false)
  const visitedSecret=useRef(false)
  const pose=useRef({amount:0})
  const lastSeatStatus=useRef('')
  const currentZone=useRef('')
  const lastHint=useRef('')
  const state=useRef({x:0,z:23,level:0,yaw:0,bodyYaw:0,pitch:0,keys:new Set(),pointer:null,lx:0,ly:0,seated:false})
  const tour=useRef(null)
  const status=useRef({})
  useEffect(()=>{
    if(!tourEnabled)return
    const publish=()=>window.dispatchEvent(new CustomEvent('library-tour-status',{detail:{running:Boolean(tour.current?.running),label:tour.current?.label,results:[...(tour.current?.results||[])]}}))
    const stop=()=>{if(tour.current?.running){Object.assign(state.current,tour.current.saved,{seated:null});state.current.keys.clear();tour.current.running=false;publish()}}
    const start=e=>{if(status.current.blocked||status.current.mode!=='third'||state.current.seated)return;stop();tour.current=createFurnitureTour(state.current,e.detail==='bed');publish()}
    const key=e=>{if(MOVE.includes(e.code)||e.code==='Escape')stop()}
    window.addEventListener('library-tour-start',start);window.addEventListener('library-tour-stop',stop);window.addEventListener('keydown',key)
    const timer=setInterval(publish,500)
    return()=>{clearInterval(timer);window.removeEventListener('library-tour-start',start);window.removeEventListener('library-tour-stop',stop);window.removeEventListener('keydown',key)}
  },[])
  const bookcases=useMemo(()=>layout.sections.flatMap(section=>section.cases.map(c=>({x:c.x,z:c.z,genre:section.genre.id,slot:(c.number-1)*24}))),[layout])
  status.current={onBlanket,gateOpening:!gateReady&&keyHeld,blocked,mode,onKey,gateReady,onToggleEntrance,onOpenNotes,onGenre,entranceOpen,onTravel,onRead,bookcases,heldBook,canPlace,onPlaceNearby,world:{end:layout.end,gateReady,entranceOpen,ladders,studyDoor,glassDoor}}
  const look=useMemo(()=>new THREE.Vector3(),[])
  const target=useMemo(()=>new THREE.Vector3(),[])
  useEffect(()=>{
    const room=teleport?.room||teleport
    if(room==='secret')return
    const spot=ROOM_SPOTS[room]
    if(spot) {
      const [x,z,level,yaw]=spot
      const s=state.current
      Object.assign(s,{x,z,level,yaw,bodyYaw:-yaw,pitch:0})
      cameraYaw.current=yaw
      s.keys.clear();s.seated=null;pose.current={amount:0}
    }
  },[teleport])
  useEffect(()=>{
    const s=state.current
    if(s.level===0&&s.x>layout.end-.95){s.x=layout.end-1.2;s.z=0}
  },[layout.end])
  useEffect(()=>{
    const s=state.current
    const canvas=gl.domElement
    const interact=()=>{
      const ui=status.current
      if(ui.blocked||ui.mode==='overview'||tour.current?.running)return
      const action=interactionAt(s,ui)
      if(!action)return
      s.keys.clear()
      if(action.type==='place')ui.onPlaceNearby?.(action.target)
      else if(action.type==='stand')s.seated=startStanding(s.seated,ui.world)
      else if(action.type==='seat'){s.seated=startSitting(s,action.seat);s.yaw=-action.seat.turn-.4;s.pitch=0}
      else if(action.type==='door'){
        // Do not swing the door through a visitor standing in its sweep.
        if(ui.entranceOpen&&s.z>10.1&&s.z<12.05&&Math.abs(s.x)<1.8)return
        ui.onToggleEntrance?.(!ui.entranceOpen)
      }
      else if(action.type==='gardenWater')window.dispatchEvent(new Event('greenhouse-water-toggle'))
      else if(action.type==='glassDoor')toggleGlassDoor(glassDoor,s)
      else if(action.type==='studyDoor')toggleStudyDoor(studyDoor,s)
      else if(action.type==='studyLamp')window.dispatchEvent(new Event('study-lamp-toggle'))
      else if(action.type==='music')onMusic?.()
      else if(action.type==='ladder')toggleLadder(action.ladder)
      else if(action.type==='telescope'||action.type==='board')onExperience(action.type)
      else if(action.type==='minigame')onExperience(action.game)
      else if(action.type==='blanket')ui.onBlanket()
      else if(action.type==='key')ui.onKey?.()
      else if(action.type==='notes')ui.onOpenNotes?.()
      else if(action.type==='shelf')ui.onGenre?.(action.genre)
      else if(action.type==='travel')ui.onTravel?.(action.to)
      else if(action.type==='read')ui.onRead?.(ui.heldBook)
    }
    const keyDown=e=>{
      const ui=status.current
      if(ui.blocked||ui.mode==='overview'||e.target?.matches?.('input,textarea,select,[contenteditable]'))return
      if(MOVE.includes(e.code)){e.preventDefault();s.keys.add(e.code)}
      if(e.code==='KeyE'&&!e.repeat){e.preventDefault();interact()}
    }
    const keyUp=e=>s.keys.delete(e.code)
    const reset=()=>{s.keys.clear();s.pointer=null}
    const down=e=>{
      if(e.button!==0||status.current.blocked||status.current.mode==='overview')return
      Object.assign(s,{pointer:e.pointerId,lx:e.clientX,ly:e.clientY})
    }
    const move=e=>{
      if(s.pointer!==e.pointerId||status.current.blocked)return
      s.yaw-=(e.clientX-s.lx)*.004
      s.pitch=THREE.MathUtils.clamp(s.pitch-(e.clientY-s.ly)*.004,-.83,.83)
      s.lx=e.clientX;s.ly=e.clientY
    }
    const up=e=>{if(s.pointer===e.pointerId)s.pointer=null}
    const posture=e=>{if(s.seated?.phase==='seated'&&s.seated.seat.id==='attic-daybed'){s.seated={...s.seated,posture:e.detail==='lying'?'lying':'sitting'};s.yaw=e.detail==='lying'?0:-s.seated.seat.turn-.4;s.pitch=0}}
    window.addEventListener('library-seat-pose',posture)
    window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp)
    window.addEventListener('blur',reset)
    window.addEventListener('library-interact',interact)
    canvas.addEventListener('pointerdown',down)
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)
    return ()=>{
      window.removeEventListener('library-seat-pose',posture)
      window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp)
      window.removeEventListener('blur',reset)
      window.removeEventListener('library-interact',interact)
      canvas.removeEventListener('pointerdown',down)
      window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up)
    }
  },[gl])
  useEffect(()=>{
    if(blocked){state.current.keys.clear();state.current.pointer=null}
  },[blocked])
  useFrame(({camera},dt)=>{
    const s=state.current
    const keys=s.keys
    const active=mode!=='overview'
    const direction=(positive,negative)=>Number(positive.some(key=>keys.has(key)))-Number(negative.some(key=>keys.has(key)))
    const front=active&&!blocked?direction(['KeyW','ArrowUp'],['KeyS','ArrowDown'])+(joy.y||0):0
    const side=active&&!blocked?direction(['KeyD','ArrowRight'],['KeyA','ArrowLeft'])+(joy.x||0):0
    const world={end:layout.end,gateReady,entranceOpen,ladders,studyDoor,glassDoor}
    if(tour.current?.running&&!blocked){
      advanceFurnitureTour(tour.current,s,world,dt)
      if(!tour.current.running)Object.assign(s,tour.current.saved,{seated:null})
    }
    advanceLadders(ladders,dt,s)
    if(s.level===0&&s.z<-15.5)visitedSecret.current=true
    if(visitedSecret.current&&s.z>-13.1&&!tour.current?.running){visitedSecret.current=false;onCloseSecret()}
    const len=s.seated||tour.current?.running?0:Math.hypot(front,side)
    const viewYaw=s.yaw+(s.seated&&mode==='first'?Math.PI:0)
    const sin=Math.sin(viewYaw),cos=Math.cos(viewYaw)
    moving.current=len>.1||(tour.current?.running&&tour.current.phase==='approach')
    if(len>.1) {
      const step=3.6*Math.min(dt,.05),direction=movementVector(viewYaw,front,side)
      const beforeX=s.x,beforeZ=s.z
      Object.assign(s,movePlayer(s,direction.x*step,direction.z*step,world))
      s.bodyYaw=facingForMovement(s.bodyYaw,s.x-beforeX,s.z-beforeZ,dt)
    }
    const action=interactionAt(s,status.current)
    const hint=active&&!blocked?(action?.label||''):''
    if(hint!==lastHint.current){lastHint.current=hint;onInteraction?.(hint,action?.type||null)}
    let visualY=s.level
    if(s.seated){
      const oldSeat=s.seated
      const result=advanceSeating(oldSeat,dt)
      pose.current=result.pose
      s.x=result.pose.x;s.z=result.pose.z;visualY=result.pose.y
      avatar.current.rotation.y=result.pose.rotation
      s.seated=result.seating
      s.bodyYaw=result.pose.rotation
      if(!s.seated){s.keys.clear()}
    }else{
      pose.current={amount:0}
      avatar.current.rotation.y=mode==='first'?-s.yaw:s.bodyYaw
    }
    avatar.current.rotation.order='YXZ'
    avatar.current.rotation.x=pose.current.recline||0
    avatar.current.position.set(s.x,visualY*WORLD_HEIGHT_SCALE,s.z)
    const seatText=s.seated?`${s.seated.seat.label} · ${s.seated.phase==='entering'?'앉는 중':s.seated.phase==='leaving'?'일어나는 중':s.seated.posture==='lying'?'누워 읽기':heldBook?'독서 중':'휴식 중'}`:''
    if(seatText!==lastSeatStatus.current){lastSeatStatus.current=seatText;onSeatStatus?.(seatText)}
    const zone=floorName(s.x,s.z,s.level)||zoneAt(s.x,s.z)
    if(zone!==currentZone.current){currentZone.current=zone;onZone(zone)}
    if(!active){avatar.current.visible=false;return}
    let follow=0
    const desiredYaw=s.yaw+(s.seated&&mode==='first'?Math.PI:0)
    cameraYaw.current+=Math.atan2(Math.sin(desiredYaw-cameraYaw.current),Math.cos(desiredYaw-cameraYaw.current))*(1-Math.exp(-7*Math.min(dt,.1)))
    const cameraSin=Math.sin(cameraYaw.current),cameraCos=Math.cos(cameraYaw.current)
    eye.set(s.x,visualY*WORLD_HEIGHT_SCALE+1.65-.65*pose.current.amount-.65*(pose.current.recline||0)/(Math.PI/2),s.z)
    if(mode==='third'){
      rayDirection.set(-cameraSin,pose.current.recline>.1?1:.32,cameraCos).normalize()
      ray.set(eye,rayDirection);ray.far=6.15;ray.near=.12
      const check=occlusion.current
      check.elapsed+=dt
      // Keep camera interpolation at display rate, expensive mesh checks at 30 Hz.
      if(check.elapsed>=1/30){
        check.elapsed=0
        check.hits.length=0
        ray.intersectObjects(collectCameraObstacles(scene,check.objects),false,check.hits)
        const hit=check.hits[0]
        check.safe=hit?Math.max(0,hit.distance-.35):6
      }
      const safe=check.safe
      cameraDistance.current=safe<cameraDistance.current?safe:THREE.MathUtils.damp(cameraDistance.current,safe,8,dt)
      follow=cameraDistance.current
    }
    avatar.current.visible=mode==='third'&&follow>1.05
    camera.position.copy(eye).addScaledVector(rayDirection,follow)

    look.set(s.x+cameraSin*5,eye.y+s.pitch*5,s.z-cameraCos*5)
    if(mode==='third')look.lerp(target.set(s.x,visualY*WORLD_HEIGHT_SCALE+.8+s.pitch,s.z),pose.current.amount)
    if(mode==='third'&&pose.current.recline>.1)look.copy(eye)
    const desiredFov=mode==='third'?73:69
    if(Math.abs(camera.fov-desiredFov)>.05){camera.fov=THREE.MathUtils.damp(camera.fov,desiredFov,7,dt);camera.updateProjectionMatrix()}
    camera.lookAt(look)
  })
  return <group ref={avatar} userData={{player:true}} visible={mode==='third'}>
    {blanket&&<LoungeBlanket lap pose={pose}/>}
    <Suspense fallback={null}><AvatarModels character={character} moving={moving} pose={pose} book={books.find(b=>b.id===heldBook) || (keyHeld ? {color:'#94704b',isKey:true} : null)}/></Suspense>
  </group>
}
function Overhead({end}) {
  const {size}=useThree()
  const ref=useRef()
  useEffect(()=>{
    ref.current.up.set(0,0,-1)
    ref.current.lookAt((end-19)/2,0,-6)
  },[end,size.width,size.height])
  const zoom=Math.min(size.width/(end+23),size.height/41)
  return <OrthographicCamera ref={ref} makeDefault position={[(end-19)/2,65,-6]} zoom={zoom} near={.1} far={180}/>
}
export default function ArchiveScene({blanket,onBlanket,onMusic,onExperience,books=[],placements={},canPlace=false,onPlaceNearby,onPick,onGenre,mode='third',weather,time,blocked,joy,onZone,teleport,onDoor,character,heldBook,season,onOpenNotes,onKeyHeld,keyHeld,onInteraction,onRead,onSeatStatus}) {
  const glassDoor=useMemo(()=>({open:false,amount:0}),[])
  const studyDoor=useMemo(()=>({open:false,amount:0}),[])
  const [localZone,setLocalZone]=useState('저택 정원')
  const reportZone=zone=>{setLocalZone(zone);onZone(zone)}
  const outside=['저택 정원','현관'].includes(localZone)
  const inGreenhouse=localZone==='실내 온실'
  const inLounge=['벽난로 라운지','열람실','다락방'].includes(localZone)
  const upperVisible=['중앙 계단','2층 갤러리','열람실','실내 온실','다락 계단'].includes(localZone)
  const nearAttic=['중앙 계단','2층 갤러리','열람실','실내 온실','다락 계단','다락방'].includes(localZone)
  const [atticLoaded,setAtticLoaded]=useState(false)
  useEffect(()=>{if(nearAttic)setAtticLoaded(true)},[nearAttic])
  const [open,setOpen]=useState(false)
  const [gateReady,setGateReady]=useState(false)
  const [entranceOpen,setEntranceOpen]=useState(false)
  const layout=useMemo(()=>makeStacks(books,placements),[books,placements])
  const ladders=useMemo(()=>makeLadders(layout),[layout])
  const decorTime=['evening','night'].includes(time)?'evening':'afternoon'
  const map=mode==='overview'
  const showInterior=map||entranceOpen||localZone!=='저택 정원'
  const [interiorLoaded,setInteriorLoaded]=useState(false)
  useEffect(()=>{if(showInterior)setInteriorLoaded(true)},[showInterior])
  const unlock=()=>{if(!open){setOpen(true);onKeyHeld()}}
  return <Canvas frameloop={blocked?'demand':'always'} camera={{fov:69,near:.065,far:190,position:[0,2,25]}} shadows dpr={1} gl={{powerPreference:'high-performance'}}>
    <color attach="background" args={[({morning:'#b9ced0',afternoon:'#becbc0',evening:'#708097',night:'#182438'})[time]]}/>
    {!map&&<fog attach="fog" args={[decorTime==='evening'?'#928b84':'#cbbfa7',31,105]}/>}
    <ambientLight color={time==='night'?'#829bc2':time==='morning'?'#fff1d5':'#ffffff'} intensity={inGreenhouse?(time==='night'?.12:weather==='sunny'?.25:.4):inLounge?(decorTime==='evening'?.22:.4):(decorTime==='evening'?(outside?.27:.65):.97)}/>
    <hemisphereLight args={['#fff1d8','#7a6655',inGreenhouse?(time==='night'?.18:.45):inLounge?(decorTime==='evening'?.38:.7):(decorTime==='evening'?(outside?.48:1.05):1.68)]}/>
    <directionalLight color={time==='night'?'#95afd8':time==='morning'?'#ffe5bc':'#ffffff'} position={time==='morning'?[12,12,8]:[-10,18,9]} intensity={inGreenhouse?0:inLounge?.65:(decorTime==='evening'?(outside?.45:1):2.15)}/>
    <group scale={[1,WORLD_HEIGHT_SCALE,1]}>
    {!map&&<><WorldAdditions weather={weather} time={decorTime} entranceOpen={entranceOpen} onEntranceToggle={setEntranceOpen} season={season}/><Suspense fallback={null}><FacadeModel visible={outside}/></Suspense></>}
    {(showInterior||interiorLoaded)&&<group visible={showInterior}>
    <GroundFloor event={season} sceneTime={time} heldBook={heldBook} map={map} layout={layout} weather={weather} time={decorTime} open={open} onKey={unlock} onReady={()=>setGateReady(true)} onGenre={onGenre} onPick={onPick} onNote={onOpenNotes}/>
    {!map&&<>
      <StaticBatch revision={decorTime}><Mezzanine time={decorTime}/></StaticBatch><group visible={upperVisible}><Greenhouse active={localZone==='실내 온실'} door={glassDoor} time={time} weather={weather} event={season}/></group><TallStacks layout={layout} ladders={ladders} time={time} weather={weather} event={season}/><InteractiveProps onOpen={onExperience} secretOpen={open}/>
      {!blanket&&<LoungeBlanket onClick={e=>{e.stopPropagation();onBlanket()}}/>}
      <StaticBatch><InteriorDetails/></StaticBatch><AtmosphereDetails time={time} weather={weather} event={season} secretOpen={open}/>
      <StaticBatch><LibraryDetails/></StaticBatch><MainRoomDetails layout={layout} time={decorTime} zone={localZone}/><StaticBatch revision={decorTime}><HallDetails time={decorTime}/></StaticBatch>
      <SecretDetails open={open} time={decorTime}/><StudyRoom open={open} prepare={localZone==='북쪽 복도'} door={studyDoor} time={time} weather={weather} event={season} onNotes={onOpenNotes} onMusic={onMusic}/><PlacedBooks books={books} placements={placements} heldBook={heldBook} onPick={onPick}/>
      {(nearAttic||atticLoaded)&&<group visible={nearAttic} position={[-11.45,0,0]} scale={[ATTIC_EXPANSION,1,1]}><group position={[11.45,0,0]}><Suspense fallback={null}><AtticGLB time={time} weather={weather} event={season}/></Suspense></group></group>}<PaperSpirits/>
    </>}
    </group>}</group><Weather weather={weather}/>
    <WalkControl blanket={blanket} onBlanket={onBlanket} glassDoor={glassDoor} studyDoor={studyDoor} onMusic={onMusic} ladders={ladders} onExperience={onExperience} onCloseSecret={()=>{setOpen(false);setGateReady(false);studyDoor.open=false}} mode={mode} blocked={blocked} joy={joy} books={books} onZone={reportZone} teleport={teleport} character={character} heldBook={heldBook} keyHeld={keyHeld} layout={layout} entranceOpen={entranceOpen} gateReady={gateReady} onKey={unlock} onInteraction={onInteraction} onToggleEntrance={setEntranceOpen} onOpenNotes={onOpenNotes} onGenre={onGenre} onTravel={onDoor} onRead={onRead} canPlace={canPlace} onPlaceNearby={onPlaceNearby} onSeatStatus={onSeatStatus}/>
    <SceneBudget/>
    {profiling&&<FrameProfiler/>}
    {map&&<Overhead end={layout.end}/>}
  </Canvas>
}
