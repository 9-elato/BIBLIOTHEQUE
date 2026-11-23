import {advanceGuardedDoor,doorSweepBlocked} from './doorMotion.js'
export function studySeason(month=new Date().getMonth(),weather='sunny'){
 if(weather==='snow'||month===11||month<2)return 'winter'
 return month<5?'spring':month<8?'summer':'autumn'
}
export function studyDoorBlocks(x,z,door){
 if(!door)return false
 const angle=(door.amount||0)*Math.PI/2
 return [-1,1].some(side=>{
  const ax=side*1.32,az=-19,bx=ax-side*1.32*Math.cos(angle),bz=az+1.32*Math.sin(angle)*(door.swing??-1)
  const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)))
  return Math.hypot(x-ax-t*dx,z-az-t*dz)<.31
 })
}
export function canToggleStudyDoor(door,player){
 const swing=!door.open&&(door.amount||0)<.02?(player.z<-19?1:-1):(door.swing??-1)
 // A mid-animation reversal only traverses the remaining arc, not the full opening.
 return !doorSweepBlocked({...door,swing},player,door.amount||0,door.open?0:1,studyDoorBlocks)
}
export function toggleStudyDoor(door,player){
 if(!canToggleStudyDoor(door,player))return false
 if(!door.open&&(door.amount||0)<.02)door.swing=player.z<-19?1:-1
 door.open=!door.open;return true
}
export function advanceStudyDoor(door,dt,player){
 return advanceGuardedDoor(door,dt,player,studyDoorBlocks)
}
