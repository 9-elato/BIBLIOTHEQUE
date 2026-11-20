import {GENRES,genreOf} from './layout.js'

export const TABLES=[
  {id:'central',name:'중앙 독서 테이블',x:0,z:1.75,y:1.12,level:0,slots:6,width:2.8,depth:1.4},
  {id:'lounge',name:'라운지 테이블',x:-13.4,z:.15,y:.45,level:0,slots:3,width:1.2,depth:0},
  {id:'reading',name:'2층 열람실 책상',x:10.25,z:0,y:8.05,level:7.2,slots:6,width:1.9,depth:.7},
]
export const placementKey=p=>p?.kind==='table'?`table:${p.tableId}:${p.slot}`:`shelf:${p?.genre}:${p?.slot}`
export function validPlacement(p){
  if(!p||!Number.isInteger(p.slot)||p.slot<0)return false
  if(p.kind==='shelf')return GENRES.some(g=>g.id===p.genre)&&p.slot<2400
  return p.kind==='table'&&TABLES.some(t=>t.id===p.tableId&&p.slot<t.slots)
}
export function normalizePlacements(books,saved={}){
  const result={},used=new Set()
  // Reserve all valid existing positions before allocating new books.
  for(const book of books){
    const p=saved[book.id]
    if(validPlacement(p)&&!used.has(placementKey(p))){result[book.id]={...p};used.add(placementKey(p))}
  }
  for(const book of books){
    if(result[book.id])continue
    const genre=genreOf(book.category)
    let slot=0
    while(used.has(placementKey({kind:'shelf',genre,slot})))slot++
    result[book.id]={kind:'shelf',genre,slot};used.add(placementKey(result[book.id]))
  }
  return result
}
export function placeBook(placements,bookId,target){
  if(!validPlacement(target))throw new Error('유효한 책장 칸이나 테이블 자리를 선택해 주세요.')
  if(Object.entries(placements).some(([id,p])=>id!==bookId&&placementKey(p)===placementKey(target)))
    throw new Error('이미 다른 책이 있는 자리입니다. 빈 자리를 선택해 주세요.')
  return {...placements,[bookId]:{...target}}
}
export function firstEmptySlot(placements,target,count,bookId){
  const used=new Set(Object.entries(placements).filter(([id])=>id!==bookId).map(([,p])=>placementKey(p)))
  for(let slot=target.slot||0;slot<(target.slot||0)+count;slot++){
    const p={...target,slot}
    if(!used.has(placementKey(p)))return p
  }
  return null
}
export function placementLabel(p){
  if(!p)return '책장 자동 배치'
  if(p.kind==='table')return `${TABLES.find(t=>t.id===p.tableId)?.name} · ${p.slot+1}번 자리`
  return `${GENRES.find(g=>g.id===p.genre)?.name} · ${Math.floor(p.slot/24)+1}번 책장 · ${Math.floor(p.slot%24/6)+1}단 ${p.slot%6+1}칸`
}
export function tableBookPosition(table,slot){
  const columns=3,rows=Math.ceil(table.slots/columns)
  return [table.x+(slot%columns-1)*table.width/2,table.y+.035,table.z+(rows>1?Math.floor(slot/columns)-.5:0)*table.depth]
}
export function loadPlacements(storage,key){
  try{
    const raw=storage.getItem(key)
    if(!raw)return {placements:{},error:''}
    const data=JSON.parse(raw)
    if(data.version!==1||!data.placements||typeof data.placements!=='object'||Array.isArray(data.placements))throw Error('format')
    if(!Object.values(data.placements).every(validPlacement))throw Error('invalid position')
    return {placements:data.placements,error:''}
  }catch{return {placements:{},error:'저장된 책 배치를 읽지 못했습니다. 원본을 보존하며 이번 변경은 임시로만 적용됩니다.'}}
}
export function savePlacements(storage,key,placements){
  try{storage.setItem(key,JSON.stringify({version:1,placements}));return ''}
  catch{return '브라우저에 배치를 저장하지 못했습니다. 저장 공간을 확인해 주세요.'}
}
