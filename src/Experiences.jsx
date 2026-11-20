import MiniGames from './MiniGames.jsx'
import {GAME_SPOTS} from './miniGames'
import {CoverImage} from './BookCover'
import React,{useEffect,useRef,useState} from 'react'
import {boardResult,playBoard} from './boardGame'
export default function Experiences({kind,onClose,book}){
 const [board,setBoard]=useState(Array(9).fill(null)),[angle,setAngle]=useState(0),[zoom,setZoom]=useState(1),[target,setTarget]=useState('moon'),closeRef=useRef()
 useEffect(()=>{const prev=document.activeElement;closeRef.current?.focus();const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const items=[...document.querySelectorAll('.experience-dialog button,.experience-dialog input')].filter(x=>!x.disabled);if(!items.length)return;const i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length]?.focus()}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);prev?.focus()}},[onClose])
 const [skyClock,setSkyClock]=useState(()=>performance.now()/1000),[skyPlaying,setSkyPlaying]=useState(true),[moonPhase,setMoonPhase]=useState(null)
 useEffect(()=>{if(kind!=='telescope'||!skyPlaying)return;const timer=setInterval(()=>setSkyClock(t=>t+.25),250);return()=>clearInterval(timer)},[kind,skyPlaying])
 const phaseOffset=moonPhase===null?132*Math.sin(skyClock*Math.PI/60):132*moonPhase
 const result=boardResult(board)
 return <div className="experience-backdrop"><section className="experience-dialog" role="dialog" aria-modal="true" aria-label={GAME_SPOTS.find(g=>g.id===kind)?.title||(kind==='reader'?'독서 화면':kind==='telescope'?'다락 천문 관측':'벽난로 별자리 삼목')}>
  <button ref={closeRef} onClick={onClose} className="experience-close">닫기 ×</button>
  {GAME_SPOTS.some(g=>g.id===kind)?<MiniGames key={kind} kind={kind}/>:kind==='reader'?<><h2>{book?.title||'읽을 책을 선택해 주세요'}</h2><p>{book?.author}</p>{book?.cover&&<div className="reading-large-cover"><CoverImage url={book.cover} title={book.title}/></div>}<p className="help-text">등록한 표지와 독서 기록을 펼쳐 봅니다.</p>{book?.quote&&<blockquote>{book.quote}</blockquote>}<p className="read-text">{book?.notes||'아직 작성한 독서 기록이 없습니다.'}</p><p>닫으면 같은 자세로 다락방 독서를 이어갑니다.</p></>:kind==='telescope'?<><h2>다락의 작은 천문대</h2><p>망원경으로 동화 속 밤하늘을 살펴보세요. 실제 천체 위치와는 다른 관측 연출입니다.</p>
   <svg viewBox="0 0 500 340" role="img" aria-label={target==='moon'?'달의 표면':'별자리와 별들'} className="telescope-sky">
    <defs><radialGradient id="sky-glow"><stop stopColor="#253958"/><stop offset="1" stopColor="#070e1c"/></radialGradient><clipPath id="scope-lens"><circle cx="250" cy="170" r="160"/></clipPath></defs>
    <rect width="500" height="340" fill="#100f19"/><circle cx="250" cy="170" r="163" fill="#ad8b56"/>
    <g clipPath="url(#scope-lens)"><rect width="500" height="340" fill="url(#sky-glow)"/>
     <g transform={'translate(250 170) scale('+zoom+') rotate('+(angle+skyClock*.15)+') translate(-250 -170)'}>
      {Array.from({length:95},(_,i)=><circle key={i} cx={(i*67)%500} cy={(i*43)%340} r={i%7===0?2:1} fill="#f0e8d6"/>)}
      {target==='moon'?<g><circle cx="250" cy="170" r="66" fill="#e8dfc4"/>{[[-25,-25,12],[22,19,16],[-16,35,9],[30,-25,7]].map(([x,y,r])=><circle key={x} cx={250+x} cy={170+y} r={r} fill="#c4baa7"/>)}{moonPhase===.5?<path d="M250 104 A66 66 0 0 0 250 236 Z" fill="#17243a"/>:<circle cx={250+phaseOffset} cy="170" r="66" fill="#17243a"/>}</g>:<g stroke="#a6bdd9" fill="none"><path d="M140 190 L180 145 L225 155 L275 120 L310 170 L350 130"/><path d="M225 155 L250 220 L310 170"/></g>}
      <g transform={'translate('+(100+(skyClock%18)/18*300)+' '+(70+(skyClock%18)/18*180)+')'} opacity={(skyClock%18)<14?.85:0}><path d="M-55 -30 L0 0" stroke="#b3cafa" strokeWidth="2"/><circle r="3" fill="#fff4d4"/></g>
     </g>
    </g>
   </svg>
   <div className="choice-row"><button onClick={()=>setTarget('moon')}>달 관측</button><button onClick={()=>setTarget('stars')}>별자리 관측</button><button onClick={()=>setAngle(a=>a-15)}>왼쪽으로 회전</button><button onClick={()=>setAngle(a=>a+15)}>오른쪽으로 회전</button></div>
   <div className="choice-row"><button onClick={()=>setSkyPlaying(v=>!v)}>{skyPlaying?'하늘 움직임 멈추기':'하늘 움직임 재생'}</button><button onClick={()=>{setTarget('moon');setMoonPhase(.2)}}>초승달</button><button onClick={()=>{setTarget('moon');setMoonPhase(.5)}}>반달</button><button onClick={()=>{setTarget('moon');setMoonPhase(1)}}>보름달</button><button onClick={()=>setMoonPhase(null)}>달 변화 자동</button></div><p className="help-text">별의 이동과 달의 변화는 관찰하기 쉽도록 빠르게 표현했습니다.</p>
   <label>배율 {zoom.toFixed(1)}× <input aria-label="망원경 배율" type="range" min="1" max="2.5" step=".1" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
  </>:<><h2>벽난로 별자리 삼목</h2><p>당신은 별 ★, 서재는 달 ☾입니다. 가로·세로·대각선으로 세 칸을 먼저 연결하세요.</p>
   <div className="game-board">{board.map((v,i)=><button key={i} aria-label={(i+1)+'번 칸 '+(v||'비어 있음')} disabled={Boolean(v||result)} onClick={()=>setBoard(b=>playBoard(b,i))}>{v==='star'?'★':v==='moon'?'☾':''}</button>)}</div>
   <p role="status">{result==='star'?'별의 승리!':result==='moon'?'달의 승리. 한 판 더 해볼까요?':result==='draw'?'무승부입니다.':'빈 칸에 별을 놓으세요.'}</p><button onClick={()=>setBoard(Array(9).fill(null))}>새 게임</button>
  </>}
 </section></div>
}
