export const REQUESTED_BOOKS=[
 ['산책자','로베르트 발저','배수아','한겨레출판','#83a83d'],
 ['분신','히가시노 게이고','','','#9d7770'],
 ['1984','조지 오웰','','','#786c5b'],
 ['멋진 신세계','올더스 헉슬리','','','#587986'],
 ['동물농장','조지 오웰','','','#9e8955'],
 ['저 이승의 선지자','김보영','','','#596879'],
].map(([title,author,translator,publisher,color],i)=>({id:`b0261126-0000-4000-8000-${String(i+1).padStart(12,'0')}`,title,author,translator,publisher,color,category:'소설',status:'읽고 싶음',rating:0,year:2026,completed:'',notes:'',quote:'',cover:'',spine:i===0?'bundled:walser-spine.png':'',pages:null,keywords:''}))
export const REQUESTED_BOOK_SOURCE='https://aladin.kr/p/9qnSh'
export const BOOK_IMPORT_KEY='mll-content-imports'
const titleKey=b=>b.title?.replace(/\s/g,'')
export function missingRequestedBooks(books){return REQUESTED_BOOKS.filter(b=>!books.some(existing=>titleKey(existing)===titleKey(b)&&existing.author?.replace('조저','조지')===b.author))}
export function requestedCuration(config,books){if(config.requestedCurationVersion===1)return config;const ids=books.filter(b=>REQUESTED_BOOKS.some(r=>titleKey(r)===titleKey(b)&&r.author===b.author)).map(b=>b.id);if(!ids.length)return config;return {...config,requestedCurationVersion:1,bookIds:[...new Set([...ids,...(config.bookIds||[])])]}}
