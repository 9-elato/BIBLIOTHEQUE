import CatPaw from './CatPaw'
import React,{useState} from 'react'
import {BookPlus,ClipboardList,BookOpen,Music2,Film} from 'lucide-react'
import {ATTENDANCE_KEY,readVisits,stampVisit,localDateKey,activityCounts} from './activityRecords'
export default function LibraryActivity({books,owner,onRegister,onOrder,onBook,onCatalog,onMusic,onMovies,legacyNote}){
 const [initial]=useState(()=>{try{return {days:readVisits(localStorage),error:''}}catch(e){return {days:[],error:e.message}}})
 const [days,setDays]=useState(initial.days),[error,setError]=useState(initial.error),[tab,setTab]=useState('attendance')
 const today=localDateKey(),month=today.slice(0,7),counts=activityCounts(books),stamped=days.includes(today)
 const now=new Date(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),offset=new Date(now.getFullYear(),now.getMonth(),1).getDay()
 function stamp(){try{const latest=readVisits(localStorage),next=stampVisit(latest);localStorage.setItem(ATTENDANCE_KEY,JSON.stringify(next));setDays(next);setError('')}catch(e){setError('도장을 저장하지 못했습니다. '+e.message)}}
 const list=books.filter(b=>tab==='orders'?b.status==='읽고 싶음':tab==='register'?b.status==='완독':b.notes||b.quote||b.status==='읽는 중')
 return <section className="library-activity"><p className="eyebrow">MY LITTLE LIBRARY · ACTIVITY DESK</p><h2>도서관 활동</h2>
 <nav className="activity-tabs" aria-label="도서관 활동 분류">{[['attendance','고양이 발자국 출석',CatPaw],['register','등록 대장',BookPlus],['reading','독서 기록',BookOpen],['orders','희망 도서 주문장',ClipboardList]].map(([id,label,Icon])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}</nav>
 <div className="activity-counts"><span>등록 {counts.registered}권</span><span>열람 중 {counts.reading}권</span><span>주문 {counts.orders}권</span></div>
 {tab==='attendance'?<><h3>{now.getFullYear()}년 {now.getMonth()+1}월 · 서가에 남긴 발자국</h3><button className="stamp-button" disabled={stamped||Boolean(initial.error)} onClick={stamp}><CatPaw size={25}/>{stamped?'오늘의 도장을 찍었습니다':'고양이 발자국 찍기'}</button><div className="attendance-calendar">{['일','월','화','수','목','금','토'].map(d=><b key={d}>{d}</b>)}{Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:last},(_,i)=>{const key=month+'-'+String(i+1).padStart(2,'0'),yes=days.includes(key);return <div key={key} className={yes?'stamped':''} aria-label={`${key}${yes?' 출석':''}`}><small>{i+1}</small>{yes&&<CatPaw size={24}/>}</div>})}</div><p>누적 방문 {days.length}일 · 이번 달 {days.filter(d=>d.startsWith(month)).length}일</p><p className="help-text">출석 도장은 현재 브라우저에 저장됩니다.</p>{error&&<p role="alert">{error}</p>} {legacyNote&&<details><summary>이전에 작성한 메모 보기</summary><p style={{whiteSpace:'pre-wrap'}}>{legacyNote}</p></details>}</>:<>
 <h3>{tab==='orders'?'읽고 싶은 책을 주문장에 담아두세요':tab==='register'?'읽은 책과 완독일을 등록하세요':'책을 선택해 감상과 인용문을 남기세요'}</h3>
 {owner&&<button className="accent" onClick={tab==='orders'?onOrder:tab==='register'?onRegister:onCatalog}>{tab==='orders'?'+ 읽을 책 주문 등록':tab==='register'?'+ 읽은 책 등록':'책장으로 가서 독서 기록 작성'}</button>}
 <div className="activity-ledger">{list.length?list.map((b,i)=><button key={b.id} onClick={()=>onBook(b.id)}><span>{String(i+1).padStart(3,'0')}</span><strong>{b.title}<small>{b.author}</small></strong><span>{tab==='orders'?'주문 대기':b.status}<small>{b.completed||''}</small></span></button>):<p className="help-text">아직 기록이 없습니다.</p>}</div></>}
 <div className="activity-links"><button onClick={onCatalog}><BookOpen size={16}/> 전체 책장</button><button onClick={onMusic}><Music2 size={16}/> LP 음악</button><button onClick={onMovies}><Film size={16}/> 영화 기록</button></div></section>
}
