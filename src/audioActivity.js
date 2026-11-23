// Fade before suspending DSP. The owner creates this only after a user gesture.
// Context ownership stays with the hook: dispose cancels work but never closes it.
export function createAudioActivity(context,gain,{fade=.4,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let target=null,timer=null,idleReady=false,disposed=false,resuming=false,suspending=false
 const live=()=>!disposed&&context.state!=='closed'
 const wake=()=>{
  if(!live()||!target||context.state==='running'||resuming||suspending)return
  resuming=true
  Promise.resolve().then(()=>live()&&target?context.resume():undefined).catch(()=>{}).finally(()=>{
   resuming=false
   if(live()&&!target&&idleReady)sleep()
  })
 }
 const sleep=()=>{
  if(!live()||target||!idleReady||resuming||suspending||context.state!=='running')return
  suspending=true
  Promise.resolve().then(()=>live()&&!target?context.suspend():undefined).catch(()=>{}).finally(()=>{
   suspending=false
   if(live()&&target)wake()
  })
 }
 return {
  setVolume(volume,fadeSeconds=fade){
   if(!live())return
   const value=Number.isFinite(volume)?Math.max(0,volume):0
   if(value!==target){
    target=value;gain.gain.setTargetAtTime(value,context.currentTime,fadeSeconds)
    if(timer!==null){clearTimer(timer);timer=null}
    idleReady=false
    if(!value)timer=setTimer(()=>{timer=null;idleReady=true;sleep()},fadeSeconds*6000)
   }
   if(value)wake()
  },
  dispose(){disposed=true;if(timer!==null)clearTimer(timer);timer=null},
 }
}
