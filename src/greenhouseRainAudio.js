import {useEffect,useRef} from 'react'
// No autoplay: a user gesture unlocks this local ambient sound. No microphone or network.
export function useGreenhouseRain(active,weather){
 const audio=useRef(null),enabled=useRef(false),conditions=useRef({active,weather});conditions.current={active,weather}
 const sync=()=>{
  const audible=conditions.current.active&&conditions.current.weather==='rain'
  if(audible&&enabled.current&&!audio.current){
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return
   const ctx=new Audio(),noise=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=noise.getChannelData(0)
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.45
   const source=ctx.createBufferSource();source.buffer=noise;source.loop=true
   const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2300
   const gain=ctx.createGain();gain.gain.value=0
   const echo=ctx.createConvolver(),impulse=ctx.createBuffer(2,ctx.sampleRate*1.6,ctx.sampleRate)
   for(let ch=0;ch<2;ch++){const d=impulse.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)*.35}
   echo.buffer=impulse;const wet=ctx.createGain();wet.gain.value=.22
   source.connect(filter);filter.connect(gain);filter.connect(echo).connect(wet).connect(gain);gain.connect(ctx.destination);source.start();audio.current={ctx,gain}
  }
  const a=audio.current;if(a){a.gain.gain.setTargetAtTime(audible&&document.visibilityState!=='hidden'?.14:0,a.ctx.currentTime,.6);if(audible)a.ctx.resume().catch(()=>{})}
 }
 useEffect(()=>{const unlock=()=>{enabled.current=true;sync()};window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);document.addEventListener('visibilitychange',sync);return()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);document.removeEventListener('visibilitychange',sync);audio.current?.ctx.close().catch(()=>{});audio.current=null}},[])
 useEffect(sync,[active,weather])
}
