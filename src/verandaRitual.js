export const TEAS=[{name:'녹차',color:'#9aaf63'},{name:'보리차',color:'#b58748'},{name:'루이보스',color:'#a35b3b'}]
export function teaStep(state,dt){
 if(!['pouring','steeping','sipping'].includes(state.stage))return state
 const elapsed=state.elapsed+Math.min(.5,Math.max(0,dt)),duration=state.stage==='steeping'?12:2.4
 if(elapsed<duration)return {...state,elapsed}
 if(state.stage==='pouring')return {...state,stage:'steeping',elapsed:0}
 if(state.stage==='steeping')return {...state,stage:'ready',elapsed:0}
 const sips=state.sips+1
 return {...state,stage:sips>=6?'empty':'ready',sips,elapsed:0}
}
export function breathState(elapsed){
 const t=Math.max(0,elapsed),cycle=t%10
 return {phase:cycle<4?'들이쉬기':'내쉬기',size:cycle<4?.75+.25*cycle/4:1-.25*(cycle-4)/6,cycles:Math.floor(t/10)}
}
