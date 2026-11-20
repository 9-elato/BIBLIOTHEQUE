import React,{useState} from 'react'
import {GENRES} from './layout'
import {TABLES,placementKey,placementLabel} from './placements'

export default function BookPlacementEditor({book,placements,onPlace}){
 const current=placements[book.id]
 const [destination,setDestination]=useState(current?.kind==='table'?`table:${current.tableId}`:`shelf:${current?.genre||'literature'}`)
 const [slot,setSlot]=useState(current?.slot||0)
 const [message,setMessage]=useState('')
 const [kind,id]=destination.split(':')
 const target={kind,slot,...(kind==='table'?{tableId:id}:{genre:id})}
 const max=kind==='table'?TABLES.find(t=>t.id===id).slots:Math.min(2400,Math.max(48,...Object.values(placements).filter(p=>p.kind==='shelf'&&p.genre===id).map(p=>(Math.floor(p.slot/24)+2)*24)))
 const occupied=new Set(Object.entries(placements).filter(([bookId])=>bookId!==book.id).map(([,p])=>placementKey(p)))
 return <section className="placement-editor" aria-label="책 배치">
  <h3>책의 자리</h3><p>{placementLabel(current)}</p>
  <label>배치할 곳<select value={destination} onChange={e=>{setDestination(e.target.value);setSlot(0);setMessage('')}}>
   <optgroup label="장르별 서가">{GENRES.map(g=><option key={g.id} value={'shelf:'+g.id}>{g.name} 서가</option>)}</optgroup>
   <optgroup label="독서 테이블">{TABLES.map(t=><option key={t.id} value={'table:'+t.id}>{t.name}</option>)}</optgroup>
  </select></label>
  <label>자리<select value={slot} onChange={e=>setSlot(Number(e.target.value))}>
   {Array.from({length:max},(_,i)=>{const taken=occupied.has(placementKey({...target,slot:i}));return <option key={i} value={i} disabled={taken}>{kind==='table'?`${i+1}번 자리`:`${Math.floor(i/24)+1}번 책장 · ${Math.floor(i%24/6)+1}단 ${i%6+1}칸`}{taken?' · 사용 중':''}</option>})}
  </select></label>
  <button className="accent" disabled={occupied.has(placementKey(target))} onClick={()=>{const result=onPlace(book.id,target);setMessage(result.error||'배치를 적용했습니다.')}}>이 자리에 놓기</button>
  <p className="help-text">책 배치는 현재 브라우저에 저장됩니다.</p>
  {message&&<p role="status">{message}</p>}
 </section>
}
