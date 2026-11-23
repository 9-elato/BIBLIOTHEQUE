import {useEffect,useRef} from 'react'
import {windEnvelope,windStrength} from './vegetationWind'
export function useVegetationAudio(active,weather){
 const state=useRef({active,weather});state.current={active,weather}
 useEffect(()=>{
  let ctx,timer,build,disposed=false
  const start=()=>{
   if(ctx||disposed)return
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return
   ctx=new Audio();ctx.resume().catch(()=>{})
   build=setTimeout(()=>{
    if(disposed)return
    const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0)
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1
    const source=ctx.createBufferSource(),leaves=ctx.createBiquadFilter(),branches=ctx.createBiquadFilter(),fine=ctx.createGain(),broad=ctx.createGain()
    source.buffer=buffer;source.loop=true;leaves.type='bandpass';leaves.Q.value=.55;branches.type='lowpass';branches.frequency.value=650
    fine.gain.value=0;broad.gain.value=0;source.connect(leaves).connect(fine).connect(ctx.destination);source.connect(branches).connect(broad).connect(ctx.destination);source.start()
    timer=setInterval(()=>{const w=windEnvelope(ctx.currentTime,windStrength(state.current.weather)),on=state.current.active&&!document.hidden;leaves.frequency.setTargetAtTime(1600+w*2200,ctx.currentTime,.2);fine.gain.setTargetAtTime(on?.012+w*.045:0,ctx.currentTime,.3);broad.gain.setTargetAtTime(on?Math.max(0,w-.4)*.055:0,ctx.currentTime,.5)},150)
   },0)
  }
  window.addEventListener('pointerdown',start,{once:true})
  return()=>{disposed=true;window.removeEventListener('pointerdown',start);clearTimeout(build);clearInterval(timer);ctx?.close().catch(()=>{})}
 },[])
}
