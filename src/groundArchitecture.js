// One opening profile for architectural infill and player clearance.
export const HALL_ARCH={halfWidth:2.02,spring:4.35,rise:1.5,wallTop:7.2,jambWidth:.33,playerClear:1.6}
export const SECRET_BOOKCASE_SCALE=1.45
export const SECRET_BOOKCASE_TOP=3.64*SECRET_BOOKCASE_SCALE
export const CORRIDOR_TOP=6.5
export function archBlocks(x,z){
 const a=HALL_ARCH.playerClear
 return (Math.abs(Math.abs(x)-7.5)<.4&&Math.abs(z)>a&&Math.abs(z)<2.35)||
 ((Math.abs(z+6.82)<.4||Math.abs(z-7.25)<.4)&&Math.abs(x)>a&&Math.abs(x)<2.35)
}
export function archInfillPoints(){
 const a=HALL_ARCH,p=[[-2.2,a.wallTop],[2.2,a.wallTop],[2.2,a.spring]]
 for(let i=0;i<=40;i++){const t=i*Math.PI/40;p.push([a.halfWidth*Math.cos(t),a.spring+a.rise*Math.sin(t)])}
 p.push([-2.2,a.spring]);return p
}
