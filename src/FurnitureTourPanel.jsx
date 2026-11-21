import React,{useEffect,useState} from 'react'
export const tourEnabled=typeof window!=='undefined'&&new URLSearchParams(window.location.search).has('tour')
export default function FurnitureTour(){
 const [status,setStatus]=useState({running:false,results:[]})
 useEffect(()=>{const receive=e=>setStatus(e.detail);window.addEventListener('library-tour-status',receive);return()=>window.removeEventListener('library-tour-status',receive)},[])
 if(!tourEnabled)return null
 return <aside style={{position:'fixed',top:76,right:8,zIndex:100,background:'#fff7e9',color:'#342d27',padding:14,maxWidth:340,maxHeight:'70vh',overflow:'auto'}}>
 <strong>가구 자동 점검</strong><p>자리 사이에는 자동 이동합니다. 접근·착석·다락 눕기·일어나기를 순서대로 확인합니다. 문·계단 전체 보행 및 시각적인 자연스러움은 별도 확인이 필요합니다. 잠긴 작업실은 건너뜁니다.</p>
 <button onClick={()=>window.dispatchEvent(new Event(status.running?'library-tour-stop':'library-tour-start'))}>{status.running?'점검 중지':'29개 자리 점검 시작'}</button>
 {!status.running&&<button onClick={()=>window.dispatchEvent(new CustomEvent('library-tour-start',{detail:'bed'}))}>다락 침대만 점검</button>}
 <p>{status.label||'3인칭에서 실행하세요. 이동 키 또는 중지 버튼으로 멈출 수 있습니다.'}</p>
 <ol>{status.results.map(r=><li key={r.id}>{r.label}: {r.result}</li>)}</ol>
 </aside>
}
