export function movementVector(yaw,front,side){
 const length=Math.max(1,Math.hypot(front,side))
 return {x:(Math.sin(yaw)*front+Math.cos(yaw)*side)/length,z:(-Math.cos(yaw)*front+Math.sin(yaw)*side)/length}
}
export function facingForMovement(previous,dx,dz,dt){
 if(Math.hypot(dx,dz)<.00001)return previous
 const target=Math.atan2(-dx,-dz)
 return previous+Math.atan2(Math.sin(target-previous),Math.cos(target-previous))*(1-Math.exp(-12*Math.min(dt,.1)))
}
