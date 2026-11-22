import React,{useEffect,useState} from 'react'
import {youtubeVideoId} from './cinemaLink'
export default function CinemaControls(){
 const [playing,setPlaying]=useState(false)
 useEffect(()=>{const change=e=>setPlaying(Boolean(e.detail));window.addEventListener('library-cinema-video',change);return()=>window.removeEventListener('library-cinema-video',change)},[])
 const [open,setOpen]=useState(false),[url,setUrl]=useState(''),[error,setError]=useState('')
 useEffect(()=>{const show=()=>setOpen(true);window.addEventListener('library-cinema-open',show);return()=>window.removeEventListener('library-cinema-open',show)},[])
 if(!open)return playing?<button style={{position:'fixed',top:90,right:20,zIndex:40}} onClick={()=>setOpen(true)}>🎞 다락 영화 · 변경 / 종료</button>:null
 return <div className="experience-backdrop"><section className="experience-dialog" role="dialog" aria-modal="true" aria-label="다락 영화관" onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape')setOpen(false)}}><button className="experience-close" onClick={()=>setOpen(false)}>닫기 ×</button><h2>누워서 보는 다락 영화관</h2><p>YouTube 영상 링크를 붙여 넣으세요. 스크린의 재생 버튼을 눌러 시작합니다.</p><form onSubmit={e=>{e.preventDefault();const id=youtubeVideoId(url);if(!id){setError('올바른 YouTube 영상 링크를 입력해 주세요.');return}window.dispatchEvent(new CustomEvent('library-cinema-video',{detail:id}));setError('');setOpen(false)}}><input autoFocus aria-label="YouTube 영상 링크" type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" style={{width:'100%'}}/><p role="alert">{error}</p><button type="submit">빔 스크린에 띄우기</button></form><button onClick={()=>{window.dispatchEvent(new CustomEvent('library-cinema-video',{detail:''}));setOpen(false)}}>영상 종료</button><p>임베드가 제한된 영상은 재생되지 않을 수 있습니다.</p>{youtubeVideoId(url)&&<a href={url} target="_blank" rel="noreferrer">YouTube에서 열기</a>}</section></div>
}
