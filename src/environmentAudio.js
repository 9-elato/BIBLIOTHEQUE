import {createAudioActivity} from './audioActivity.js'
import {useEffect,useRef} from 'react'
import {environmentMix,nextBirdDelay} from './environmentAudioMix'
import {windEnvelope,windStrength} from './vegetationWind'
// One shared context. Independent, unequal-length noise streams avoid aligned loops.
export function useEnvironmentAudio(position,zone,weather,time){
 const state=useRef();state.current={zone,weather,time}
 useEffect(()=>{
  let ctx,timer,build,disposed=false,nextBird=0,master,activity;const bands=[],sources=[],activeBirds=new Set()
  const bird=(volume)=>{
   const start=ctx.currentTime+.04,notes=2+Math.floor(Math.random()*4),base=1800+Math.random()*1800
   for(let i=0;i<notes;i++){
    const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner(),t=start+i*(.12+Math.random()*.12),duration=.07+Math.random()*.13
    o.type='sine';o.frequency.setValueAtTime(base*(.8+Math.random()*.4),t);o.frequency.exponentialRampToValueAtTime(base*(1.1+Math.random()*.4),t+duration*.5);o.frequency.exponentialRampToValueAtTime(base*.8,t+duration)
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume*.025,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration)
    p.pan.value=Math.random()*1.6-.8;o.connect(g).connect(p).connect(master);activeBirds.add(o)
    o.onended=()=>{activeBirds.delete(o);o.disconnect();g.disconnect();p.disconnect()};o.start(t);o.stop(t+duration+.03)
   }
  }
  const start=()=>{
   if(disposed)return
   if(ctx){activity.setVolume(document.hidden?0:1);return}
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return
   ctx=new Audio();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);activity=createAudioActivity(ctx,master,{fade:.45});activity.setVolume(document.hidden?0:1)
   build=setTimeout(()=>{
    if(disposed)return
    for(const [index,[key,hz,type,seconds]] of [['wind',320,'lowpass',11.3],['leaves',2600,'bandpass',13.7],['surf',420,'lowpass',17.1],['water',1900,'bandpass',19.3],['rocks',780,'bandpass',23.9]].entries()){
     const rate=22050,buffer=ctx.createBuffer(1,Math.floor(rate*seconds),rate),data=buffer.getChannelData(0)
     for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1
     const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),pan=ctx.createStereoPanner()
     source.buffer=buffer;source.loop=true;source.playbackRate.value=.94+Math.random()*.12;filter.type=type;filter.frequency.value=hz;filter.Q.value=.6;gain.gain.value=0;pan.pan.value=(index-2)*.12
     source.connect(filter).connect(gain).connect(pan).connect(master);source.start(0,Math.random()*seconds);sources.push(source);bands.push({key,filter,gain,index})
    }
    nextBird=ctx.currentTime+2+Math.random()*5
    timer=setInterval(()=>{
     activity.setVolume(document.hidden?0:1)
     if(document.hidden||ctx.state!=='running')return
     const now=ctx.currentTime,s=state.current,mix=environmentMix(position.current,s.zone,s.weather,s.time),wind=windEnvelope(now,windStrength(s.weather))
     for(const b of bands){
      const pulse=b.key==='surf'||b.key==='rocks'?.25+.75*Math.pow(.5+.5*Math.sin(now*.37+Math.sin(now*.071)*1.7+b.index),b.key==='rocks'?4:1):.8+.2*Math.sin(now*.23+b.index)
      b.gain.gain.setTargetAtTime(mix[b.key]*pulse,now,.8)
      if(b.key==='leaves')b.filter.frequency.setTargetAtTime(1400+wind*2500,now,.5)
     }
     if(now>=nextBird){nextBird=now+nextBirdDelay();if(!document.hidden&&mix.birds>.05)bird(mix.birds)}
    },150)
   },0)
  }
  const visibility=()=>activity?.setVolume(document.hidden?0:1)
  document.addEventListener('visibilitychange',visibility)
  window.addEventListener('pointerdown',start);window.addEventListener('keydown',start)
  return()=>{disposed=true;document.removeEventListener('visibilitychange',visibility);activity?.dispose();window.removeEventListener('pointerdown',start);window.removeEventListener('keydown',start);clearTimeout(build);clearInterval(timer);sources.forEach(s=>{try{s.stop()}catch{}});activeBirds.forEach(s=>{try{s.stop()}catch{}});ctx?.close().catch(()=>{})}
 },[position])
}
