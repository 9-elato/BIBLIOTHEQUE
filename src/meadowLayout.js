// Rendered terrain and walking support share the same height function.
export const MEADOW_BOUNDS={left:-48,right:48,back:32,front:112}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
export function inMeadow(x,z,margin=0){return x>-48+margin&&x<48-margin&&z>32+margin&&z<112-margin}
export function meadowHeight(x,z){
 const blend=smooth((z-32)/24)
 return blend*(2.8+2.1*Math.sin((z-35)*.038)+1.15*Math.sin(x*.047+z*.016))
}
export function meadowRest(position){
 if(!inMeadow(position.x,position.z,2))return null
 return {id:'meadow-rest',label:'잔디 동산',level:meadowHeight(position.x,position.z),height:.58,turn:0,anchor:{x:position.x,z:position.z},entry:{x:position.x,z:position.z},posture:'lying'}
}
