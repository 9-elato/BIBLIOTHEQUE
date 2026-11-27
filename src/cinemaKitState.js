export const CINEMA_KIT_ITEMS=[['slippers','실내 슬리퍼'],['blanket','포근한 담요'],['cushion','작은 쿠션'],['popcorn','팝콘'],['cola','콜라']]
export function readCinemaKit(value){
 let parsed;try{parsed=JSON.parse(value||'{}')}catch{parsed={}}
 return Object.fromEntries(CINEMA_KIT_ITEMS.map(([key])=>[key,parsed?.[key]===true]))
}
