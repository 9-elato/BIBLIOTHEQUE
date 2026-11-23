import {movePlayer} from './navigation.js'
import {steerSpirit,spiritClearance} from './spiritAvoidance.js'
import {ambientUpdateDue} from './ambientUpdates.js'

const SPIRIT_WORLD=Object.freeze({end:45,gateReady:false,entranceOpen:false})

// R3F frame callbacks keep running under invisible groups. Preserve the route
// while the interior is hidden; never catch up minutes of unseen movement.
export function advanceSpirit(s,route,player,dt,index,object,move=movePlayer){
 if(!ambientUpdateDue(object,0,null))return false
 dt=Number.isFinite(dt)?Math.min(Math.max(dt,0),.05):0
 if(dt===0)return false
 const [x,z]=route.points[s.target],distance=Math.hypot(x-s.x,z-s.z),step=Math.min(.48*dt,distance)
 const nearPlayer=player&&Math.abs(player.level-s.level)<.7&&Math.hypot(s.x-player.x,s.z-player.z)<1.5
 if(s.pause>0&&!nearPlayer)s.pause=Math.max(0,s.pause-dt)
 else if(distance<.08){s.target=(s.target+1)%route.points.length;s.pause=2.5}
 else{
  const velocity=steerSpirit(s,[x,z],player,dt,index)
  const next=move(s,velocity.x,velocity.z,SPIRIT_WORLD)
  const previousDistance=player?Math.hypot(s.x-player.x,s.z-player.z):Infinity
  if(!spiritClearance(next,player)&&Math.hypot(next.x-player.x,next.z-player.z)<=previousDistance)return false
  if(Math.hypot(next.x-s.x,next.z-s.z)<step*.1){s.target=(s.target+1)%route.points.length;s.pause=.5}
  else{s.x=next.x;s.z=next.z}
 }
 return true
}
