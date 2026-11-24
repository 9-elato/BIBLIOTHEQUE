// Match density to world-space area; tiny bays do not need an ocean-size grid.
export function oceanSegments([w,d],mobile=false){
 const caps=mobile?[64,40]:[96,60],spacing=mobile?1:.5
 return [w,d].map((n,i)=>Math.max(16,Math.min(caps[i],Math.ceil(n/spacing))))
}
