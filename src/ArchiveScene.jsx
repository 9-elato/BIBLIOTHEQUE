import {THIRD_PERSON_ELEVATION} from './upperArchitecture'
import DriftingClouds from './DriftingClouds'
import {sceneLighting} from './natureMood'
import Basement from './Basement'
import {EastMeadow} from './EastMeadow'
import EstateLandscape from './EstateLandscape'
import SeaVeranda from './SeaVeranda'
import {tourEnabled} from './FurnitureTourPanel'
import {createFurnitureTour,advanceFurnitureTour} from './furnitureTour'
import StaticBatch from './StaticBatch'
import SceneBudget from './SceneBudget'
import {profiling,FrameProfiler} from './PerformancePanel'
import LoungeBlanket from './LoungeBlanket'
import {toggleGlassDoor} from './greenhouseLayout'
import StudyRoom from './StudyRoom'
import {toggleStudyDoor} from './studyLayout'
import {movementVector,facingForMovement,frontViewYaw} from './cameraMovement'
import {ATTIC_EXPANSION,ATTIC_SCREEN_TARGET} from './atticLayout'
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
import {createHintScheduler} from './interactionScheduler'
import {startInteractionTrace} from './interactionMetrics'
import {toggleVerandaDoor} from './doorMotion'
import PlacedBooks from './PlacedBooks'
import LibraryDetails from './LibraryDetails'
import MainRoomDetails from './MainRoomDetails'
import {HallDetails} from './RoomDetails'
import {startSitting,startStanding,advanceSeating} from './seating'

