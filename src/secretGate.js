export const GATE_SECONDS=.65
export function advanceGate(progress,open,dt){return Math.max(0,Math.min(1,progress+(open?1:-1)*Math.max(0,dt)/GATE_SECONDS))}
export function gatePose(progress,half){
 const ease=t=>t*t*(3-2*t)
 const p=ease(progress)
 return {x:half*1.53*p,z:-.42*Math.min(1,p*3),rotation:half*ease(Math.max(0,(p-.25)/.75))*.65}
}
