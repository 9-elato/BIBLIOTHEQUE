import {GALLERY_RAIL_SOLIDS} from './upperArchitecture.js'
import {CAFE_SOLIDS} from './cafeLayout.js'
import {MEADOW_STAIRS} from './eastMeadowLayout.js'
import {inMeadow,meadowHeight} from './meadowLayout.js'
import {TERRACE_FURNITURE} from './terraceFurniture.js'
import {SPRING_WALK_REGION,BASEMENT_HEIGHT,BASEMENT_STAIR,BASEMENT_BOUNDS,BASEMENT_SOLIDS,BASEMENT_GROUND_GUARDS} from './basementLayout.js'
import {GREENHOUSE_REGIONS,GARDEN_SOLIDS as CONSERVATORY_SOLIDS,gardenWaterBlocks,glassDoorBlocks} from './greenhouseLayout.js'
import {studyDoorBlocks} from './studyLayout.js'
import {entranceDoorBlocks,verandaDoorBlocks} from './doorMotion.js'
import {atticX,ATTIC_TERRACE_BOUNDS} from './atticLayout.js'
import {ladderBlocks} from './ladderSystem.js'
import {GARDEN_SOLIDS} from './gardenLayout.js'
import {canWalk} from './layout.js'
import {READING_CHAIRS} from './roomFurniture.js'

export const GALLERY_HEIGHT=7.2
export const ATTIC_HEIGHT=10.6
export const ATTIC_ORIGIN=[-15.6,ATTIC_HEIGHT,0]
export const PLAYER_RADIUS=.23
export const STAIRS=[
 BASEMENT_STAIR,MEADOW_STAIRS,
  {id:'main',from:[-6.35,0,5.25],to:[-6.35,GALLERY_HEIGHT,-4.85],width:1.9,steps:36},
  {id:'attic',from:[-7.2,GALLERY_HEIGHT,5.65],to:[-11.45,ATTIC_HEIGHT,5.65],width:1.7,steps:18},
]

export function stairPoint(stair,t,side=0){
  const [x,y,z]=stair.from, [tx,ty,tz]=stair.to
  const length=Math.hypot(tx-x,tz-z)
  return [x+(tx-x)*t-(tz-z)/length*side,y+(ty-y)*t,z+(tz-z)*t+(tx-x)/length*side]
}
function stairCoordinates(stair,x,z){
  const dx=stair.to[0]-stair.from[0],dz=stair.to[2]-stair.from[2],length=Math.hypot(dx,dz)
  return {t:((x-stair.from[0])*dx+(z-stair.from[2])*dz)/(length*length),
    side:((z-stair.from[2])*dx-(x-stair.from[0])*dz)/length}
}
const inRect=(x,z,[l,r,b,f])=>x>=l&&x<=r&&z>=b&&z<=f
const upperRegions=[...GREENHOUSE_REGIONS,[-7.6,-5.3,-6.7,-4.85],[-7.6,-5.3,5.25,6.7],
  [5.3,7.6,-6.7,6.7],[-7.6,7.6,-6.7,-4.45],[-7.6,7.6,4.9,6.7],[7.3,15,-4.85,4.85]]
