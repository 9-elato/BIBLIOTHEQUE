import {Raycaster,Vector3} from 'three'
import {WORLD_HEIGHT_SCALE} from './worldScale.js'
const origin=new Vector3(),direction=new Vector3(),ray=new Raycaster()
let player=null,scene=null
export function setInteractionWorld(position,worldScene){player=position;scene=worldScene}
export function withinReach(p,target,range=3.6){return !!p&&Math.hypot(p.x-target.x,p.z-target.z)<=range&&Math.abs(target.y-(p.level*WORLD_HEIGHT_SCALE+1.1))<5.2}
export function canReachEvent(event,range=3.6){
 if(!player||!scene||!event.point||!withinReach(player,event.point,range))return false
 origin.set(player.x,player.level*WORLD_HEIGHT_SCALE+1.1,player.z)
 direction.copy(event.point).sub(origin);const distance=direction.length();if(distance<.05)return true
 ray.set(origin,direction.normalize());ray.far=Math.max(0,distance-.10)
 // This runs on clicks only. Hidden objects and transparent glazing do not block inspection.
 for(const hit of ray.intersectObjects(scene.children,true)){
  let o=hit.object,skip=false
  while(o){if(!o.visible||o.userData.player||o.userData.noCameraCollision){skip=true;break}o=o.parent}
  // A click handler may belong to a group containing several parts of one prop.
  let part=hit.object,ownTarget=false
  while(part){if(part===event.eventObject||part===event.object){ownTarget=true;break}part=part.parent}
  if(skip||ownTarget)continue
  const mats=Array.isArray(hit.object.material)?hit.object.material:[hit.object.material]
  if(mats.every(m=>m?.transparent&&m.opacity<.5))continue
  return false
 }
 return true
}
