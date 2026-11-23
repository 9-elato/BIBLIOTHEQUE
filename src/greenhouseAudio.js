import {createAudioActivity} from './audioActivity.js'
import {useEffect,useRef} from 'react'
// Audio is created only after an explicit E-key gesture. Leaving the room fades it out.
export function useGardenWater(active){
 const audio=useRef(null),inside=useRef(active);inside.current=active
 const sync=()=>{const a=audio.current;if(a)a.activity.setVolume(a.on&&inside.current&&document.visibilityState!=='hidden'?.28:0)}
 useEffect(()=>{const toggle=()=>{
  if(!audio.current){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const ctx=new Audio(),buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+Math.random()*.04-.02)*.98;data[i]=last}const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1600;const gain=ctx.createGain();gain.gain.value=0;source.connect(filter).connect(gain).connect(ctx.destination);source.start();audio.current={ctx,gain,on:false,activity:createAudioActivity(ctx,gain,{fade:.4})}}
  const a=audio.current;a.on=!a.on;a.activity.setVolume(a.on&&inside.current&&document.visibilityState!=='hidden'?.28:0,.25)
 };window.addEventListener('greenhouse-water-toggle',toggle);document.addEventListener('visibilitychange',sync);return()=>{window.removeEventListener('greenhouse-water-toggle',toggle);document.removeEventListener('visibilitychange',sync);audio.current?.activity.dispose();audio.current?.ctx.close().catch(()=>{});audio.current=null}},[])
 useEffect(sync,[active])
}
