// Hide/show-aware budget for slow ambient particles. Shader time stays continuous.
export function ambientUpdateDue(object,now,last,interval=1/24){
 for(let o=object;o;o=o.parent)if(!o.visible)return false
 return Boolean(object)&&(last===null||now-last>=interval||now<last)
}
