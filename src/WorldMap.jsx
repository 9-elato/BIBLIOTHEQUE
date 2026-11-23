import React,{useId} from 'react'
import MapIllustration from './MapIllustration'
import {STAIRS} from './navigation'
import {GREENHOUSE_REGIONS,FOUNTAIN,POND} from './greenhouseLayout'
import {BASEMENT_BOUNDS,BASEMENT_PORTAL,SPRING_WALK_REGION,SPRING_POOL} from './basementLayout'
import {atticX,ATTIC_TERRACE_BOUNDS} from './atticLayout'

const room=(id,name,space,label,kind='room')=>({id,name,space,label,kind})
function floors(end){
 return [
  {bounds:[0,100,0,112],schematic:true,rooms:[
   room('eastmeadow','동쪽 잔디 들판',[48,94,5,47],[71,22],'outdoor'),
   room('meadow','잔디 동산',[22,58,99,109],[40,105],'outdoor'),
   room('cafe','북카페',[2,20,78,100],[11,87]),
   room('estate','정원 산책로',[22,58,75,99],[40,88],'outdoor'),
   room('lounge','벽난로 라운지',[8,28,47,67],[18,55]),
   room('veranda','바다 마루',[8,28,34,47],[18,40],'water'),
   room('main','중앙 홀',[28,48,47,67],[38,57]),
   room('stacks','서가',[48,84,47,67],[65,56]),
   room('stacks','서가 확장',[84,94,40,74],null),
   room('vestibule','현관',[35,43,67,75],[39,72]),
   room('corridor','북쪽 복도',[35,43,32,47],[39,38]),
   room(null,'개인 작업실',[28,48,10,26],[38,17]),
   room(null,'비밀 통로',[36,42,26,32],null),
  ],doors:[[[37,47],[41,47]],[[28,54],[28,60]],[[48,54],[48,60]],[[37,67],[41,67]],[[37,75],[41,75]],[[94,53],[94,61]],[[48,20],[48,24]]],
  stairs:[{id:'hall',from:[30,0,51],to:[30,0,64],width:2},{id:'meadow',from:[51,0,36],to:[65,0,36],width:2.5}],
  links:[['stairs','중앙 계단'],['basementstairs','지하 계단'],['garden-west','서쪽 정원 벤치'],['garden-east','동쪽 정원 벤치']]},
  {bounds:[-12,22,-26,9],rooms:[
   ...GREENHOUSE_REGIONS.map((rect,i)=>room('greenhouse','실내 온실',rect,i===0?[0,-18.8]:null,'glass')),
   ...[[-7.6,7.6,-6.7,-4.45],[-7.6,7.6,4.9,6.7],[5.3,7.6,-4.45,4.9]].map((rect,i)=>room('mezzanine','2층 갤러리',rect,i===0?[-3.3,-5.55]:null)),
   room(null,'중앙 홀 상부',[-5.3,5.3,-4.45,4.9],[0,.7],'void'),
   room('reading','열람실',[7.6,15,-5,5],[11.2,-2.7]),
  ],doors:[[[-1.35,-6.65],[1.35,-6.65]],[[8.4,-16.9],[8.4,-14.9]],[[7.6,-4.7],[7.6,4.7]]],
  links:[['stairs','중앙 계단'],['attic','다락 계단'],['eastmeadow','동쪽 잔디 들판']]},
  {bounds:[-22,-9,-8,13],rooms:[
   room('attic','다락방',[atticX(-19.8),-11.45,-6.62,6.35],[-15.4,2]),
   room('terrace','별빛 테라스',ATTIC_TERRACE_BOUNDS,[-15.9,9.7],'outdoor'),
  ],doors:[[[ATTIC_TERRACE_BOUNDS[0],6.35],[ATTIC_TERRACE_BOUNDS[1],6.35]], [[-11.45,4.8],[-11.45,6.48]]],
  links:[['atticbed','다락 데이베드'],['mezzanine','2층 갤러리']]},
  {bounds:[2,27,-8,20],rooms:[room('basement','지하 숲 라운지',[BASEMENT_BOUNDS[0],BASEMENT_PORTAL.x,BASEMENT_BOUNDS[2],BASEMENT_BOUNDS[3]],[14,0]),room('bathroom','숲 온천',[BASEMENT_PORTAL.x,BASEMENT_BOUNDS[1],BASEMENT_BOUNDS[2],6.2],[23,-2]),room('bathroom','숲 온천',SPRING_WALK_REGION,null,'outdoor')],doors:[[[BASEMENT_PORTAL.x,-1.1],[BASEMENT_PORTAL.x,1]]],links:[['basementstairs','1층 중앙 홀']]},
 ]
}

const floorNames=['1층','2층','3층','지하']
const upperZones=['2층 갤러리','열람실','다락 계단','실내 온실','온실 계단']
export function floorForZone(zone){return ['지하 숲 라운지','숲 온천','지하 계단'].includes(zone)?3:['다락방','별빛 테라스'].includes(zone)?2:upperZones.includes(zone)?1:0}

function Rect({rect,...props}){
 const [x,right,z,south]=rect
 return <rect x={x} y={z} width={right-x} height={south-z} {...props}/>
}

function StairTreads({stair}){
 const [x,,z]=stair.from,[tx,,tz]=stair.to
 const horizontal=x!==tx,half=stair.width/2
 return <g className="plan-stair">
  <Rect rect={horizontal?[Math.min(x,tx),Math.max(x,tx),z-half,z+half]:[x-half,x+half,Math.min(z,tz),Math.max(z,tz)]}/>
  {Array.from({length:7},(_,i)=>{
   const px=x+(tx-x)*i/6,pz=z+(tz-z)*i/6
   return <line key={i} x1={px-(horizontal?0:half)} y1={pz-(horizontal?half:0)} x2={px+(horizontal?0:half)} y2={pz+(horizontal?half:0)}/>
  })}
  <path d={`M${x} ${z} L${tx} ${tz}`} className="plan-up"/>
 </g>
}

