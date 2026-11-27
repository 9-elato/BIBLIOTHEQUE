import React,{useState,useSyncExternalStore} from 'react'
import {menuItems} from './cafeMenu'
import {drinkRecipe,holdDrink,subscribeDrink,drinkSnapshot} from './cafeDrink'
export default function CafeDrinkOrder({menu,onClose}){
 const held=useSyncExternalStore(subscribeDrink,drinkSnapshot,drinkSnapshot),[temperature,setTemperature]=useState('hot')
 const items=menuItems(menu).filter(item=>drinkRecipe(item))
 if(!items.some(i=>/말차/.test(i.name+' '+i.description)))items.push({name:'말차 라테',description:'말차 라테',price:''})
 return <section className="cafe-invitation"><h3>바에서 음료 받기</h3><p>음료를 고르면 캐릭터가 손에 듭니다. 새 음료를 받으면 이전 잔은 반납합니다.</p>
 <fieldset><legend>잔 선택</legend>{[['hot','따뜻하게 · 머그'],['iced','차갑게 · 긴 잔']].map(([value,label])=><label key={value} style={{display:'inline-flex',padding:12,gap:8}}><input type="radio" name="drink-temperature" value={value} checked={temperature===value} onChange={()=>setTemperature(value)}/>{label}</label>)}</fieldset>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,marginTop:12}}>{items.map((item,i)=>{const recipe=drinkRecipe(item,temperature);return <button key={i} onClick={()=>{holdDrink(recipe);onClose?.()}}>{item.name}<small style={{display:'block'}}>{recipe.coldOnly?'차가운 음료':recipe.temperature==='hot'?'따뜻한 머그':'아이스 긴 잔'}</small></button>})}</div>
 {held&&<p role="status">들고 있는 음료: {held.name} <button onClick={()=>holdDrink(null)}>잔 반납하기</button></p>}
 <small>공간 안에서 즐기는 가상 음료이며 결제되지 않습니다. 세트는 음료만 손에 표시됩니다.</small>
 </section>
}
