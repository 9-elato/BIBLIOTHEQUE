import React,{useState,useEffect,useRef} from 'react'
import {CAFE_GOODS_DETAILS,goodsNames} from './cafeGoods'
import GoodsArt from './CafeGoodsArt'
import './cafeGoods.css'
export default function CafeGoodsGallery({goods,initialName}){
 const names=goodsNames(goods),[selected,setSelected]=useState(initialName||null),[zoom,setZoom]=useState(1),heading=useRef(),viewport=useRef(),collection=useRef()
 useEffect(()=>{setZoom(1);if(viewport.current){viewport.current.scrollLeft=0;viewport.current.scrollTop=0}(selected?heading:collection).current?.focus()},[selected])
 const index=names.indexOf(selected)
 return <section className="goods-collection"><p className="eyebrow">BOOk · OBJECTS TO KEEP</p><h3 ref={collection} tabIndex={-1}>유령단 굿즈 컬렉션</h3>
 {selected?<div className="goods-detail">
  <button onClick={()=>setSelected(null)}>← 굿즈 목록</button><h3 ref={heading} tabIndex={-1}>{selected}</h3>
  <div className="goods-tools" role="group" aria-label="굿즈 디자인 확대"><button disabled={zoom<=1} onClick={()=>setZoom(v=>Math.max(1,v-.5))} aria-label="디자인 축소">−</button><output aria-live="polite">{zoom*100}%</output><button disabled={zoom>=3} onClick={()=>setZoom(v=>Math.min(3,v+.5))} aria-label="디자인 확대">＋</button><button onClick={()=>setZoom(1)}>전체 보기</button></div>
  <div ref={viewport} className="goods-viewport" tabIndex={0} aria-label="확대한 디자인을 상하좌우로 밀어 살펴보세요"><div style={{width:`${zoom*100}%`}}><GoodsArt name={selected}/></div></div>
  <p>{CAFE_GOODS_DETAILS[selected]||'책과 함께 오래 간직할 유령단의 작은 흔적.'}</p><p className="goods-note">디자인 미리보기 · 실제 주문 및 결제 기능은 없습니다.</p>
  {names.length>1&&<div className="goods-tools"><button onClick={()=>setSelected(names[(Math.max(0,index)-1+names.length)%names.length])}>← 이전 굿즈</button><button onClick={()=>setSelected(names[(index+1)%names.length])}>다음 굿즈 →</button></div>}
 </div>:<><p>굿즈를 선택하면 봉제선·인쇄·장식 디테일을 크게 볼 수 있습니다.</p><div className="goods-grid">{names.map(name=><button key={name} onClick={()=>setSelected(name)} aria-label={name+' 디자인 크게 보기'}><GoodsArt name={name}/><span>{name}</span></button>)}</div>{!names.length&&<p>책방지기가 다음 컬렉션을 준비하고 있습니다.</p>}</>}
 </section>
}
