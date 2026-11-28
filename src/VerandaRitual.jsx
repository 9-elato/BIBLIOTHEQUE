import React,{useState,useEffect} from 'react'
import {TEAS,teaStep,breathState} from './verandaRitual.js'
export default function VerandaRitual({kind}){
 const [tea,setTea]=useState({stage:'choose',elapsed:0,sips:0}),[choice,setChoice]=useState(0)
 const [playing,setPlaying]=useState(false),[elapsed,setElapsed]=useState(0),[duration,setDuration]=useState(60)
 useEffect(()=>{const timer=setInterval(()=>{if(document.hidden)return;if(kind==='tea')setTea(s=>teaStep(s,.25));else if(playing)setElapsed(t=>Math.min(duration,t+.25))},250);return()=>clearInterval(timer)},[kind,playing,duration])
 useEffect(()=>{window.dispatchEvent(new CustomEvent('veranda-ritual-state',{detail:{kind,stage:tea.stage,elapsed:tea.elapsed,color:TEAS[choice].color,breathing:playing&&elapsed<duration}}))},[kind,tea,choice,playing,elapsed,duration])
 useEffect(()=>()=>window.dispatchEvent(new CustomEvent('veranda-ritual-state',{detail:null})),[])
 const breath=breathState(elapsed),done=elapsed>=duration
 if(kind==='meditation')return <>
  <h2>바다를 바라보며 숨 고르기</h2><p>편한 자세로 어깨의 힘을 풀어 보세요. 원이 커지면 들이쉬고, 작아지면 내쉽니다. 자신의 편한 호흡에 맞춰 쉬어도 좋습니다.</p>
  <div aria-hidden="true" style={{height:150,display:'grid',placeItems:'center'}}><div style={{width:110,height:110,borderRadius:'50%',background:'radial-gradient(circle,#dce9df,#84aaa3)',transform:`scale(${breath.size})`,transition:'transform .25s linear'}}/></div>
  <p role="status">{done?'잠시 쉬어 가는 시간을 마쳤습니다.':playing?breath.phase:'준비되면 시작하세요.'}</p>
  <label>명상 시간 <select value={duration} disabled={playing&&!done} onChange={e=>{setDuration(Number(e.target.value));setElapsed(0)}}><option value={60}>1분</option><option value={180}>3분</option><option value={300}>5분</option></select></label>
  <p>{Math.floor(elapsed/60)}:{String(Math.floor(elapsed%60)).padStart(2,'0')} · {breath.cycles}회 호흡</p>
  <button onClick={()=>{if(done)setElapsed(0);setPlaying(!playing||done)}}>{done?'다시 쉬기':playing?'잠시 멈추기':'명상 시작'}</button><button onClick={()=>{setPlaying(false);setElapsed(0)}}>처음으로</button>
 </>
 const stage=tea.stage,progress=stage==='steeping'?tea.elapsed/12:tea.elapsed/2.4
 return <>
  <h2>바다 마루의 차 시간</h2><p>차를 고르고 물을 따른 뒤, 향이 우러날 때까지 기다려 보세요.</p>
  <div className="choice-row">{TEAS.map((item,i)=><button key={item.name} aria-pressed={choice===i} disabled={!['choose','empty'].includes(stage)} onClick={()=>setChoice(i)}>{item.name}</button>)}</div>
  <svg viewBox="0 0 320 180" role="img" aria-label={`${TEAS[choice].name} 찻잔, ${6-tea.sips}모금 남음`} style={{width:'100%',maxHeight:200}}>
   <ellipse cx="155" cy="151" rx="88" ry="12" fill="#c1ad8e"/>
   <g transform={stage==='sipping'?`translate(0 ${-25*Math.sin(progress*Math.PI)}) rotate(${-8*Math.sin(progress*Math.PI)} 150 110)`:''}>
    <path d="M218 86c54-8 45 64-10 41" fill="none" stroke="#b7a68c" strokeWidth="12"/>
    <path d="M80 77h140l-13 62q-55 24-114 0Z" fill="#eee4d2" stroke="#b7a68c" strokeWidth="3"/>
    {!['choose','empty'].includes(stage)&&<ellipse cx="150" cy="80" rx="65" ry="14" fill={TEAS[choice].color} opacity={stage==='pouring'?Math.min(1,progress*2):1-tea.sips*.09}/>}
   </g>
   {stage==='pouring'&&<path d="M190 14q-40 15-40 62" fill="none" stroke="#c7d9d5" strokeWidth="6"/>}
   {['steeping','ready'].includes(stage)&&[120,150,180].map(x=><path key={x} d={`M${x} 57q-12-10 0-20t0-20`} fill="none" stroke="#b7cbc6" opacity=".6" strokeWidth="2"/>)}
  </svg>
  <p role="status">{stage==='choose'?'찻잎을 골랐으면 물을 따라주세요.':stage==='pouring'?'천천히 물을 따르는 중…':stage==='steeping'?`향이 우러나는 중 · ${Math.ceil(12-tea.elapsed)}초`:stage==='sipping'?'찻잔을 들어 천천히 한 모금…':stage==='empty'?'찻잔을 비웠습니다. 바다를 보며 여운을 즐겨보세요.':`${TEAS[choice].name} 준비 완료 · ${6-tea.sips}모금 남음`}</p>
  {stage==='steeping'&&<progress value={tea.elapsed} max="12" aria-label="차 우리는 시간"/>}
  <button disabled={['pouring','steeping','sipping'].includes(stage)} onClick={()=>setTea(s=>stage==='ready'?{...s,stage:'sipping',elapsed:0}:{stage:'pouring',elapsed:0,sips:0})}>{stage==='ready'?'차 한 모금 마시기':stage==='empty'?'차 다시 우리기':'물 따르기'}</button>
 </>
}