const MOVE=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']
const AtticGLB=lazy(()=>import('./AtticGLB'))
function WalkControl({entranceDoor,playerPosition,verandaDoor,blanket,onBlanket,glassDoor,studyDoor,onMusic,ladders,onExperience,onCloseSecret,mode,blocked,joy,books,onZone,teleport,character,heldBook,layout,entranceOpen,gateReady,gateOpening,onKey,onInteraction,onToggleEntrance,onOpenNotes,onGenre,onTravel,onRead,canPlace,onPlaceNearby,onSeatStatus}) {
  const {gl,scene}=useThree()
  const ray=useMemo(()=>new THREE.Raycaster(),[])
  const rayDirection=useMemo(()=>new THREE.Vector3(),[])
  const eye=useMemo(()=>new THREE.Vector3(),[])
  const cameraDistance=useRef(6)
  const occlusion=useRef({elapsed:1,safe:6,objects:[],hits:[],eye:new THREE.Vector3(),direction:new THREE.Vector3(),zone:null})
  const cameraYaw=useRef(0)
  const avatar=useRef()
  const moving=useRef(false)
  const visitedSecret=useRef(false)
  const pose=useRef({amount:0})
  const lastSeatStatus=useRef('')
  const currentZone=useRef('')
  const lastHint=useRef('')
  const hintScheduler=useMemo(()=>createHintScheduler(),[])
  const state=useRef({x:0,z:23,level:0,yaw:0,bodyYaw:0,pitch:0,keys:new Set(),pointer:null,lx:0,ly:0,seated:false})
  const touch=useRef(new Map())
  const zoom=useRef(1)
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
  status.current={onMusic,onExperience,onBlanket,gateOpening,blocked,mode,onKey,gateReady,onToggleEntrance,onOpenNotes,onGenre,entranceOpen,onTravel,onRead,bookcases,heldBook,canPlace,onPlaceNearby,world:{end:layout.end,gateReady,entranceOpen,entranceDoor,ladders,studyDoor,glassDoor,verandaDoor}}
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
      const trace=profiling?startInteractionTrace({now:()=>performance.now(),requestFrame:callback=>requestAnimationFrame(callback),visible:()=>document.visibilityState==='visible',publish:detail=>window.dispatchEvent(new CustomEvent('library-interaction-result',{detail}))},{x:s.x,z:s.z,level:s.level}):null
      try{
      const action=interactionAt(s,ui)
      trace?.resolved(action?.type)
      hintScheduler.invalidate()
      if(!action)return
      s.keys.clear()
      if(action.type==='place')ui.onPlaceNearby?.(action.target)
      else if(action.type==='stand')s.seated=startStanding(s.seated,ui.world)
      else if(action.type==='seat'){const sitting=startSitting(s,action.seat,ui.world);if(sitting){s.skyGaze=false;s.seated=sitting;s.yaw=-action.seat.turn-.4;s.pitch=0}}
      else if(action.type==='door'){
        // Do not swing the door through a visitor standing in its sweep.
        if(ui.entranceOpen&&s.z>10.1&&s.z<12.05&&Math.abs(s.x)<1.8)return
        ui.onToggleEntrance?.(!ui.entranceOpen)
      }
      else if(action.type==='gardenWater')window.dispatchEvent(new Event('greenhouse-water-toggle'))
      else if(action.type==='glassDoor')toggleGlassDoor(ui.world.glassDoor,s)
      else if(action.type==='studyDoor')toggleStudyDoor(ui.world.studyDoor,s)
      else if(action.type==='studyLamp')window.dispatchEvent(new Event('study-lamp-toggle'))
      else if(action.type==='verandaDoor')toggleVerandaDoor(ui.world.verandaDoor,s)
      else if(action.type==='music')ui.onMusic?.()
      else if(action.type==='ladder')toggleLadder(action.ladder)
      else if(action.type==='telescope'||action.type==='board')ui.onExperience(action.type)
      else if(action.type==='minigame')ui.onExperience(action.game)
      else if(action.type==='blanket')ui.onBlanket()
      else if(action.type==='key')ui.onKey?.()
      else if(action.type==='notes')ui.onOpenNotes?.()
      else if(action.type==='shelf')ui.onGenre?.(action.genre)
      else if(action.type==='travel')ui.onTravel?.(action.to)
      else if(action.type==='read')ui.onRead?.(ui.heldBook)
      }finally{trace?.finish()}
    }
    const keyDown=e=>{
      const ui=status.current
      if(ui.blocked||ui.mode==='overview'||e.target?.matches?.('input,textarea,select,[contenteditable]'))return
      if(MOVE.includes(e.code)||e.code==='ShiftLeft'||e.code==='ShiftRight'){e.preventDefault();s.keys.add(e.code)}
      if(e.code==='KeyV'&&!e.repeat&&['meadow-rest','terrace-sofa'].includes(s.seated?.seat.id))s.skyGaze=!s.skyGaze
      if(e.code==='KeyE'&&!e.repeat){e.preventDefault();interact()}
      if(e.code==='KeyF'&&!e.repeat&&!tour.current?.running){
        e.preventDefault()
        const facing=ui.mode==='first'&&!s.seated?-s.yaw:s.bodyYaw
        s.bodyYaw=facing;s.yaw=frontViewYaw(facing);s.pitch=-.05
        s.keys.clear();s.pointer=null
        window.dispatchEvent(new Event('library-third-person'))
      }
    }
    const keyUp=e=>s.keys.delete(e.code)
    const reset=()=>{s.keys.clear();s.pointer=null;touch.current.clear()}
    const canZoom=()=>!status.current.blocked&&status.current.mode!=='overview'
    const applyZoom=factor=>{zoom.current=THREE.MathUtils.clamp(zoom.current*factor,.8,2.6)}
    const touchDistance=()=>{
      const [a,b]=touch.current.values()
      return a&&b?Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY):0
    }
    const down=e=>{
      if(e.button!==0||status.current.blocked||status.current.mode==='overview')return
      if(e.pointerType==='touch'){
        touch.current.set(e.pointerId,e)
        if(touch.current.size>1){s.pointer=null;return}
      }
      Object.assign(s,{pointer:e.pointerId,lx:e.clientX,ly:e.clientY})
    }
    const move=e=>{
      if(touch.current.has(e.pointerId)){
        const before=touchDistance()
        touch.current.set(e.pointerId,e)
        if(touch.current.size>1){
          const after=touchDistance()
          if(canZoom()&&before>4&&after>4)applyZoom(after/before)
          return
        }
      }
      if(s.pointer!==e.pointerId||status.current.blocked)return
      s.yaw-=(e.clientX-s.lx)*.004
      s.pitch=THREE.MathUtils.clamp(s.pitch-(e.clientY-s.ly)*.004,-.83,.83)
      s.lx=e.clientX;s.ly=e.clientY
    }
    const up=e=>{touch.current.delete(e.pointerId);if(s.pointer===e.pointerId)s.pointer=null}
    const wheel=e=>{
      if(!e.ctrlKey||!canZoom())return
      e.preventDefault()
      const scale=e.deltaMode===1?16:e.deltaMode===2?100:1
      applyZoom(Math.exp(THREE.MathUtils.clamp(-e.deltaY*scale*.012,-.35,.35)))
    }
    let gestureZoom=1
    const gestureStart=e=>{if(canZoom()){e.preventDefault();gestureZoom=zoom.current}}
    const gestureChange=e=>{
      if(!canZoom())return
      e.preventDefault()
      if(touch.current.size<2)zoom.current=THREE.MathUtils.clamp(gestureZoom*e.scale,.8,2.6)
    }
    const skyView=()=>{if(['meadow-rest','terrace-sofa'].includes(s.seated?.seat.id))s.skyGaze=!s.skyGaze}
    window.addEventListener('library-meadow-sky',skyView)
    const posture=e=>{if(s.seated?.phase==='seated'&&s.seated.seat.id==='attic-daybed'){s.seated={...s.seated,posture:['lying','cinema'].includes(e.detail)?'lying':'sitting'};s.cinema=e.detail==='cinema';s.yaw=e.detail==='lying'?0:-s.seated.seat.turn-.4;s.pitch=0}}
    window.addEventListener('library-seat-pose',posture)
    window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp)
    window.addEventListener('blur',reset)
    window.addEventListener('library-interact',interact)
    canvas.addEventListener('pointerdown',down)
    canvas.addEventListener('wheel',wheel,{passive:false})
    canvas.addEventListener('gesturestart',gestureStart,{passive:false})
    canvas.addEventListener('gesturechange',gestureChange,{passive:false})
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)
    return ()=>{
      window.removeEventListener('library-seat-pose',posture)
      window.removeEventListener('library-meadow-sky',skyView)
      window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp)
      window.removeEventListener('blur',reset)
      window.removeEventListener('library-interact',interact)
      canvas.removeEventListener('pointerdown',down)
      canvas.removeEventListener('wheel',wheel)
      canvas.removeEventListener('gesturestart',gestureStart)
      canvas.removeEventListener('gesturechange',gestureChange)
      window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up)
    }
  },[gl])
  useEffect(()=>{
    if(blocked){state.current.keys.clear();state.current.pointer=null;touch.current.clear()}
  },[blocked])
  useFrame(({camera},dt)=>{
    const s=state.current
    const keys=s.keys
    const active=mode!=='overview'
    const direction=(positive,negative)=>Number(positive.some(key=>keys.has(key)))-Number(negative.some(key=>keys.has(key)))
    const front=active&&!blocked?direction(['KeyW','ArrowUp'],['KeyS','ArrowDown'])+(joy.y||0):0
    const side=active&&!blocked?direction(['KeyD','ArrowRight'],['KeyA','ArrowLeft'])+(joy.x||0):0
    const world={end:layout.end,gateReady,entranceOpen,entranceDoor,ladders,studyDoor,glassDoor,verandaDoor}
    if(tour.current?.running&&!blocked){
      advanceFurnitureTour(tour.current,s,world,dt)
      if(!tour.current.running&&!tour.current.preservePosition)Object.assign(s,tour.current.saved,{seated:null})
    }
    advanceLadders(ladders,dt,s)
    if(s.level===0&&Math.abs(s.x)<7&&s.z<-15.5)visitedSecret.current=true
    if(visitedSecret.current&&s.x<7.65&&s.z>-13.1&&!tour.current?.running){visitedSecret.current=false;onCloseSecret()}
    const len=s.seated||tour.current?.running?0:Math.hypot(front,side)
    const viewYaw=s.yaw+(s.seated&&mode==='first'?Math.PI:0)
    const sin=Math.sin(viewYaw),cos=Math.cos(viewYaw)
    moving.current=len>.1||(tour.current?.running&&tour.current.phase==='approach')
    if(len>.1) {
      const step=(s.z>32&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||Math.hypot(joy.x||0,joy.y||0)>.9)?6.4:3.6)*Math.min(dt,.05),direction=movementVector(viewYaw,front,side)
      const beforeX=s.x,beforeZ=s.z
      Object.assign(s,movePlayer(s,direction.x*step,direction.z*step,world))
      s.bodyYaw=facingForMovement(s.bodyYaw,s.x-beforeX,s.z-beforeZ,dt)
    }
    const action=hintScheduler.next(dt,active&&!blocked,()=>interactionAt(s,status.current))
    const hint=active&&!blocked?(action?.label||''):''
    const hintKey=hint+'|'+(action?.type||'')
    if(hintKey!==lastHint.current){lastHint.current=hintKey;onInteraction?.(hint,action?.type||null)}
    let visualY=s.level
    if(s.seated){
      const oldSeat=s.seated
      const result=advanceSeating(oldSeat,dt,world)
      pose.current=result.pose
      moving.current=moving.current||Boolean(result.pose.walking)
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
    Object.assign(playerPosition.current,{x:s.x,z:s.z,level:s.level})
    const seatText=s.seated?`${s.seated.seat.label} · ${s.seated.transitionBlocked?'이동 공간 대기 중':s.seated.phase==='floorExit'?'안전한 경로로 나오는 중':s.seated.phase==='entering'?'앉는 중':s.seated.phase==='leaving'?'일어나는 중':s.seated.seat.id==='meadow-rest'?'하늘 구경 중':s.seated.posture==='lying'?'누워 읽기':heldBook?'독서 중':'휴식 중'}`:''
    if(seatText!==lastSeatStatus.current){lastSeatStatus.current=seatText;onSeatStatus?.(seatText)}
    const zone=s.z>32?'잔디 동산':floorName(s.x,s.z,s.level)||zoneAt(s.x,s.z)
    if(zone!==currentZone.current){currentZone.current=zone;onZone(zone)}
    if(!active){avatar.current.visible=false;return}
    let follow=0
    const desiredYaw=s.yaw+(s.seated&&mode==='first'?Math.PI:0)
    cameraYaw.current+=Math.atan2(Math.sin(desiredYaw-cameraYaw.current),Math.cos(desiredYaw-cameraYaw.current))*(1-Math.exp(-7*Math.min(dt,.1)))
    const cameraSin=Math.sin(cameraYaw.current),cameraCos=Math.cos(cameraYaw.current)
    eye.set(s.x,visualY*WORLD_HEIGHT_SCALE+1.65-.65*pose.current.amount-.65*(pose.current.recline||0)/(Math.PI/2),s.z)
    if(mode==='third'){
      rayDirection.set(-cameraSin,pose.current.recline>.1?1:Math.tan(THIRD_PERSON_ELEVATION),cameraCos).normalize()
      ray.set(eye,rayDirection);ray.far=6.15;ray.near=.12
      const check=occlusion.current
      check.elapsed+=dt
      const changed=check.eye.distanceToSquared(eye)>.0001||check.direction.distanceToSquared(rayDirection)>.00001
      // Check promptly while moving; stationary views still check animated doors.
      if(check.zone!==zone||check.elapsed>=(changed?1/30:1/8)){
        check.elapsed=0
        check.zone=zone
        check.eye.copy(eye);check.direction.copy(rayDirection)
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
    if(mode==='third')look.set(s.x,eye.y+s.pitch*3,s.z)
    if(mode==='third'&&pose.current.recline>.1)look.copy(eye)
    if(s.skyGaze&&['meadow-rest','terrace-sofa'].includes(s.seated?.seat.id)&&s.seated.phase==='seated'){camera.position.set(s.x,visualY+.35,s.z);if(s.seated.seat.id==='terrace-sofa')look.set(s.x,visualY+8,s.z+4);else look.set(s.x+Math.sin(s.yaw)*4,visualY+8,s.z-Math.cos(s.yaw)*4);avatar.current.visible=false}
    if(s.cinema&&s.seated?.posture==='lying'){camera.position.copy(eye);look.set(ATTIC_SCREEN_TARGET[0],ATTIC_SCREEN_TARGET[1]*WORLD_HEIGHT_SCALE,ATTIC_SCREEN_TARGET[2])}
    const baseFov=mode==='third'?73:69
    const desiredFov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(baseFov/2))/zoom.current))
    if(Math.abs(camera.fov-desiredFov)>.05){camera.fov=THREE.MathUtils.damp(camera.fov,desiredFov,7,dt);camera.updateProjectionMatrix()}
    camera.lookAt(look)
  })
  return <group ref={avatar} userData={{player:true}} visible={mode==='third'}>
    {blanket&&<LoungeBlanket lap pose={pose}/>}
    <Suspense fallback={null}><AvatarModels character={character} moving={moving} pose={pose} book={books.find(b=>b.id===heldBook) || null}/></Suspense>
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
function ArchiveScene({blanket,onBlanket,onMusic,onExperience,books=[],placements={},canPlace=false,onPlaceNearby,onPick,onGenre,mode='third',weather,time,blocked,joy,onZone,teleport,onDoor,character,heldBook,season,onOpenNotes,onInteraction,onRead,onSeatStatus}) {
  const playerPosition=useRef({x:0,z:23,level:0})
  const entranceDoor=useMemo(()=>({open:false,amount:0}),[])
  const verandaDoor=useMemo(()=>({open:false,amount:0}),[])
  const glassDoor=useMemo(()=>({open:false,amount:0}),[])
  const studyDoor=useMemo(()=>({open:false,amount:0}),[])
  const [localZone,setLocalZone]=useState('저택 정원')
  const reportZone=zone=>{setLocalZone(zone);onZone(zone)}
  const outside=['저택 정원','현관','잔디 동산'].includes(localZone)
  const inGreenhouse=localZone==='실내 온실'
  const inLounge=['지하 숲 라운지','숲 온천','지하 계단','벽난로 라운지','열람실','다락방'].includes(localZone)
  const upperVisible=['중앙 계단','2층 갤러리','열람실','실내 온실','다락 계단','동쪽 잔디 들판','온실 계단'].includes(localZone)
  const nearAttic=['중앙 계단','2층 갤러리','열람실','실내 온실','다락 계단','다락방','별빛 테라스'].includes(localZone)
  const [atticLoaded,setAtticLoaded]=useState(false)
  useEffect(()=>{if(nearAttic)setAtticLoaded(true)},[nearAttic])
  const [open,setOpen]=useState(false)
  const [gateReady,setGateReady]=useState(false)
  const [entranceOpen,setEntranceOpen]=useState(false)
  const layout=useMemo(()=>makeStacks(books,placements),[books,placements])
  const ladders=useMemo(()=>makeLadders(layout),[layout])
  const decorTime=['evening','night'].includes(time)?'evening':'afternoon'
  const map=mode==='overview'
  const showInterior=map||(entranceOpen&&localZone!=='잔디 동산')||!['저택 정원','잔디 동산'].includes(localZone)
  const [interiorLoaded,setInteriorLoaded]=useState(false)
  useEffect(()=>{if(showInterior)setInteriorLoaded(true)},[showInterior])
  const unlock=()=>{if(!open)setOpen(true)}
  const light=sceneLighting({time,weather,outside,greenhouse:inGreenhouse,cozy:inLounge})
  return <Canvas frameloop={blocked?'demand':'always'} camera={{fov:69,near:.065,far:190,position:[0,2,25]}} shadows dpr={1} gl={{powerPreference:'high-performance'}}>
    <color attach="background" args={[light.sky]}/><DriftingClouds time={time} weather={weather}/>
    {!map&&<fog attach="fog" args={[light.fog,light.fogNear,light.fogFar]}/>}
    <ambientLight color={light.evening?'#b9c5d4':'#f4f0e2'} intensity={light.ambient}/>
    <hemisphereLight args={[light.sky,'#665b48',light.hemisphere]}/>
    <directionalLight color={light.sun} position={light.evening?[-18,11,9]:[-10,18,9]} intensity={light.direct}/>
    <group scale={[1,WORLD_HEIGHT_SCALE,1]}><EstateLandscape time={time} weather={weather}/><EastMeadow studyOpen={gateReady}/><Basement time={time} visible={outside||map||['중앙 홀','서가','지하 계단','지하 숲 라운지','숲 온천'].includes(localZone)}/>
    {!map&&<><WorldAdditions entranceDoor={entranceDoor} playerPosition={playerPosition} weather={weather} time={decorTime} entranceOpen={entranceOpen} onEntranceToggle={setEntranceOpen} season={season}/><Suspense fallback={null}><FacadeModel visible={outside} time={time} weather={weather}/></Suspense></>}
    {(showInterior||interiorLoaded)&&<group visible={showInterior}>
    <SeaVeranda playerPosition={playerPosition} door={verandaDoor} time={time} weather={weather} onExperience={onExperience}/><GroundFloor event={season} sceneTime={time} heldBook={heldBook} map={map} layout={layout} weather={weather} time={decorTime} open={open} onKey={unlock} onReady={()=>setGateReady(true)} onGenre={onGenre} onPick={onPick} onNote={onOpenNotes}/>
    {!map&&<>
      <StaticBatch revision={decorTime}><Mezzanine time={decorTime}/></StaticBatch><group visible={upperVisible}><Greenhouse playerPosition={playerPosition} active={localZone==='실내 온실'} door={glassDoor} time={time} weather={weather} event={season}/></group><TallStacks layout={layout} ladders={ladders} time={time} weather={weather} event={season}/><InteractiveProps onOpen={onExperience} secretOpen={open}/>
      {!blanket&&<LoungeBlanket onClick={e=>{e.stopPropagation();onBlanket()}}/>}
      <StaticBatch><InteriorDetails/></StaticBatch><AtmosphereDetails time={time} weather={weather} event={season} secretOpen={open}/>
      <StaticBatch><LibraryDetails/></StaticBatch><MainRoomDetails layout={layout} time={decorTime} zone={localZone}/><StaticBatch revision={decorTime}><HallDetails time={decorTime}/></StaticBatch>
      <SecretDetails open={open} prepare={localZone==='북쪽 복도'} time={decorTime}/><StudyRoom playerPosition={playerPosition} open={open} prepare={localZone==='북쪽 복도'} door={studyDoor} time={time} weather={weather} event={season} onNotes={onOpenNotes} onMusic={onMusic}/><PlacedBooks books={books} placements={placements} heldBook={heldBook} onPick={onPick}/>
      {(nearAttic||atticLoaded)&&<group visible={nearAttic} position={[-11.45,0,0]} scale={[ATTIC_EXPANSION,1,1]}><group position={[11.45,0,0]}><Suspense fallback={null}><AtticGLB time={time} weather={weather} event={season}/></Suspense></group></group>}<PaperSpirits playerPosition={playerPosition}/>
    </>}
    </group>}</group><Weather weather={weather}/>
    <WalkControl entranceDoor={entranceDoor} playerPosition={playerPosition} verandaDoor={verandaDoor} blanket={blanket} onBlanket={onBlanket} glassDoor={glassDoor} studyDoor={studyDoor} onMusic={onMusic} ladders={ladders} onExperience={onExperience} onCloseSecret={()=>{setOpen(false);setGateReady(false);studyDoor.open=false}} mode={mode} blocked={blocked} joy={joy} books={books} onZone={reportZone} teleport={teleport} character={character} heldBook={heldBook} layout={layout} entranceOpen={entranceOpen} gateReady={gateReady} gateOpening={open&&!gateReady} onKey={unlock} onInteraction={onInteraction} onToggleEntrance={setEntranceOpen} onOpenNotes={onOpenNotes} onGenre={onGenre} onTravel={onDoor} onRead={onRead} canPlace={canPlace} onPlaceNearby={onPlaceNearby} onSeatStatus={onSeatStatus}/>
    <SceneBudget/>
    {profiling&&<FrameProfiler/>}
    {map&&<Overhead end={layout.end}/>}
  </Canvas>
}

// HUD updates (including E/seat labels) must not reconcile the whole manor.
// Stable delegates always call the latest handler without freezing its closure.
const MemoArchiveScene=React.memo(ArchiveScene)
export default function StableArchiveScene(props){
 const latest=useRef(props);latest.current=props
 const handlers=useMemo(()=>Object.fromEntries(Object.keys(props).filter(k=>k.startsWith('on')).map(k=>[k,(...args)=>latest.current[k]?.(...args)])),[])
 return <MemoArchiveScene {...props} {...handlers}/>
}
