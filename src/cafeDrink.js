let held=null
const listeners=new Set()
export const drinkSnapshot=()=>held
export const subscribeDrink=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export function drinkRecipe(item,temperature='hot'){
 const text=(item.description||item.name||'').split('+')[0]
 if(/브라우니|케이크|마들렌|스콘/.test(text)&&! /커피|차|라테|라떼/.test(text))return null
 const coldOnly=/주스|밀크쉐이크|에이드|소다/.test(text)
 const iced=coldOnly||temperature==='iced'
 const color=/말차|녹차/.test(text)?'#a5bd65':/밀크쉐이크/.test(text)?'#f1e4cd':/복숭아|배/.test(text)?'#edbe8e':/청포도|소다/.test(text)?'#b8cf93':/얼그레이|홍차/.test(text)?'#a86932':/초코/.test(text)?'#74503c':/호지/.test(text)?'#b49a70':/라테|라떼/.test(text)?'#c9a075':'#684530'
 return {name:item.name,temperature:iced?'iced':'hot',color,vessel:iced?'glass':'mug',coldOnly}
}
export function holdDrink(recipe){held=recipe?{...recipe}:null;listeners.forEach(fn=>fn())}
