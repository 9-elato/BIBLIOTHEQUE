import React,{useState} from 'react'
import {CoverImage} from './BookCover'
import {curatedDisplay,representativeDisplays} from './cafeDisplays'
export default function CafeBookCollection({config,books}){
 const [chosen,setChosen]=useState(null)
 const groups=[{name:config.curationTitle,books:curatedDisplay(config,books)},...representativeDisplays(books)]
 return <section className="cafe-book-collection"><p className="read-text">{config.curationNote||'책방지기가 고른 책들입니다. 책을 눌러 등록된 서지 정보를 확인하세요.'}</p>
 {chosen?<article><button onClick={()=>setChosen(null)}>← 진열 목록</button><div className="cafe-book-detail"><span className="mini-cover"><CoverImage url={chosen.cover} title={chosen.title}/></span><div><h3>{chosen.title}</h3><p>{chosen.author}</p>{chosen.translator&&<p>{chosen.translator} 옮김</p>}{chosen.publisher&&<p>{chosen.publisher}</p>}{chosen.pages>0&&<p>{chosen.pages}쪽</p>}<p>{chosen.category}</p>{!chosen.cover&&<small>표지 이미지 등록 전입니다.</small>}</div></div></article>:
 groups.map((group,i)=><section key={i}><h3>{group.name} · {group.books.length}권</h3><div className="cafe-book-grid">{group.books.map(b=><button key={b.id} onClick={()=>setChosen(b)}><span className="mini-cover"><CoverImage url={b.cover} title={b.title}/></span><strong>{b.title}</strong><small>{b.author}</small></button>)}</div></section>)}
 </section>
}
