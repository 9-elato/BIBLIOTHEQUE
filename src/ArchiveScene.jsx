import {shortcutAllowed,shortcutAction} from './shortcuts'
import {applyCinemaAction,advanceCinemaSnack,cinemaSeatMotion} from './cinemaActions.js'
import {readCinemaKit} from './cinemaKitState'
import {recordStorage} from './recordStorage'
import CinemaKit from './CinemaKit'
import {cinemaCurtain} from './cafeExpansion'
import {findClickPathAsync,enteringCafe} from './clickNavigation'
import BookCafe from './BookCafe'
import VegetationSun from './VegetationSun'
import {useEnvironmentAudio} from './environmentAudio'

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
import {makeLadders,advanceLadders,toggleLadder,boardLadder,advanceRider} from './ladderSystem'
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
import {movePlayer,floorName,walkHeight} from './navigation'
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
  const {gl,scene,camera}=useThree()
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
  const autoWalk=useRef(null),tap=useRef(null),destination=useRef()
  const touch=useRef(new Map())
  const zoom=useRef(1)
  const tour=useRef(null)
  const status=useRef({})
  useEffect(()=>{
    if(!tourEnabled)return
    const publish=()=>window.dispatchEvent(new CustomEvent('library-tour-status',{detail:{running:Boolean(tour.current?.running),label:tour.current?.label,results:[...(tour.current?.results||[])]}}))
    const stop=()=>{if(tour.current?.running){Object.assign(state.current,tour.current.saved,{seated:null});state.current.keys.clear();tour.current.running=false;publish()}}
    const start=e=>{if(status.current.blocked||status.current.mode!=='third'||state.current.seated)return;stop();tour.current=createFurnitureTour(state.current,e.detail==='bed',status.current.world);publish()}
    const key=e=>{if(MOVE.includes(e.code)||e.code==='Escape')stop()}
    window.addEventListener('library-tour-start',start);window.addEventListener('library-tour-stop',stop);window.addEventListener('keydown',key)
    const timer=setInterval(publish,500)
    return()=>{clearInterval(timer);window.removeEventListener('library-tour-start',start);window.removeEventListener('library-tour-stop',stop);window.removeEventListener('keydown',key)}
  },[])
  const bookcases=useMemo(()=>layout.sections.flatMap(section=>section.cases.map(c=>({x:c.x,z:c.z,genre:section.genre.id,slot:(c.number-1)*24}))),[layout])
  status.current={blanket,onMusic,onExperience,onBlanket,gateOpening,blocked,mode,onKey,gateReady,onToggleEntrance,onOpenNotes,onGenre,entranceOpen,onTravel,onRead,bookcases,heldBook,canPlace,onPlaceNearby,world:{end:layout.end,gateReady,entranceOpen,entranceDoor,ladders,studyDoor,glassDoor,verandaDoor}}
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
      autoWalk.current=null;s.keys.clear();s.seated=null;if(s.ladder)s.ladder.item.occupied=false;s.ladder=null;pose.current={amount:0}
    }
  },[teleport])
  useEffect(()=>{
    const s=state.current
    if(s.level===0&&s.x>layout.end-.95){s.x=layout.end-1.2;s.z=0}
  },[layout.end])
  useEffect(()=>{
    const s=state.current
    const canvas=gl.domElement
    const cinemaAction=e=>{if(status.current.blocked||tour.current?.running)return;let kit;try{kit=readCinemaKit(recordStorage.getItem('mll-cinema-kit'))}catch{kit={}};applyCinemaAction(s.seated,e.detail,kit)}
    const interact=()=>{
      const ui=status.current
      if(ui.blocked||ui.mode==='overview'||tour.current?.running)return
      const trace=profiling?startInteractionTrace({now:()=>performance.now(),requestFrame:callback=>requestAnimationFrame(callback),visible:()=>document.visibilityState==='visible',publish:detail=>window.dispatchEvent(new CustomEvent('library-interaction-result',{detail}))},{x:s.x,z:s.z,level:s.level}):null
      try{
      autoWalk.current=null;const action=interactionAt(s,ui,true)
      trace?.resolved(action?.type)
      hintScheduler.invalidate()
      if(!action)return
      s.keys.clear()
      if(action.type==='place')ui.onPlaceNearby?.(action.target)
      else if(action.type==='stand')s.seated=startStanding(s.seated,ui.world)
      else if(action.type==='seat'){const sitting=action.sitting||startSitting(s,action.seat,ui.world);if(sitting){s.skyGaze=false;s.seated=sitting;s.yaw=-action.seat.turn-.4;s.pitch=0}}
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
      else if(action.type==='ladder')boardLadder(s,action.ladder,(x,z)=>walkHeight(x,z,0,ui.world)===0,(a,b)=>{const p=movePlayer(a,b.x-a.x,b.z-a.z,ui.world);return Math.hypot(p.x-b.x,p.z-b.z)<.01})
      else if(action.type==='ladderExit'){s.ladder.phase='descending';s.ladder.blocked=false}
      else if(action.type==='telescope'||action.type==='board')ui.onExperience(action.type)
      else if(action.type==='cinemaCurtain')cinemaCurtain.open=true
      else if(action.type==='cafePrivate')ui.onExperience({type:'cafe-sign',privateBooking:true,roomId:action.roomId})
      else if(action.type==='cinemaLobby')ui.onExperience({type:'cafe-sign',cinemaLobby:true})
      else if(action.type==='cafeMail')ui.onExperience('cafe-mail')
      else if(action.type==='cafeMenu')ui.onExperience('cafe-menu')
      else if(action.type==='cafeBooks')ui.onExperience('cafe-books')
      else if(action.type==='cafeGoods')ui.onExperience({type:'cafe-sign',goodsZone:true})
      else if(action.type==='cafe')ui.onExperience('cafe')
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
      if(ui.blocked||ui.mode==='overview'||!shortcutAllowed(e))return
      const command=shortcutAction(e)
      if(command==='close'){autoWalk.current=null;s.keys.clear();s.pointer=null;return}
      if(command==='read'&&ui.heldBook&&!s.seated?.seat.recliner){e.preventDefault();ui.onRead?.(ui.heldBook)}
      if(command==='blanket'&&(s.seated?.phase==='seated'||ui.blanket)&&!s.seated?.seat.recliner&&!s.seated?.seat.bathing){e.preventDefault();ui.onBlanket?.()}
      if(command==='posture'&&s.seated?.phase==='seated'&&s.seated.seat.id==='attic-daybed'){e.preventDefault();posture({detail:s.seated.posture==='lying'?'sitting':'lying'})}
      if(MOVE.includes(e.code)||e.code==='ShiftLeft'||e.code==='ShiftRight'){e.preventDefault();autoWalk.current=null;s.keys.add(e.code)}
      if(command==='sky'&&['meadow-rest','terrace-sofa'].includes(s.seated?.seat.id))s.skyGaze=!s.skyGaze
      if(['posture','popcorn','cola'].includes(command)&&s.seated?.seat.recliner){e.preventDefault();cinemaAction({detail:{posture:'recline',popcorn:'popcorn',cola:'cola'}[command]})}
      if(command==='interact'){e.preventDefault();interact()}
      if(command==='front'&&!tour.current?.running){
        e.preventDefault()
        const facing=ui.mode==='first'&&!s.seated?-s.yaw:s.bodyYaw
        s.bodyYaw=facing;s.yaw=frontViewYaw(facing);s.pitch=-.05
        s.keys.clear();s.pointer=null
        window.dispatchEvent(new Event('library-third-person'))
      }
    }
    const keyUp=e=>s.keys.delete(e.code)
    const reset=()=>{autoWalk.current=null;tap.current=null;s.keys.clear();s.pointer=null;touch.current.clear()}
    const canZoom=()=>!status.current.blocked&&status.current.mode!=='overview'
    const applyZoom=factor=>{zoom.current=THREE.MathUtils.clamp(zoom.current*factor,.8,2.6)}
    const touchDistance=()=>{
      const [a,b]=touch.current.values()
      return a&&b?Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY):0
    }
    const down=e=>{
      if(e.button!==0||status.current.blocked||status.current.mode==='overview')return
      tap.current={x:e.clientX,y:e.clientY,moved:false};
      if(e.pointerType==='touch'){
        touch.current.set(e.pointerId,e)
        if(touch.current.size>1){tap.current=null;s.pointer=null;return}
      }
      Object.assign(s,{pointer:e.pointerId,lx:e.clientX,ly:e.clientY})
    }
    const move=e=>{
      if(tap.current&&Math.hypot(e.clientX-tap.current.x,e.clientY-tap.current.y)>8)tap.current.moved=true;
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
    const up=e=>{
      const hitTap=tap.current,valid=s.pointer===e.pointerId;tap.current=null;touch.current.delete(e.pointerId);if(valid)s.pointer=null
      if(!valid||!hitTap||hitTap.moved||e.target!==canvas||e.type==='pointercancel'||status.current.blocked||s.seated||s.ladder||tour.current?.running)return
      const rect=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera)
      const hits=ray.intersectObjects(scene.children,true),hit=hits.find(h=>{let o=h.object;while(o){if(!o.visible||o.userData.player||o.userData.noCameraCollision)return false;o=o.parent}return true})
      if(!hit?.face)return
      const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);if(normal.y<.7)return
      const level=walkHeight(hit.point.x,hit.point.z,hit.point.y/WORLD_HEIGHT_SCALE,status.current.world)
      if(level===null||Math.abs(hit.point.y-level*WORLD_HEIGHT_SCALE)>.18)return
      const request={planning:true};autoWalk.current=request;findClickPathAsync({x:s.x,z:s.z,level:s.level},{x:hit.point.x,z:hit.point.z,level},status.current.world,()=>autoWalk.current===request).then(path=>{if(autoWalk.current===request)autoWalk.current=path})
    }
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
    window.addEventListener('library-cinema-action',cinemaAction)
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
      window.removeEventListener('library-cinema-action',cinemaAction)
      cinemaSeatMotion.clear()
      window.removeEventListener('library-interact',interact)
      canvas.removeEventListener('pointerdown',down)
      canvas.removeEventListener('wheel',wheel)
      canvas.removeEventListener('gesturestart',gestureStart)
      canvas.removeEventListener('gesturechange',gestureChange)
      window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up)
    }
  },[gl,camera,scene])
  useEffect(()=>{
    if(blocked){autoWalk.current=null;state.current.keys.clear();state.current.pointer=null;touch.current.clear()}
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
    if(s.ladder)advanceRider(s,dt,front,side,(x,z)=>walkHeight(x,z,0,world)===0)
    if(s.level===0&&Math.abs(s.x)<7&&s.z<-15.5)visitedSecret.current=true
    if(visitedSecret.current&&s.x<7.65&&s.z>-13.1&&!tour.current?.running){visitedSecret.current=false;onCloseSecret()}
    const len=s.seated||s.ladder||tour.current?.running?0:Math.hypot(front,side)
    const viewYaw=s.yaw+(s.seated&&mode==='first'?Math.PI:0)
    const sin=Math.sin(viewYaw),cos=Math.cos(viewYaw)
    moving.current=Boolean(s.ladder&&(Math.abs(front)+Math.abs(side)>.1||s.ladder.phase!=='climbing'))||len>.1||(tour.current?.running&&tour.current.phase==='approach')
    if(len>.1) {
      const step=(s.z>32&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||Math.hypot(joy.x||0,joy.y||0)>.9)?6.4:3.6)*Math.min(dt,.05),direction=movementVector(viewYaw,front,side)
      const beforeX=s.x,beforeZ=s.z
      Object.assign(s,movePlayer(s,direction.x*step,direction.z*step,world))
      s.bodyYaw=facingForMovement(s.bodyYaw,s.x-beforeX,s.z-beforeZ,dt)
    }
    if(front||side||blocked||s.seated||s.ladder||!active)autoWalk.current=null
    if(autoWalk.current?.length){const goal=autoWalk.current[0],d=Math.hypot(goal.x-s.x,goal.z-s.z);if(d<.08)autoWalk.current.shift();else{const step=Math.min(d,3.6*Math.min(dt,.05)),before={x:s.x,z:s.z,level:s.level};Object.assign(s,movePlayer(s,(goal.x-s.x)/d*step,(goal.z-s.z)/d*step,world));if(Math.hypot(s.x-before.x,s.z-before.z)<step*.5)autoWalk.current=null;else{moving.current=true;s.bodyYaw=facingForMovement(s.bodyYaw,s.x-before.x,s.z-before.z,dt)}}}
    if(s.lastCafePoint&&enteringCafe(s.lastCafePoint,s))window.dispatchEvent(new Event('cafe-door-bell'))
    s.lastCafePoint={x:s.x,z:s.z,level:s.level}
    if(destination.current){const points=autoWalk.current;destination.current.visible=Boolean(points?.length);if(points?.length){const goal=points[points.length-1];destination.current.position.set(goal.x,goal.level*WORLD_HEIGHT_SCALE+.025,goal.z)}}
    const action=hintScheduler.next(dt,active&&!blocked,()=>interactionAt(s,status.current))
    const hint=active&&!blocked?(action?.label||''):''
    const hintKey=hint+'|'+(action?.type||'')
    if(hintKey!==lastHint.current){lastHint.current=hintKey;onInteraction?.(hint,action?.type||null)}
    let visualY=s.level
    if(s.seated){
      const oldSeat=s.seated
      const result=advanceSeating(oldSeat,dt,world)
      if(result.seating){result.seating.snack=result.seating.phase==='seated'?advanceCinemaSnack(oldSeat.snack,dt):null}
      pose.current={...result.pose,snack:result.seating?.snack}
      moving.current=moving.current||Boolean(result.pose.walking)
      s.x=result.pose.x;s.z=result.pose.z;visualY=result.pose.y
      avatar.current.rotation.y=result.pose.rotation
      s.seated=result.seating
      s.bodyYaw=result.pose.rotation
      if(!s.seated){s.keys.clear()}
    }else{
      pose.current={amount:0,climbing:Boolean(s.ladder)}
      avatar.current.rotation.y=mode==='first'?-s.yaw:s.bodyYaw
    }
    cinemaSeatMotion.clear();if(s.seated?.seat.recliner)cinemaSeatMotion.set(s.seated.seat.id,pose.current.recline||0)
    avatar.current.rotation.order='YXZ'
    avatar.current.rotation.x=pose.current.recline||0
    avatar.current.position.set(s.x,visualY*WORLD_HEIGHT_SCALE,s.z)
    Object.assign(playerPosition.current,{x:s.x,z:s.z,level:s.level})
    const seatText=s.seated?`${s.seated.seat.label} · ${s.seated.transitionBlocked?'이동 공간 대기 중':s.seated.phase==='floorExit'?'안전한 경로로 나오는 중':s.seated.phase==='entering'?'앉는 중':s.seated.phase==='leaving'?'일어나는 중':s.seated.seat.bathing?'따뜻한 물에서 반신욕 중':s.seated.seat.id==='meadow-rest'?'하늘 구경 중':s.seated.seat.recliner?(s.seated.snack?.kind==='popcorn'?'팝콘 먹는 중':s.seated.snack?.kind==='cola'?'콜라 마시는 중':s.seated.posture==='reclined'?'좌석 젖혀 감상 중':'영화 감상 중'):s.seated.posture==='lying'?'누워 읽기':heldBook?'독서 중':'휴식 중'}`:''
    if(seatText!==lastSeatStatus.current){lastSeatStatus.current=seatText;onSeatStatus?.(seatText)}
    const zone=s.ladder?'서가':floorName(s.x,s.z,s.level)||(s.z>32?'잔디 동산':zoneAt(s.x,s.z,layout.end))
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
  return <><mesh ref={destination} visible={false} rotation={[-Math.PI/2,0,0]} userData={{noCameraCollision:true}}><ringGeometry args={[.18,.24,32]}/><meshBasicMaterial color="#f4dfad" transparent opacity={.85} depthWrite={false}/></mesh><group ref={avatar} userData={{player:true}} visible={mode==='third'}>
    {blanket&&<LoungeBlanket lap pose={pose}/>}
    <CinemaKit player={state} pose={pose} character={character}/>
    <Suspense fallback={null}><AvatarModels player={state} character={character} moving={moving} pose={pose} book={books.find(b=>b.id===heldBook) || null}/></Suspense>
  </group></>
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
function ArchiveScene({cafeConfig,blanket,onBlanket,onMusic,onExperience,books=[],placements={},canPlace=false,onPlaceNearby,onPick,onGenre,mode='third',weather,time,blocked,joy,onZone,teleport,onDoor,character,heldBook,season,onOpenNotes,onInteraction,onRead,onSeatStatus}) {
  const playerPosition=useRef({x:0,z:23,level:0})
  const entranceDoor=useMemo(()=>({open:false,amount:0}),[])
  const verandaDoor=useMemo(()=>({open:false,amount:0}),[])
  const glassDoor=useMemo(()=>({open:false,amount:0}),[])
  const studyDoor=useMemo(()=>({open:false,amount:0}),[])
  const [localZone,setLocalZone]=useState('저택 정원')
  useEnvironmentAudio(playerPosition,localZone,weather,time)

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
    <VegetationSun light={light}/>
    <group scale={[1,WORLD_HEIGHT_SCALE,1]}><BookCafe config={cafeConfig} books={books} onOpen={(kind='cafe')=>onExperience(kind)} time={time}/><EstateLandscape time={time} weather={weather}/><EastMeadow studyOpen={gateReady} end={layout.end} weather={weather}/><Basement time={time} weather={weather} visible={outside||map||['중앙 홀','서가','지하 계단','지하 숲 라운지','숲 온천'].includes(localZone)}/>
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
