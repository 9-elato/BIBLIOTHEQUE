import React,{useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import {createProfileRun,sampleProfile,profileResult} from './profileMetrics'
export const profiling=typeof window!=='undefined'&&new URLSearchParams(window.location.search).has('perf')
export function FrameProfiler(){
 const run=useRef(null)
 useEffect(()=>{
  const hidden=()=>{if(run.current&&document.visibilityState!=='visible'){run.current.invalid=true;window.dispatchEvent(new CustomEvent('library-profile-result',{detail:profileResult(run.current)}));run.current=null}}
  const start=e=>{run.current={...createProfileRun(performance.now(),{...e.detail,browser:navigator.userAgent,devicePixelRatio:window.devicePixelRatio}),invalidGeometry:[]};hidden()}
  window.addEventListener('library-profile-start',start);document.addEventListener('visibilitychange',hidden)
  return()=>{window.removeEventListener('library-profile-start',start);document.removeEventListener('visibilitychange',hidden)}
 },[])
 useFrame(({gl,scene,camera},dt)=>{
  const start=performance.now();gl.render(scene,camera);const cpu=performance.now()-start,r=run.current
  if(!r)return
  Object.assign(r.context,{width:gl.domElement.width,height:gl.domElement.height,cameraPosition:camera.position.toArray(),cameraQuaternion:camera.quaternion.toArray(),fov:camera.fov??null})
  const phase=sampleProfile(r,performance.now(),{cpu,calls:gl.info.render.calls,triangles:gl.info.render.triangles},document.visibilityState==='visible')
  if(!Number.isFinite(gl.info.render.triangles)&&!r.invalidGeometry.length){
   scene.traverseVisible(o=>{const g=o.geometry;if(g?.isInstancedBufferGeometry&&!Number.isFinite(g.instanceCount))r.invalidGeometry.push({name:o.name||o.type,geometry:g.type,instanceCount:String(g.instanceCount),maxInstances:String(g._maxInstanceCount)})})
  }
  if(phase==='complete'||phase==='hidden'){
   window.dispatchEvent(new CustomEvent('library-profile-result',{detail:{...profileResult(r),invalidGeometry:r.invalidGeometry}}));run.current=null
  }
 },1)
 return null
}
export default function PerformancePanel({onTravel}){
 const [result,setResult]=useState(null),[room,setRoom]=useState('estate'),[running,setRunning]=useState(false)
 const [device,setDevice]=useState(''),[history,setHistory]=useState([])
 const [interactions,setInteractions]=useState([])
 useEffect(()=>{const record=e=>setInteractions(rows=>[...rows.slice(-99),e.detail]);window.addEventListener('library-interaction-result',record);return()=>window.removeEventListener('library-interaction-result',record)},[])
 useEffect(()=>{const done=e=>{setResult(e.detail);setHistory(rows=>[...rows.slice(-29),e.detail]);setRunning(false)};window.addEventListener('library-profile-result',done);return()=>window.removeEventListener('library-profile-result',done)},[])
 if(!profiling)return null
 const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({device,frames:history,interactions},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='library-performance.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <aside style={{position:'fixed',top:75,right:8,zIndex:100,padding:12,background:'#fff7e9',color:'#342d27',maxWidth:330,maxHeight:'75vh',overflowY:'auto',fontSize:13}} aria-label="성능 측정">
 <strong>성능 측정 · 2초 준비 + 30초 수집</strong>
 <p>같은 위치·시야·창 크기로 비교하세요. 화면이 숨겨지면 취소됩니다.</p>
 <input aria-label="기기와 측정 조건" placeholder="PC2 / GPU / 전원 모드 / 캐릭터" disabled={running} value={device} onChange={e=>setDevice(e.target.value)}/>
 <div><select aria-label="측정 공간" value={room} disabled={running} onChange={e=>{setRoom(e.target.value);onTravel(e.target.value);setResult(null)}}>{[['estate','정원'],['main','중앙 홀'],['lounge','라운지'],['reading','열람실'],['corridor','북쪽 복도'],['greenhouse','온실 입구'],['attic','다락'],['terrace','별빛 테라스'],['veranda','바다 마루'],['study','작업실'],['cafe','북카페'],['basement','숲 라운지'],['bathroom','숲 온천'],['meadow','잔디 들판']].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><button disabled={running} onClick={()=>{onTravel(room);setRunning(true);setResult(null);window.dispatchEvent(new CustomEvent('library-profile-start',{detail:{room,device,startedAt:new Date().toISOString()}}))}}>측정 시작</button><button disabled={running||(!history.length&&!interactions.length)} onClick={download}>결과 저장</button></div>
 {interactions.length>0&&<p>E/클릭 기록 {interactions.length}회 · 최근 처리 {interactions.at(-1).handlerMs.toFixed(1)}ms · 다음 프레임 콜백 {interactions.at(-1).nextFrameCallbackMs.toFixed(1)}ms<br/>다음 콜백 시간은 화면 표시 완료 시간이 아닙니다.</p>}
 <output style={{display:'block',whiteSpace:'pre-wrap'}}>{running?'측정 중… 32초 동안 창을 열어 두세요.':result?JSON.stringify(result,null,2):'렌더 시간은 GPU 완료 시간이 아닌 CPU 호출 시간입니다.'}</output>
 </aside>
}
