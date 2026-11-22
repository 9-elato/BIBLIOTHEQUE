import React,{useEffect,useRef,useState} from 'react'
import {youtubeAPI,playlistRequest,PLAYLIST_URL} from './youtubeRecords'
export function RecordShelf({selection,onSelect,tracks}){
 return <><p className="eyebrow">DAWNTABLE RECORD COLLECTION</p><h2>오늘의 LP를 골라보세요</h2><p className="help-text">기존 재생목록의 영상 10개를 한 장씩 골라 듣습니다. 방을 나가도 음악은 계속 이어집니다.</p>
 <div className="record-shelf">{Array.from({length:10},(_,i)=><button key={i} className={'record-sleeve '+(selection?.index===i?'selected':'')} onClick={()=>onSelect(i)} aria-pressed={selection?.index===i}>
 <span className="vinyl-art" style={{'--record-color':['#79545b','#677b70','#aa8059','#526c83','#8b7b96'][i%5]}}>{tracks[i]&&<img src={`https://i.ytimg.com/vi/${tracks[i]}/mqdefault.jpg`} alt="" loading="lazy"/>}<span className="vinyl-disc"/></span><strong>LP {String(i+1).padStart(2,'0')}</strong><small>{selection?.index===i?'선택한 음반':'턴테이블에 올리기'}</small></button>)}</div>
 <a href={PLAYLIST_URL} target="_blank" rel="noreferrer">YouTube에서 전체 재생목록 보기 ↗</a></>
}
export default function RecordPlayer({selection,onSelect,onStop,onTracks,onOpenShelf}){
 const mount=useRef(),player=useRef(),latest=useRef(selection),applied=useRef(-1)
 latest.current=selection
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[expanded,setExpanded]=useState(false),[message,setMessage]=useState('연결 중…'),[retry,setRetry]=useState(0)
 const active=Boolean(selection)
 useEffect(()=>{
  if(!active)return
  let cancelled=false,poll
  setReady(false);setMessage('연결 중…')
  youtubeAPI().then(YT=>{
   if(cancelled)return
   const host=document.createElement('div');mount.current.appendChild(host)
   player.current=new YT.Player(host,{host:'https://www.youtube-nocookie.com',width:320,height:200,playerVars:{playsinline:1,origin:window.location.origin},events:{
    onReady:e=>{if(cancelled)return;setReady(true);applied.current=latest.current.seq;e.target.loadPlaylist(playlistRequest(latest.current.index));let attempts=0;poll=setInterval(()=>{const ids=e.target.getPlaylist?.();if(ids?.length){onTracks(ids.slice(0,10));clearInterval(poll)}else if(++attempts>15)clearInterval(poll)},700)},
    onStateChange:e=>{if(cancelled)return;setPlaying(e.data===1);if(e.data===1){setMessage('');setExpanded(false);const index=e.target.getPlaylistIndex();if(index>=0&&index<10&&index!==latest.current.index)onSelect(index,true)}else if(e.data===3)setMessage('불러오는 중…');else if(e.data===2)setMessage('일시정지');else if(e.data===5)setMessage('재생 버튼을 눌러주세요.')},
    onAutoplayBlocked:()=>{if(cancelled)return;setMessage('영상의 재생 버튼을 눌러주세요.');setExpanded(true)},
    onError:()=>{if(cancelled)return;setPlaying(false);setMessage('이 영상은 여기서 재생할 수 없습니다. 다른 LP 또는 YouTube 원본을 선택하세요.');setExpanded(true)}
   }})
  }).catch(e=>{if(!cancelled){setMessage(e.message);setExpanded(true)}})
  return()=>{cancelled=true;clearInterval(poll);player.current?.destroy();player.current=null;mount.current?.replaceChildren();setReady(false);setPlaying(false);applied.current=-1}
 },[active,retry])
 useEffect(()=>{if(ready&&selection&&applied.current!==selection.seq){applied.current=selection.seq;setMessage('불러오는 중…');player.current.loadPlaylist(playlistRequest(selection.index))}},[selection,ready])
 if(!active)return null
 return <aside className="music-dock" aria-label="저택 음악">
  <div className="music-controls"><button onClick={onOpenShelf} title="LP 고르기">♫ LP {String(selection.index+1).padStart(2,'0')}</button><button disabled={!ready} onClick={()=>playing?player.current.pauseVideo():player.current.playVideo()} aria-label={playing?'음악 일시정지':'음악 재생'}>{playing?'Ⅱ':'▶'}</button><button onClick={onStop} aria-label="음악 종료">■</button><button onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} aria-label="영상 플레이어 펼치기">{expanded?'▴':'▾'}</button></div>
  <div className={'music-video '+(expanded?'expanded':'collapsed')}><div ref={mount}/>{message&&<p role="status">{message}</p>}<a href={PLAYLIST_URL} target="_blank" rel="noreferrer">YouTube에서 듣기 ↗</a>{!ready&&<button onClick={()=>setRetry(v=>v+1)}>다시 연결</button>}</div>
 </aside>
}

