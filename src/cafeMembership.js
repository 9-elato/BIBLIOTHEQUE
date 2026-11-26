export const STAMP_DESIGNS=[['♧','찻잎'],['✦','별빛'],['☾','달'],['❄','눈송이'],['♡','마음'],['♫','선율'],['✉','편지'],['♨','온기']]
STAMP_DESIGNS.push(['✧','BOO!'])
export function readMembership(storage=globalThis.localStorage){try{const value=JSON.parse(storage.getItem('cafe-membership-v1'));return {visits:[...new Set((value?.visits||[]).filter(s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)))].sort()}}catch{return {visits:[]}}}
export function stampVisit(record,now=new Date()){const day=new Date(now.getTime()+9*3600000).toISOString().slice(0,10);return {visits:record.visits.includes(day)?record.visits:[...record.visits,day]}}
export function membershipLevel(count){const level=Math.floor(count/9);return {level,name:['초대받은 손님','새내기 유령','책장 유령','별빛 유령'][Math.min(level,3)],stamps:count%9}}
