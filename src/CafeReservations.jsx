import React,{useState,useEffect} from 'react'
import {PRIVATE_ROOMS} from './cafeExpansion'
import {recordStorage} from './recordStorage'
import {RESERVATION_KEY,ROOM_SLOTS,koreaDay,reserveRoom} from './cafeReservations'
const read=()=>{try{const v=JSON.parse(recordStorage.getItem(RESERVATION_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
export default function CafeReservations({roomId}){
 const [records,setRecords]=useState(read),[room,setRoom]=useState(roomId||PRIVATE_ROOMS[0].id),[date,setDate]=useState(koreaDay),[time,setTime]=useState('10:00'),[message,setMessage]=useState('')
 useEffect(()=>{const update=()=>setRecords(read());window.addEventListener('library-records-updated',update);return()=>window.removeEventListener('library-records-updated',update)},[])
 const save=next=>{recordStorage.setItem(RESERVATION_KEY,JSON.stringify(next));setRecords(next)}
 return <section className="cafe-invitation"><p className="eyebrow">2F · PRIVATE LOUNGE</p><h2>혼자 머무는 시간</h2><p>창가 · 안락 소파 · 발 받침대 · 담요 · 작은 테이블. 1인실 3개를 2시간 단위로 기록합니다.</p><p>현재는 개인 예약 수첩입니다. 다른 손님의 예약 현황 조회나 매장 확정 예약 기능은 아직 연결되지 않았습니다.</p>
 <form onSubmit={e=>{e.preventDefault();try{save(reserveRoom(read(),{roomId:room,date,time}));setMessage('예약 수첩에 저장했습니다. 매장 확정 예약은 아닙니다.')}catch(error){setMessage(error.message)}}}>
 <label>공간<select value={room} onChange={e=>setRoom(e.target.value)}>{PRIVATE_ROOMS.map(r=><option key={r.id} value={r.id}>{r.name} · 창가 1인실</option>)}</select></label>
 <label>날짜<input type="date" min={koreaDay()} required value={date} onChange={e=>setDate(e.target.value)}/></label><label>시작 시각<select value={time} onChange={e=>setTime(e.target.value)}>{ROOM_SLOTS.map(t=><option key={t}>{t}</option>)}</select></label><button type="submit">예약 수첩에 추가</button></form><p role="status">{message}</p>
 <h3>나의 이용 계획</h3>{records.length===0?<p>아직 기록한 일정이 없습니다.</p>:records.map(r=><p key={r.id}>{PRIVATE_ROOMS.find(room=>room.id===r.roomId)?.name} · {r.date} · {r.time}부터 2시간 <button onClick={()=>{try{save(read().filter(item=>item.id!==r.id));setMessage('이용 계획을 취소했습니다.')}catch{setMessage('취소 내용을 저장하지 못했습니다.')}}}>취소</button></p>)}
 </section>
}