// Bounds match the actual furniture footprints. Each box has its floor's height.
export const FURNITURE=[
 ...GALLERY_RAIL_SOLIDS.map(s=>({...s,floor:GALLERY_HEIGHT})),
 ...CAFE_SOLIDS.map(s=>({...s,floor:0})),
 ...BASEMENT_SOLIDS.map(s=>({...s,floor:BASEMENT_HEIGHT})),
 ...BASEMENT_GROUND_GUARDS.map(s=>({...s,floor:0})),
 {floor:0,id:'forest-sofa',rect:[8.45,12.95,3.4,4.7]},
 {floor:0,id:'forest-chaise',rect:[11.5,12.9,2.4,3.45]},
 {floor:0,id:'forest-table',rect:[9.425,10.775,1.475,2.225]},
 {floor:0,id:'forest-lamp',rect:[7.8,8.5,4.2,4.9]},
 ...[-17.5,-12.5].map(x=>({floor:0,id:`veranda-cushion-${x}`,rect:[x-.7,x+.7,-12.45,-11.15]})),
 {floor:0,id:'veranda-lantern',rect:[-19.2,-18.8,-13,-12.6]},
 ...[-1,1].map(a=>({floor:0,id:`estate-portico-${a}`,rect:[a*2.05-.325,a*2.05+.325,11.05,13.15]})),
 {floor:0,rect:[-6.51,-4.29,-20.27,-19.43],id:'study-bench'},
 {floor:0,rect:[5.8,7,-29.47,-22.33],id:'study-lp'},

 {floor:0,rect:[-1.6,1.6,-29.245,-27.595],id:'study-writing-desk'},
 {floor:0,rect:[-.64,.64,-27.17,-26.13],id:'study-desk-chair'},
 ...CONSERVATORY_SOLIDS.map(s=>({...s,floor:GALLERY_HEIGHT})),

  {floor:0,rect:[-4.44,-3.16,-25.52,-24.48],id:'study-chair'},
  {floor:0,rect:[-3.1,-2.5,-24.4,-23.8],id:'study-lamp'},
  ...GARDEN_SOLIDS.map(s=>({...s,floor:0})),
  ...[[-17.9,-3.3],[-8.25,4.9]].map(([x,z])=>({floor:0,rect:[x-.28,x+.28,z-.28,z+.28],id:'lounge-lamp'})),
  {floor:0,rect:[-2,2,.45,3.05],id:'central-table'},
  {floor:0,rect:[-2.65,-1.95,8.65,10.45],id:'vestibule-console'},
  {floor:0,rect:[1.8,2.6,9.5,10.5],id:'coat-stand'},
  {floor:0,rect:[-3.28,-2.52,13.1,14],id:'planter-left'},
  {floor:0,rect:[2.52,3.28,13.1,14],id:'planter-right'},
  {floor:0,rect:[-2.9,-2.3,13.55,15.95],id:'porch-left'},
  {floor:0,rect:[2.3,2.9,13.55,15.95],id:'porch-right'},
  {floor:GALLERY_HEIGHT,rect:[8.9,11.6,-.64,.64],id:'reading-table'},
  ...READING_CHAIRS.map(s=>({floor:s.level,rect:[s.x-(s.level===ATTIC_HEIGHT?.80:.64),s.x+(s.level===ATTIC_HEIGHT?.80:.64),s.z-(s.level===ATTIC_HEIGHT?.65:.52),s.z+(s.level===ATTIC_HEIGHT?.65:.52)],id:s.id})),
  {floor:GALLERY_HEIGHT,rect:[13.65,14.8,-4.3,4.3],id:'reading-shelves'},
  ...[-3.1,2.4].map(z=>({floor:GALLERY_HEIGHT,rect:[7.05,7.95,z-.92,z+.92],id:'gallery-shelf'})),
  ...TERRACE_FURNITURE.map(s=>({...s,rect:[...s.rect],floor:ATTIC_HEIGHT})),
  {floor:ATTIC_HEIGHT,rect:[-17.25,-16.35,8.8,9.8],id:'terrace-telescope'},
  {floor:ATTIC_HEIGHT,rect:[-19.15,-16.05,-1.65,1.65],id:'daybed'},
  {floor:ATTIC_HEIGHT,rect:[-17.45,-14.35,-6.3,-5.1],id:'attic-shelves'},
  {floor:ATTIC_HEIGHT,rect:[-13.78,-12,-5.85,-4.9],id:'attic-cabinet'},
  {floor:ATTIC_HEIGHT,rect:[-17.85,-16.65,4,5.2],id:'telescope'},
  {floor:ATTIC_HEIGHT,rect:[-12.15,-11.55,-5.3,4.65],id:'attic-side-furnishings'},
]
FURNITURE.forEach(item=>{if(item.floor===ATTIC_HEIGHT&&!item.id.startsWith('attic-0')&&!item.id.startsWith('attic-1')){item.rect[0]=atticX(item.rect[0]);item.rect[1]=atticX(item.rect[1])}})
// Scalar checks avoid creating an expanded rectangle for every obstacle, every step.
// Read the live list so temporary blockers and furniture relocation remain supported.
function occupied(x,z,y){
  for(let i=0;i<FURNITURE.length;i++){
    const item=FURNITURE[i],r=item.rect
    if(Math.abs(y-item.floor)<.2&&x>=r[0]-PLAYER_RADIUS&&x<=r[1]+PLAYER_RADIUS&&z>=r[2]-PLAYER_RADIUS&&z<=r[3]+PLAYER_RADIUS)return true
  }
  return false
}
const SUPPORT_OFFSETS=[[0,0],[PLAYER_RADIUS,0],[-PLAYER_RADIUS,0],[0,PLAYER_RADIUS],[0,-PLAYER_RADIUS]]
const basementRegions=[BASEMENT_BOUNDS,SPRING_WALK_REGION]
const atticRegions=[ATTIC_TERRACE_BOUNDS,[atticX(-19.5),-11.65,-6.35,6.35],[-12,-11.43,5.03,6.27]]
const atticLanding=[-11.7,-11.43,5.15,6.15]
function supported(regions,x,z){
  return SUPPORT_OFFSETS
    .every(([dx,dz])=>regions.some(rect=>inRect(x+dx,z+dz,rect)))
}

