import React,{useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
export const profiling=typeof window!=='undefined'&&new URLSearchParams(window.location.search).has('perf')
const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))]||0
export function FrameProfiler(){
 const run=useRef(null)
 useEffect(()=>{const start=()=>{run.current={warmup:2,time:0,frames:[],cpu:[],calls:[],triangles:[]}};window.addEventListener('library-profile-start',start);return()=>window.removeEventListener('library-profile-start',start)},[])
 useFrame(({gl,scene,camera},dt)=>{
  const start=performance.now();gl.render(scene,camera);const cpu=performance.now()-start,r=run.current
  if(!r)return
  if(r.warmup>0){r.warmup-=dt;return}
  r.time+=dt;r.frames.push(dt*1000);r.cpu.push(cpu);r.calls.push(gl.info.render.calls);r.triangles.push(gl.info.render.triangles)
  if(r.time>=6){
   window.dispatchEvent(new CustomEvent('library-profile-result',{detail:{fps:Number((r.frames.length/r.time).toFixed(1)),frameP50:percentile(r.frames,.5).toFixed(1),frameP95:percentile(r.frames,.95).toFixed(1),renderP50:percentile(r.cpu,.5).toFixed(1),calls:percentile(r.calls,.5),triangles:percentile(r.triangles,.5),frames:r.frames.length,width:gl.domElement.width,height:gl.domElement.height,visibility:document.visibilityState,warning:r.frames.length<12?'샘플 부족: 백그라운드 프레임 제한 여부를 확인하세요.':null}}));run.current=null
  }
 },1)
 return null
}
export default function PerformancePanel({onTravel}){
 const [result,setResult]=useState(null),[room,setRoom]=useState('estate'),[running,setRunning]=useState(false)
 useEffect(()=>{const done=e=>{setResult(e.detail);setRunning(false)};window.addEventListener('library-profile-result',done);return()=>window.removeEventListener('library-profile-result',done)},[])
 if(!profiling)return null
 return <aside style={{position:'fixed',top:75,right:8,zIndex:100,padding:12,background:'#fff7e9',color:'#342d27',maxWidth:330,fontSize:13}} aria-label="성능 측정">
 <strong>성능 측정 · 2초 준비 + 6초 수집</strong><div><select aria-label="측정 공간" value={room} disabled={running} onChange={e=>{setRoom(e.target.value);onTravel(e.target.value);setResult(null)}}>{[['estate','정원'],['main','중앙 홀'],['lounge','라운지'],['reading','열람실'],['corridor','북쪽 복도'],['greenhouse','온실 입구'],['attic','다락']].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><button disabled={running} onClick={()=>{setRunning(true);setResult(null);window.dispatchEvent(new Event('library-profile-start'))}}>측정 시작</button></div>
 <output style={{display:'block',whiteSpace:'pre-wrap'}}>{running?'측정 중…':result?JSON.stringify({room,...result},null,2):'이동 후 화면이 준비되면 측정하세요.'}</output>
 </aside>
}