export default function WorldMap({floor,onFloor,zone,onTravel,onClose,stackLayout}){
 const pattern=useId()
 const plan=floors(stackLayout.end)[floor]
 const [left,right,north,south]=plan.bounds
 const stops=[...new Map([...plan.rooms.filter(room=>room.id).map(({id,name})=>[id,name]),...plan.links])]
 const currentRoom=r=>zone===r.name||(r.id==='estate'&&zone==='저택 정원')||(r.name==='개인 작업실'&&zone==='개인 작업실')
 const destination=room=>room.id||(room.name==='개인 작업실'?'corridor':null)
 return <section className="world-map floating detailed-map" aria-label="저택 층별 지도">
  <div className="world-map-head"><strong>저택 안내도</strong><button onClick={onClose} aria-label="지도 닫기">×</button></div>
  <p className="map-location" role="status">● 현재 공간 {zone}</p>
  <div className="map-tabs" role="tablist" aria-label="층 선택">{floorNames.map((name,i)=><button key={name} id={'floor-tab-'+i} aria-controls="floor-map-panel" role="tab" aria-selected={floor===i} onClick={()=>onFloor(i)}>{name}</button>)}</div>
  <div id="floor-map-panel" role="tabpanel" aria-labelledby={'floor-tab-'+floor}>
   <div className="map-canvas" tabIndex={0} aria-label="확대된 지도, 작은 화면에서는 좌우로 밀어 볼 수 있습니다"><svg className={`floor-drawing story-map floor-${floor}`} viewBox={`${left} ${north} ${right-left} ${south-north}`} role="group" aria-label={floorNames[floor]+' 공간 연결 안내도'}>
    <defs>
     <pattern id={pattern} width="2" height="2" patternUnits="userSpaceOnUse"><path d="M0 2V0H2" fill="none" stroke="#ded2ba" strokeWidth=".055"/></pattern>
     <marker id={pattern+'up'} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#846349"/></marker>
    </defs>
    <Rect rect={plan.bounds} fill={`url(#${pattern})`}/>
    {plan.rooms.map((room,i)=>{
     const {name,space,kind}=room,id=destination(room)
     const activate=()=>onTravel(id)
     const props=id?{role:'button',tabIndex:0,'aria-label':room.id?name+' 이동':'개인 작업실 입구가 있는 북쪽 복도로 이동',onClick:activate,onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}}}:{}
     return <Rect key={i} rect={space} rx={plan.schematic?1.3:.3} className={`plan-room ${kind}${currentRoom(room)?' is-current':''}`} {...props}/>
    })}
    <g className="plan-decoration" aria-hidden="true">
    {plan.rooms.filter(r=>r.label).map(r=><MapIllustration key={r.name} room={r} schematic={plan.schematic}/>)}
    {plan.rooms.filter(r=>r.label&&currentRoom(r)).map(r=><circle key={'current-'+r.name} cx={r.label[0]} cy={r.label[1]-(plan.schematic?3.8:1.4)} r={plan.schematic?.7:.22} fill="#66502e" stroke="#fff5dc" strokeWidth={plan.schematic?.25:.08}/>)}
    {plan.doors.map(([[x,z],[tx,tz]],i)=><line key={i} className="plan-door" x1={x} y1={z} x2={tx} y2={tz}/>)}
    {floor===1&&[FOUNTAIN,POND].map(({x,z,radius})=><circle className="plan-water" key={x} cx={x} cy={z} r={radius}/>)}
    {floor===3&&<ellipse className="plan-water" cx={SPRING_POOL.x} cy={SPRING_POOL.z} rx={SPRING_POOL.rx} ry={SPRING_POOL.rz}/>}
    <g style={{'--plan-arrow':`url(#${pattern}up)`}}>
     {(plan.stairs||(floor===3?STAIRS.filter(s=>s.id==='basement'):floor===2?STAIRS.filter(s=>s.id==='attic'):floor===0?STAIRS.filter(s=>s.id!=='attic'):STAIRS.filter(s=>s.id!=='basement'))).map(stair=><StairTreads key={stair.id} stair={stair}/>)}
    </g>
    {plan.rooms.map(r=>r.label&&<text key={r.name} x={r.label[0]} y={r.label[1]} textAnchor="middle" className={currentRoom(r)?'plan-label current':'plan-label'} style={{fontSize:floor===0?(r.name==='북쪽 복도'||r.name==='현관'?'2.15px':'2.55px'):floor===1?'.92px':'.63px'}}>{r.name==='북쪽 복도'?<><tspan x={r.label[0]}>북쪽</tspan><tspan x={r.label[0]} dy="2.6">복도</tspan></>:r.name}</text>)}
    <text x={right-(right-left)*.065} y={north+(south-north)*.085} className="plan-label" style={{fontSize:(right-left)*.028}}>↑ N</text>
    </g>
   </svg></div>
   <p className="map-scale-note">공간의 연결을 보기 쉽게 그린 안내도입니다.</p>
   <div className="map-legend"><span>● 현재 공간</span><span>━ 출입구</span><span>▤ 계단</span></div>
   <div className="plan-destinations" aria-label="공간 바로 이동">{stops.map(([id,name])=><button key={id} aria-current={zone===name?'location':undefined} onClick={()=>onTravel(id)}>{name}</button>)}</div>
  </div>
 </section>
}
