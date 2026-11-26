export const LETTER_KEY='mll-future-letters-v1'
export function koreaDate(now=new Date()){
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now)
 return ['year','month','day'].map(k=>p.find(v=>v.type===k).value).join('-')
}
export function nextYear(date){
 const [y,m,d]=date.split('-').map(Number),last=new Date(Date.UTC(y+1,m,0)).getUTCDate()
 return `${y+1}-${String(m).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`
}
export function readLetters(storage){
 const raw=storage.getItem(LETTER_KEY);if(!raw)return []
 const letters=JSON.parse(raw)
 if(!Array.isArray(letters)||letters.some(l=>!l||typeof l.id!=='string'||typeof l.body!=='string'||typeof l.title!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(l.openOn)||!/^\d{4}-\d{2}-\d{2}$/.test(l.createdOn)))throw new Error('보관된 편지를 읽을 수 없습니다. 기존 데이터는 덮어쓰지 않습니다.')
 return letters
}
export function postLetter(storage,{title,body},now=new Date(),id=globalThis.crypto.randomUUID()){
 if(!body.trim()||body.length>10000||title.length>100)throw new Error('제목 100자, 편지 10,000자 이내로 내용을 적어주세요.')
 const letters=readLetters(storage),createdOn=koreaDate(now),letter={id,title:title.trim()||'1년 뒤의 나에게',body:body.trim(),createdOn,openOn:nextYear(createdOn)}
 storage.setItem(LETTER_KEY,JSON.stringify([...letters,letter]));return letter
}
