// Test the whole swept path, not just its end, including after a long frame.
export function doorSweepBlocked(door,player,from,to,blocks,floor=0){
 if(!player||(Number.isFinite(player.level)&&Math.abs(player.level-floor)>.1))return false
 const steps=Math.max(1,Math.ceil(Math.abs(to-from)/.02))
 for(let i=0;i<=steps;i++)if(blocks(player.x,player.z,{...door,amount:from+(to-from)*i/steps}))return true
 return false
}
export function advanceGuardedDoor(door,dt,player,blocks,floor=0,duration=.6){
 const current=door.amount||0,step=Math.max(0,dt)/duration
 const next=door.open?Math.min(1,current+step):Math.max(0,current-step)
 if(next!==current&&doorSweepBlocked(door,player,current,next,blocks,floor)){
  if(!door.open)door.open=true
  return current
 }
 door.amount=next;return next
}
export function verandaDoorBlocks(x,z,door){
 const center=-10.2-(door.amount||0)*1.9
 return Math.abs(z+6.7)<.34&&Math.abs(x-center)<1.18
}
export function toggleVerandaDoor(door,player){
 if(doorSweepBlocked(door,player,door.amount||0,door.open?0:1,verandaDoorBlocks))return false
 door.open=!door.open;return true
}
export function entranceDoorBlocks(x,z,door){
 const a=(door.amount||0)*1.24
 return [-1,1].some(side=>{
  const ax=side*1.33,az=11.66,dx=-side*1.33*Math.cos(a),dz=-1.33*Math.sin(a)
  const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)))
  return Math.hypot(x-ax-t*dx,z-az-t*dz)<.34
 })
}
