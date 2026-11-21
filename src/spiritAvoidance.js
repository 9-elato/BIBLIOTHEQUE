// Floor-local steering: slow approach, then pass on a consistent side.
export function steerSpirit(s,target,player,dt,index=0){
 const dx=target[0]-s.x,dz=target[1]-s.z,d=Math.hypot(dx,dz),step=.48*Math.min(Math.max(dt,0),.05)
 let vx=d>.001?dx/d:0,vz=d>.001?dz/d:0
 if(player&&Math.abs(player.level-s.level)<.7){
  const ax=s.x-player.x,az=s.z-player.z,r=Math.hypot(ax,az)
  if(r<1.8){
   const nx=r>.001?ax/r:1,nz=r>.001?az/r:0,weight=(1.8-r)/1.8
   const side=index%2?1:-1
   vx=vx*(1-weight)+nx*weight*3-nz*side*weight
   vz=vz*(1-weight)+nz*weight*3+nx*side*weight
  }
 }
 const length=Math.hypot(vx,vz)||1
 const close=player&&Math.abs(player.level-s.level)<.7?Math.hypot(s.x-player.x,s.z-player.z):Infinity
 const pace=close<1.1?step*(1+(1.1-close)*8):step
 return {x:vx/length*pace,z:vz/length*pace}
}
export function spiritClearance(next,player){
 return !player||Math.abs(next.level-player.level)>.7||Math.hypot(next.x-player.x,next.z-player.z)>=.82
}
