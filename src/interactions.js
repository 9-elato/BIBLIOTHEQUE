import {cafeBrowseAction} from './cafeInteractionPoints.js'
import {recordStorage} from './recordStorage.js'
import {RESERVATION_KEY,hasRoomReservation} from './cafeReservations.js'
import {cafeX,cafeZ,cinemaZ,cinemaCurtain} from './cafeExpansion.js'
import {inCafe as isCafe} from './cafeLayout.js'
import {meadowRest} from './meadowLayout.js'
import {canToggleStudyDoor} from './studyLayout.js'
import {GAME_SPOTS} from './miniGames.js'
import {atticX} from './atticLayout.js'
import {ATTIC_HEIGHT} from './navigation.js'
import {DESKS} from './layout.js'
import {TABLES} from './placements.js'
import {nearbySeat,prepareNearbySitting} from './seating.js'
import {canToggleGlassDoor} from './greenhouseLayout.js'

export function interactionAt(s, {entranceOpen, gateReady, gateOpening=false, bookcases=[], heldBook, canPlace=false,world},prepareSeat=false) {
  const near = (x,z,r=1.8) => (s.x-x)**2+(s.z-z)**2<r*r
  if(s.ladder)return {type:'ladderExit',label:s.ladder.blocked?(s.ladder.phase==='boarding'?'탑승 경로 대기 중 · E 취소':'하차 공간 대기 중'):'W/S 오르내리기 · A/D 레일 사다리 이동 · E 내려오기'}
  if (s.seated) {
    if(s.seated.transitionBlocked)return {type:'wait',label:'이동 공간이 막혀 잠시 멈췄습니다 · 공간이 비면 이어집니다'}
    return s.seated.phase&&s.seated.phase!=='seated'?null:{type:'stand',label:s.seated.exitBlocked?'하차 공간이 막혀 있습니다 · 공간을 비운 뒤 다시 시도':s.seated.seat?.bathing?'온천에서 천천히 나오기':heldBook?'책을 들고 일어나기':'일어나기'}
  }
  if(s.level===0&&near(cafeX(-17.8),cafeZ(23.6),1))return {type:'cafeMail',label:'1년 뒤의 나에게 편지 보내기'}
  if(Math.abs(s.level)<.1&&near(cafeX(-19.5),cafeZ(cinemaZ(35)),3))return {type:'cinemaLobby',label:'슬리퍼·담요·관람 간식 준비'}
  if(Math.abs(s.level)<.1&&!cinemaCurtain.open&&near(cafeX(-23),cafeZ(cinemaZ(38.3)),3))return {type:'cinemaCurtain',label:'영화관 커튼 열기'}
  // Resolve cafe seating once: the reachability query includes floor collision checks.
  const inCafe=s.level===0&&isCafe(s.x,s.z)
  const prepared=prepareSeat?prepareNearbySitting(s,world):null
  const cafeSeat=inCafe?(prepareSeat?prepared?.seat:nearbySeat(s,world)):null
  if(inCafe&&!cafeSeat){const browse=cafeBrowseAction(s);if(browse)return browse}
  if(s.level===0&&world?.verandaDoor&&near(-10.2,-6.7,2))return {type:'verandaDoor',label:world.verandaDoor.open?'바다 마루 문 닫기':'바다 마루 문 열기'}
  const rest=meadowRest(s)
  if(rest&&Math.abs(s.level-rest.level)<.15)return {type:'seat',seat:rest,label:'잔디에 누워 하늘 보기'}
  const seat=inCafe?cafeSeat:prepareSeat?prepared?.seat:nearbySeat(s,world)
  if(seat?.id.startsWith('cafe-private-')){let reservations=[];try{reservations=JSON.parse(recordStorage.getItem(RESERVATION_KEY)||'[]')}catch{}if(!Array.isArray(reservations)||!hasRoomReservation(reservations,seat.id))return {type:'cafePrivate',roomId:seat.id,label:'1인실 예약 수첩 열기'}}
  if(seat)return {type:'seat',seat,sitting:prepared,label:seat.bathing?'따뜻한 숲 온천에서 반신욕하기':seat.label+(seat.recliner?'에서 영화 감상하기':heldBook?'에 앉아 읽기':'에 앉기')}
  if(Math.abs(s.level-7.2)<.1){const browse=cafeBrowseAction(s);if(browse)return browse}
  if(Math.abs(s.level-7.2)<.1&&world?.glassDoor&&near(0,-6.95,2.65))return {type:'glassDoor',label:!canToggleGlassDoor(world.glassDoor,s)?'유리문 회전 공간을 비워주세요':world.glassDoor.open?'온실 유리문 닫기':'온실 유리문 열기'}
  if(Math.abs(s.level-7.2)<.1&&near(0,-14,2.7))return {type:'gardenWater',label:'분수 물소리 켜고 끄기'}
  if(s.level===0&&world?.studyDoor){
   if(Math.abs(s.x)<1.3&&Math.abs(s.z+19)<3)return {type:'studyDoor',label:!canToggleStudyDoor(world.studyDoor,s)?'문 옆에서 한 걸음 물러나세요':world.studyDoor.open?'작업실 나무문 닫기':'작업실 나무문 열기'}
   if(near(6.40,-25.9,2.2))return {type:'music',label:'LP 플레이어와 음악 열기'}
   if(s.x<-.5&&near(-.95,-28.72,1.85))return {type:'studyLamp',label:'책상 조명 켜고 끄기'}
  }
  const game=GAME_SPOTS.find(g=>Math.abs(s.level-g.level)<.1&&near(g.x,g.z,1.65))
  if(game)return {type:'minigame',game:game.id,label:game.title+' 시작'}
  if(s.level===0&&near(-16.8,-1.8,1.3))return {type:'blanket',label:'라운지 담요 챙기기 / 내려놓기'}
  if(s.level===0&&near(-13.4,.15,2))return {type:'board',label:'별자리 삼목 시작'}
  const ladder=s.level===0?world?.ladders?.find(l=>near(l.x,l.z,1.9)):null
  if(ladder)return {type:'ladder',ladder,label:'사다리 타기 · 탑승 후 A/D 레일 사다리 이동'}
  if(heldBook&&canPlace){
    const table=TABLES.find(t=>Math.abs(s.level-t.level)<.1&&near(t.x,t.z,t.id==='central'?3.2:2.3))
    if(table)return {type:'place',label:`${table.name}에 책 놓기`,target:{kind:'table',tableId:table.id,slot:0}}
    const shelf=s.level===0?bookcases.find(p=>near(p.x,p.z,2.25)):null
    if(shelf)return {type:'place',label:'이 책장 빈 칸에 꽂기',target:{kind:'shelf',genre:shelf.genre,slot:shelf.slot}}
  }
  if (s.level===0) {
    if (Math.abs(s.x)<2.4&&s.z>8.8&&s.z<15.3&&
      !(s.z>10.1&&s.z<12.05&&(entranceOpen?Math.abs(s.x)<1.8:Math.abs(s.x)>.65&&Math.abs(s.x)<1.8)))
      return {type:'door',label:entranceOpen?'문 닫기':'문 열기'}
    if (!gateReady&&Math.abs(s.x)<2&&s.z>-14.1&&s.z<-11.2)
      return gateOpening?{type:'wait',label:'비밀 책장 열리는 중…'}:{type:'key',label:'황동 장식 책 눌러 비밀 책장 열기'}
    if (DESKS.some(([x,z])=>near(x,z))||(s.z<-19.3&&Math.abs(s.x)<2.7))
      return {type:'notes',label:'독서 노트 작성'}
    const shelf=bookcases.find(p=>near(p.x,p.z,2.25))
    if (shelf) return {type:'shelf',label:'장르 서가 열기',genre:shelf.genre}
  }
  if (heldBook) return {type:'read',label:'들고 있는 책 읽기'}
  return null
}