export function walkHeight(x,z,previousY,world){
  if(Math.abs(previousY-GALLERY_HEIGHT)<.18&&(gardenWaterBlocks(x,z)||glassDoorBlocks(x,z,world.glassDoor)||(Math.abs(z+6.95)<.29&&Math.abs(x)>1.16)))return null
  if(Math.abs(previousY)<.18&&studyDoorBlocks(x,z,world.studyDoor))return null
  if(Math.abs(previousY)<.18&&world.entranceDoor&&entranceDoorBlocks(x,z,world.entranceDoor))return null
  if(Math.abs(previousY)<.18&&world.verandaDoor&&verandaDoorBlocks(x,z,world.verandaDoor))return null
  // Clearance for both inward-open door leaves, including the ghost's radius.
  if(!world.entranceDoor&&previousY<.18&&world.entranceOpen&&z>10.15&&z<11.95&&Math.abs(x)>.65&&Math.abs(x)<1.75)return null
  if(previousY<.18&&world.ladders?.some(s=>ladderBlocks(s,x,z)))return null
  const candidates=[]
  let onStair=false
  for(const stair of STAIRS){
    const {t,side}=stairCoordinates(stair,x,z)
    if(t>=0&&t<=1&&Math.abs(side)<=stair.width/2&&previousY<=Math.max(stair.from[1],stair.to[1])+.18){
      onStair=true
      if(Math.abs(side)<=stair.width/2-PLAYER_RADIUS)candidates.push(stair.from[1]+t*(stair.to[1]-stair.from[1]))
    }
  }
  if(!onStair){
    if(canWalk(x,z,world))candidates.push(inMeadow(x,z)?meadowHeight(x,z):0)
    if(supported(basementRegions,x,z))candidates.push(BASEMENT_HEIGHT)
    const {to,width}=MEADOW_STAIRS
    if(supported(upperRegions,x,z)||(x>=to[0]-PLAYER_RADIUS&&x<=to[0]&&Math.abs(z-to[2])<=width/2-PLAYER_RADIUS))candidates.push(GALLERY_HEIGHT)
    // Doorway is open only at the top landing of the attic stair.
    if(supported(atticRegions,x,z)||inRect(x,z,atticLanding))candidates.push(ATTIC_HEIGHT)
  }
  // A stair above the player is not a ground-floor barrier. Preserve headroom
  // below the treads/stringers while keeping the low end and upper rails solid.
  if(onStair&&previousY<.18&&canWalk(x,z,world)&&STAIRS.every(stair=>{
    const {t,side}=stairCoordinates(stair,x,z)
    return t<0||t>1||Math.abs(side)>stair.width/2||stair.from[1]+t*(stair.to[1]-stair.from[1])>=2.2
  }))candidates.push(0)
  let height,bestDistance=Infinity
  for(const y of candidates){
    const distance=Math.abs(y-previousY)
    if(distance<=.18&&distance<bestDistance){height=y;bestDistance=distance}
  }
  return height===undefined||occupied(x,z,height)?null:height
}
function crossesRail(a,b){
  return STAIRS.some(stair=>{
    const p=stairCoordinates(stair,a.x,a.z),q=stairCoordinates(stair,b.x,b.z)
    const within=v=>Math.abs(v.side)<=stair.width/2-PLAYER_RADIUS
    return within(p)!==within(q)&&Math.min(p.t,q.t)>.015&&Math.max(p.t,q.t)<.985&&
      Math.abs(a.level-(stair.from[1]+p.t*(stair.to[1]-stair.from[1])))<1.7
  })
}
export function movePlayer(position,dx,dz,world,scratch){
  // Floor-path probes may reuse these two tiny records within one synchronous
  // query. Normal avatar movement still preserves every field on the player.
  const next=scratch?scratch.next:{...position}
  if(scratch){next.x=position.x;next.z=position.z;next.level=position.level}
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.055))
  const stepX=dx/steps,stepZ=dz/steps
  // The avatar carries animation and interaction state; never copy it per substep.
  const candidate=scratch?scratch.candidate:{x:next.x,z:next.z,level:next.level}
  for(let i=0;i<steps;i++)for(let axisIndex=0;axisIndex<2;axisIndex++){
    const axis=axisIndex===0?'x':'z',delta=axisIndex===0?stepX:stepZ
    if(!delta)continue
    candidate.x=next.x;candidate.z=next.z;candidate.level=next.level
    candidate[axis]+=delta
    if(crossesRail(next,candidate))continue
    const height=walkHeight(candidate.x,candidate.z,next.level,world)
    if(height!==null){next[axis]=candidate[axis];next.level=height}
  }
  return next
}
export function floorName(x,z,y){
  if(x>8.4&&Math.abs(z-MEADOW_STAIRS.from[2])<1&&y>.12&&y<GALLERY_HEIGHT-.12)return '온실 계단'
  if(y<-.12&&y>BASEMENT_HEIGHT+.12)return '지하 계단'
  if(y<=BASEMENT_HEIGHT+.12)return x>17.8?'숲 온천':'지하 숲 라운지'
  if(y>.12&&y<GALLERY_HEIGHT-.12)return '중앙 계단'
  if(y>GALLERY_HEIGHT+.12&&y<ATTIC_HEIGHT-.12)return '다락 계단'
  if(y>=ATTIC_HEIGHT-.12)return z>6.7?'별빛 테라스':'다락방'
  if(y>=GALLERY_HEIGHT-.12&&z<-6.7)return '실내 온실'
  if(y>=GALLERY_HEIGHT-.12)return x>7.55?'열람실':'2층 갤러리'
  return null
}
