export const ATTENDANCE_KEY='mll-library-attendance-v1'
export function localDateKey(date=new Date()){
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')
}
export function stampVisit(days,date=localDateKey()){return days.includes(date)?days:[...days,date].sort()}
export function readVisits(storage){
 const raw=storage.getItem(ATTENDANCE_KEY)
 if(!raw)return []
 const days=JSON.parse(raw)
 if(!Array.isArray(days)||days.some(d=>typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)))throw new Error('출석 기록을 읽지 못했습니다. 기존 데이터는 유지됩니다.')
 return [...new Set(days)].sort()
}
export function activityCounts(books){return {registered:books.filter(b=>b.status==='완독').length,orders:books.filter(b=>b.status==='읽고 싶음').length,reading:books.filter(b=>b.status==='읽는 중').length}}
