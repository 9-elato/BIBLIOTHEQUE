import {useEffect,useRef} from 'react'
// Three independent noise bands: fine water, rolling surf, rock impacts.
// Built after a pointer gesture, never inside the E interaction handler.
export function useOceanAudio(active){
 const audio=useRef(null),inside=useRef(active);inside.current=active
 useEffect(()=>{
  let timer,disposed=false
  const start=()=>{
   if(audio.current||disposed)return
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return
   const ctx=new Audio(),master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination)
   audio.current={ctx,master};ctx.resume().catch(()=>{})
   timer=setTimeout(()=>{
    if(disposed)return
    const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0)
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1
    for(const [hz,q,base,rate,depth] of [[1800,.5,.025,.23,.006],[420,.7,.07,.12,.055],[780,1.9,.025,.19,.023]]){
     const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),lfo=ctx.createOscillator(),mod=ctx.createGain()
     source.buffer=buffer;source.loop=true;filter.type='bandpass';filter.frequency.value=hz;filter.Q.value=q;gain.gain.value=base
     lfo.frequency.value=rate;mod.gain.value=depth;lfo.connect(mod).connect(gain.gain);source.connect(filter).connect(gain).connect(master)
     source.start(0,(hz%1000)/500);lfo.start()
    }
    master.gain.setTargetAtTime(inside.current?.6:0,ctx.currentTime,.8)
   },0)
  }
  window.addEventListener('pointerdown',start,{once:true})
  return()=>{disposed=true;clearTimeout(timer);window.removeEventListener('pointerdown',start);audio.current?.ctx.close().catch(()=>{});audio.current=null}
 },[])
 useEffect(()=>{const a=audio.current;if(a)a.master.gain.setTargetAtTime(active?.6:0,a.ctx.currentTime,.8)},[active])
}
