import React,{useEffect,useState} from 'react'
import {GAME_SPOTS,HERBS,shuffled,ordered,swapBooks,cipherFeedback} from './miniGames'

function Memory(){
 const [cards,setCards]=useState(()=>shuffled([...HERBS,...HERBS])),[flipped,setFlipped]=useState([]),[matched,setMatched]=useState([]),[moves,setMoves]=useState(0)
 useEffect(()=>{
  if(flipped.length!==2)return
  const same=cards[flipped[0]]===cards[flipped[1]]
  const timer=setTimeout(()=>{if(same)setMatched(m=>[...m,...flipped]);setFlipped([])},same?300:900)
  return()=>clearTimeout(timer)
 },[flipped,cards])
 return <><p>같은 식물 카드 두 장을 찾아 온실의 작은 허브 도감을 완성하세요.</p><div className="mini-grid">{cards.map((v,i)=><button key={i} disabled={matched.includes(i)||flipped.includes(i)||flipped.length===2} aria-label={`${i+1}번 카드 ${matched.includes(i)||flipped.includes(i)?v:'뒤집기'}`} onClick={()=>{setFlipped(f=>[...f,i]);if(flipped.length===1)setMoves(m=>m+1)}}>{matched.includes(i)||flipped.includes(i)?v:'❧'}</button>)}</div><p role="status">{matched.length===8?'허브 도감 완성! ':''}{moves}회 시도 · {matched.length/2}/4쌍</p><button onClick={()=>{setCards(shuffled([...HERBS,...HERBS]));setMatched([]);setFlipped([]);setMoves(0)}}>새 카드 섞기</button></>
}
function Shelves(){
 const [items,setItems]=useState([4,2,5,1,3]),[selected,setSelected]=useState(null),[moves,setMoves]=useState(0)
 const won=ordered(items)
 return <><p>두 권을 차례로 선택해 자리를 바꾸세요. 1권부터 5권까지 왼쪽에서 오른쪽으로 정리하면 완성됩니다.</p><div className="mini-books">{items.map((n,i)=><button key={i} aria-pressed={selected===i} disabled={won} onClick={()=>{if(selected===null)setSelected(i);else{if(selected!==i){setItems(swapBooks(items,selected,i));setMoves(m=>m+1)}setSelected(null)}}}>{n}권</button>)}</div><p role="status">{won?'서가 정리 완료!':selected===null?'옮길 책을 선택하세요.':'자리를 바꿀 두 번째 책을 선택하세요.'} · {moves}회 교환</p><button onClick={()=>{const next=shuffled([1,2,3,4,5]);setItems(ordered(next)?[2,1,3,4,5]:next);setSelected(null);setMoves(0)}}>새 퍼즐</button></>
}
function Cipher(){
 const makeCode=()=>shuffled(['1','2','3','4','5','6']).slice(0,3).join('')
 const [code,setCode]=useState(makeCode),[guess,setGuess]=useState(''),[history,setHistory]=useState([]),[error,setError]=useState('')
 const won=history.some(h=>h.won)
 return <><p>서랍의 암호는 1–6 중 서로 다른 숫자 세 개입니다. 숫자와 위치가 맞는 개수, 숫자만 맞는 개수를 단서로 추리하세요.</p><form onSubmit={e=>{e.preventDefault();if(won)return;const result=cipherFeedback(guess,code);if(result.error){setError(result.error);return}setError('');setHistory(h=>[...h,{guess,...result}]);setGuess('')}}><label>암호 <input aria-label="세 자리 암호" inputMode="numeric" maxLength={3} value={guess} onChange={e=>setGuess(e.target.value.replace(/[^1-6]/g,''))} disabled={won}/></label><button disabled={won||guess.length!==3}>자물쇠 확인</button></form><p role="status">{error|| (won?'찰칵! 오래된 연구 노트를 발견했습니다.':'암호를 추리해 보세요.')}</p><ol className="cipher-history">{history.map((h,i)=><li key={i}>{h.guess} — 숫자·위치 일치 {h.exact}개 / 숫자만 일치 {h.near}개</li>)}</ol><button onClick={()=>{setCode(makeCode());setHistory([]);setGuess('');setError('')}}>새 자물쇠</button></>
}
export default function MiniGames({kind}){return <><h2>{GAME_SPOTS.find(g=>g.id===kind)?.title}</h2>{kind==='herbs'?<Memory/>:kind==='shelves'?<Shelves/>:<Cipher/>}</>}
