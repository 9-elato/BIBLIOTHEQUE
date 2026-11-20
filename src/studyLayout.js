export function studySeason(month=new Date().getMonth(),weather='sunny'){
 if(weather==='snow'||month===11||month<2)return 'winter'
 return month<5?'spring':month<8?'summer':'autumn'
}
export function studyDoorBlocks(x,z,door){
 if(!door)return false
 const angle=(door.amount||0)*Math.PI/2
 return [-1,1].some(side=>{
  const ax=side*1.32,az=-19,bx=ax-side*1.32*Math.cos(angle),bz=az-1.32*Math.sin(angle)
  const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)))
  return Math.hypot(x-ax-t*dx,z-az-t*dz)<.31
 })
}
export function toggleStudyDoor(door,player){
 if(Math.abs(player.x)<1.65&&player.z<-17.35&&player.z>-20.65)return false
 door.open=!door.open;return true
}
