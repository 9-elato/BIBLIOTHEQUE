export const cinemaSeatMotion=new Map()
export function applyCinemaAction(seating,action,kit){
 if(!seating?.seat.recliner||seating.phase!=='seated')return false
 if(action==='recline'){seating.posture=seating.posture==='reclined'?'sitting':'reclined';return true}
 if((action==='popcorn'||action==='cola')&&kit[action]&&!seating.snack){seating.snack={kind:action,elapsed:0};return true}
 return false
}
export function advanceCinemaSnack(snack,dt){
 if(!snack)return null
 const elapsed=snack.elapsed+Math.max(0,Math.min(dt,.1))
 return elapsed>=1.8?null:{...snack,elapsed}
}
