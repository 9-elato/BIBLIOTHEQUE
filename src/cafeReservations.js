import {PRIVATE_ROOMS} from './cafeExpansion.js'
export const RESERVATION_KEY='mll-cafe-reservations'
export const ROOM_SLOTS=['10:00','12:00','14:00','16:00','18:00']
export function koreaDay(now=new Date()){return new Date(now.getTime()+9*3600000).toISOString().slice(0,10)}
export function reserveRoom(records,{roomId,date,time},now=new Date()){
 if(!PRIVATE_ROOMS.some(r=>r.id===roomId)||!ROOM_SLOTS.includes(time)||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('공간과 날짜, 시간을 확인해주세요.')
 const start=new Date(`${date}T${time}:00+09:00`)
 if(!Number.isFinite(+start)||koreaDay(start)!==date||+start+2*3600000<=+now)throw Error('앞으로 이용할 날짜와 시간을 선택해주세요.')
 if(records.some(r=>r.date===date&&r.time===time))throw Error('같은 시간에 이미 예약한 공간이 있습니다.')
 return [...records,{id:`${roomId}:${date}:${time}`,roomId,date,time}].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
}

export function hasRoomReservation(records,roomId,now=new Date()){return records.some(r=>{const t=Date.parse(r.date+'T'+r.time+':00+09:00');return r.roomId===roomId&&+now>=t&&+now<t+7200000})}
