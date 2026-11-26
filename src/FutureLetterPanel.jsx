import {recordStorage} from './recordStorage'
import React,{useState,useEffect} from 'react'
import {readLetters,postLetter,koreaDate,nextYear,LETTER_KEY} from './futureLetters'
export default function FutureLetterPanel(){
 const [letters,setLetters]=useState([]),[title,setTitle]=useState(''),[body,setBody]=useState(''),[error,setError]=useState(''),[status,setStatus]=useState(''),[opened,setOpened]=useState(null),[today,setToday]=useState(koreaDate)
 const refresh=()=>{try{setLetters(readLetters(recordStorage));setError('')}catch(e){setError(e.message)}}
 useEffect(()=>{refresh();const change=e=>{if(e.key===LETTER_KEY)refresh()},timer=setInterval(()=>setToday(koreaDate()),60000);window.addEventListener('library-records-updated',refresh);window.addEventListener('storage',change);return()=>{clearInterval(timer);window.removeEventListener('library-records-updated',refresh);window.removeEventListener('storage',change)}},[])
 return <section className="cafe-invitation"><p className="invitation-kicker">유령단의 느린 우편함</p><h2>1년 뒤의 나에게</h2><p>사라지는 오늘의 마음을, 남아 있을 내일의 나에게 전합니다.</p>
 <p className="invitation-note">로그인 후 동기화를 완료하면 같은 계정으로 편지를 이어 볼 수 있습니다. 이메일 발송은 아닙니다. 봉인은 화면상의 열람 제한이며 암호화 봉인은 아닙니다.</p>
 <form onSubmit={e=>{e.preventDefault();try{const letter=postLetter(recordStorage,{title,body});refresh();setTitle('');setBody('');setStatus(`${letter.openOn}에 열어볼 편지를 보관했습니다.`)}catch(err){setError(err.message)}}}>
 <label>봉투에 적을 제목<input value={title} maxLength={100} onChange={e=>setTitle(e.target.value)} placeholder="1년 뒤의 나에게"/></label>
 <label>오늘 남기는 편지<textarea value={body} maxLength={10000} required rows={8} onChange={e=>setBody(e.target.value)} placeholder="지금 읽고 있는 책, 잊고 싶지 않은 순간, 미래의 나에게 묻고 싶은 것…"/></label>
 <p>오늘 보내면 {nextYear(today)}부터 열어볼 수 있습니다. (한국 날짜 기준)</p><button type="submit" disabled={!body.trim()}>편지 봉인해 넣기</button>
 </form><p role="alert">{error}</p><p role="status">{status}</p>
 <h3>보관 중인 편지 {letters.length}통</h3>{letters.length>0&&<button onClick={()=>{const blob=new Blob([JSON.stringify(letters,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='유령단-편지-백업.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>편지 백업 다운로드 (본문 포함)</button>}
 {letters.map(l=><article key={l.id} style={{borderTop:'1px dashed #cbb99a',padding:'14px 0'}}><b>{l.title}</b><p>{l.createdOn} 작성 · {l.openOn} 개봉</p>{today>=l.openOn?<><button onClick={()=>setOpened(opened===l.id?null:l.id)}>{opened===l.id?'접기':'도착한 편지 열기'}</button>{opened===l.id&&<p className="read-text">{l.body}</p>}</>:<small>아직 여행 중인 편지입니다.</small>}</article>)}
 </section>
}
