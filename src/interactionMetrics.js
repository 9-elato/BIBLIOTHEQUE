// The next rAF callback is not proof of a presented/GPU-complete frame.
export function startInteractionTrace({now,requestFrame,publish,visible=()=>true},context={}){
 const start=now();let resolvedAt=start,type='none',finished=false
 return {
  resolved(value){resolvedAt=now();type=value||'none'},
  finish(){
   if(finished)return
   finished=true
   const end=now(),initiallyVisible=visible()
   requestFrame(()=>publish({...context,type,resolveMs:resolvedAt-start,executeMs:end-resolvedAt,
    handlerMs:end-start,nextFrameCallbackMs:now()-start,visible:initiallyVisible&&visible()}))
  }
 }
}
