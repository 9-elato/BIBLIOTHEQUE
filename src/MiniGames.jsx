import React,{useEffect,useState} from 'react'
import {GAME_SPOTS,HERBS,shuffled,ordered,cipherFeedback,MEMORY_LIMIT,CIPHER_LIMIT,inversions,shelfPuzzle,adjacentSwap} from './miniGames'
function Memory(){
 const [cards,setCards]=useState(()=>shuffled([...HERBS,...HERBS])),[flipped,setFlipped]=useState([]),[matched,setMatched]=useState([]),[moves,setMoves]=useState(0)
 useEffect(()=>{if(flipped.length!==2)return;const pair=[...flipped],same=cards[pair[0]]===cards[pair[1]];const timer=setTimeout(()=>{if(same)setMatched(m=>[...m,...pair]);setFlipped([])},same?280:650);return()=>clearTimeout(timer)},[flipped,cards])
 const won=matched.length===cards.length,finished=won||(moves>=MEMORY_LIMIT&&flipped.length!==2)
 return <><p>식물 8쌍을 {MEMORY_LIMIT}회 안에 찾으세요. 서로 다른 카드는 잠깐 보여준 뒤 다시 뒤집힙니다.</p><div className="mini-grid">{cards.map((v,i)=><button key={i} disabled={finished||matched.includes(i)||flipped.includes(i)||flipped.length===2} aria-label={`${i+1}번 카드 ${matched.includes(i)||flipped.includes(i)?v:'뒤집기'}`} onClick={()=>{setFlipped(f=>[...f,i]);if(flipped.length===1)setMoves(m=>m+1)}}>{matched.includes(i)||flipped.includes(i)?v:'❧'}</button>)}</div><p role="status">{won?'허브 도감 완성!':finished?'시도 횟수를 모두 사용했습니다. 다시 도전해 보세요.':''} {moves}/{MEMORY_LIMIT}회 · {matched.length/2}/8쌍</p><button onClick={()=>{setCards(shuffled([...HERBS,...HERBS]));setMatched([]);setFlipped([]);setMoves(0)}}>새 카드 섞기</button></>
}
function Shelves(){
 const [items,setItems]=useState(shelfPuzzle),[selected,setSelected]=useState(null),[moves,setMoves]=useState(0),[limit,setLimit]=useState(null),[hint,setHint]=useState('')
 const budget=limit??inversions(items)+4,won=ordered(items),finished=won||moves>=budget
 return <><p>1–8권을 순서대로 정리하세요. 서로 이웃한 두 권만 교환할 수 있습니다. 최단 교환 횟수보다 4회만 더 허용됩니다.</p><div className="mini-books" style={{flexWrap:'wrap'}}>{items.map((n,i)=><button key={i} aria-pressed={selected===i} disabled={finished} onClick={()=>{if(selected===null){setSelected(i);setHint('');return}if(selected===i){setSelected(null);return}if(Math.abs(selected-i)!==1){setHint('바로 옆의 책만 교환할 수 있습니다.');return}setLimit(budget);setItems(adjacentSwap(items,selected,i));setMoves(m=>m+1);setSelected(null);setHint('')}}>{n}권</button>)}</div><p role="status">{won?'서가 정리 완료!':finished?'교환 횟수를 모두 사용했습니다.':hint||'이웃한 두 권을 선택하세요.'} · {moves}/{budget}회 교환</p><button onClick={()=>{setItems(shelfPuzzle());setSelected(null);setMoves(0);setLimit(null);setHint('')}}>새 퍼즐</button></>
}
function Cipher(){
 const makeCode=()=>shuffled(['1','2','3','4','5','6','7','8']).slice(0,4).join('')
 const [code,setCode]=useState(makeCode),[guess,setGuess]=useState(''),[history,setHistory]=useState([]),[error,setError]=useState('')
 const won=history.some(h=>h.won),finished=won||history.length>=CIPHER_LIMIT
 return <><p>1–8 중 서로 다른 숫자 4개로 만든 암호를 {CIPHER_LIMIT}회 안에 푸세요. 숫자·위치 일치와 숫자만 일치하는 개수가 단서입니다.</p><form onSubmit={e=>{e.preventDefault();if(finished)return;if(new Set(guess).size!==4){setError('서로 다른 숫자 4개를 입력하세요.');return}const result=cipherFeedback(guess,code);if(result.error){setError(result.error);return}setError('');setHistory(h=>[...h,{guess,...result}]);setGuess('')}}><label>암호 <input aria-label="네 자리 암호" inputMode="numeric" maxLength={4} value={guess} onChange={e=>setGuess(e.target.value.replace(/[^1-8]/g,''))} disabled={finished}/></label><button disabled={finished||guess.length!==4}>자물쇠 확인</button></form><p role="status">{error||(won?'찰칵! 오래된 연구 노트를 발견했습니다.':finished?`이번 암호는 ${code}였습니다. 다시 도전해 보세요.`:`남은 시도 ${CIPHER_LIMIT-history.length}회`)}</p><ol className="cipher-history">{history.map((h,i)=><li key={i}>{h.guess} — 숫자·위치 일치 {h.exact}개 / 숫자만 일치 {h.near}개</li>)}</ol><button onClick={()=>{setCode(makeCode());setHistory([]);setGuess('');setError('')}}>새 자물쇠</button></>
}
export default function MiniGames({kind}){return <><h2>{GAME_SPOTS.find(g=>g.id===kind)?.title}</h2>{kind==='herbs'?<Memory/>:kind==='shelves'?<Shelves/>:<Cipher/>}</>}
