import React,{useState} from 'react'
import {recordStorage} from './recordStorage'
import {cinemaCurtain} from './cafeExpansion'
import {CINEMA_KIT_ITEMS,readCinemaKit} from './cinemaKitState'

export default function CinemaLobbyPanel({onClose}){
 const [kit,setKit]=useState(()=>{try{return readCinemaKit(recordStorage.getItem('mll-cinema-kit'))}catch{return readCinemaKit(null)}}),[error,setError]=useState('')
 const choose=(key,value)=>{try{const next={...kit,[key]:value};recordStorage.setItem('mll-cinema-kit',JSON.stringify(next));setKit(next);setError('')}catch{setError('준비 목록을 저장하지 못했습니다. 다시 선택해주세요.')}}
 return <section className="cafe-invitation">
  <p className="eyebrow">BOOk · CINEMA LOBBY</p><h2>영화 속으로 들어가기 전에</h2>
  <p>필요한 것만 골라주세요. 준비물 없이 입장해도 좋습니다.</p>
  <fieldset style={{border:'1px solid #c6b99e',borderRadius:12,padding:16}}><legend>오늘 챙길 것</legend>
   {CINEMA_KIT_ITEMS.map(([key,label])=><label key={key} style={{display:'flex',alignItems:'center',gap:12,minHeight:48,cursor:'pointer'}}><input type="checkbox" checked={kit[key]} onChange={e=>choose(key,e.target.checked)}/>{label}</label>)}
  </fieldset>
  <p role="status">{error||`${CINEMA_KIT_ITEMS.filter(([key])=>kit[key]).length}개 선택 · 앉으면 담요·쿠션·간식이 표시됩니다.`}</p>
  <button type="button" onClick={()=>{cinemaCurtain.open=true;onClose?.()}}>준비 완료 · 커튼 열기</button>
  <p>커튼이 열리면 바닥을 클릭해 이동하세요. 좌석 앞에서 E로 앉고, 다시 E로 일어납니다.</p>
  <small>슬리퍼는 여우·래브라도 캐릭터에 표시됩니다. 실제 주문·결제 기능은 없습니다.</small>
 </section>
}
