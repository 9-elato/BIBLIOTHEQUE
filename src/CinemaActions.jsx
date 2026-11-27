import React,{useEffect,useState} from 'react'
import {recordStorage} from './recordStorage'
import {readCinemaKit} from './cinemaKitState'
const read=()=>{try{return readCinemaKit(recordStorage.getItem('mll-cinema-kit'))}catch{return readCinemaKit(null)}}
export default function CinemaActions({status}){
 const [kit,setKit]=useState(read)
 useEffect(()=>{const sync=()=>setKit(read());window.addEventListener('library-records-dirty',sync);window.addEventListener('library-records-updated',sync);return()=>{window.removeEventListener('library-records-dirty',sync);window.removeEventListener('library-records-updated',sync)}},[])
 const ready=!/앉는 중|일어나는 중|이동 공간|나오는 중/.test(status)
 const act=detail=>window.dispatchEvent(new CustomEvent('library-cinema-action',{detail}))
 return <div className="cinema-actions" role="group" aria-label="영화관 좌석 동작">
 <button disabled={!ready} onClick={()=>act('recline')}><kbd>R</kbd> {status.includes('젖혀')?'등받이 세우기':'좌석 젖히기'}</button>
 <button disabled={!ready||!kit.popcorn} onClick={()=>act('popcorn')} title={kit.popcorn?'':'로비에서 팝콘을 먼저 챙겨주세요'}><kbd>P</kbd> 팝콘 먹기</button>
 <button disabled={!ready||!kit.cola} onClick={()=>act('cola')} title={kit.cola?'':'로비에서 콜라를 먼저 챙겨주세요'}><kbd>C</kbd> 콜라 마시기</button>
 {(!kit.popcorn||!kit.cola)&&<small>간식은 로비에서 챙길 수 있어요.</small>}
 </div>
}
