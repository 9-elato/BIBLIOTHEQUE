import React,{useState} from 'react'
import {posterSource} from './cafePoster'
export default function CafePosterGallery({config}){
 const posters=[...new Set([config.filmPoster,...(config.posterGallery||[])].map(posterSource).filter(Boolean))], [selected,setSelected]=useState(null)
 return <section><h3>영화 포스터 컬렉션</h3>{selected?<><button onClick={()=>setSelected(null)}>← 포스터 목록</button><img src={selected} alt="확대한 영화 포스터" style={{display:'block',width:'100%',maxHeight:'70dvh',objectFit:'contain'}}/></>:<div className="cafe-poster-grid">{posters.map((url,i)=><button key={url} onClick={()=>setSelected(url)} aria-label={(i===0?config.filmTitle:'영화 포스터 '+(i+1))+' 크게 보기'}><img src={url} loading="lazy" alt={i===0?config.filmTitle:'영화 포스터 '+(i+1)}/></button>)}</div>}{!posters.length&&<p>책방지기가 포스터를 준비하고 있습니다.</p>}</section>
}
