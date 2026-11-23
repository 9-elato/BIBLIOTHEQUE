import {meadowRest} from './meadowLayout.js'
import {canToggleStudyDoor} from './studyLayout.js'
import {GAME_SPOTS} from './miniGames.js'
import {atticX} from './atticLayout.js'
import {ATTIC_HEIGHT} from './navigation.js'
import {DESKS} from './layout.js'
import {TABLES} from './placements.js'
import {nearbySeat} from './seating.js'
import {canToggleGlassDoor} from './greenhouseLayout.js'

export function interactionAt(s, {entranceOpen, gateReady, gateOpening=false, bookcases=[], heldBook, canPlace=false,world}) {
  const near = (x,z,r=1.8) => Math.hypot(s.x-x,s.z-z)<r
  if(s.ladder)return {type:'ladderExit',label:s.ladder.blocked?'하차 공간 대기 중':'W/S 오르내리기 · A/D 레일 사다리 이동 · E 내려오기'}
  if (s.seated) {
    if(s.seated.transitionBlocked)return {type:'wait',label:'이동 공간이 막혀 잠시 멈췄습니다 · 공간이 비면 이어집니다'}
    return s.seated.phase&&s.seated.phase!=='seated'?null:{type:'stand',label:s.seated.exitBlocked?'하차 공간이 막혀 있습니다 · 공간을 비운 뒤 다시 시도':heldBook?'책을 들고 일어나기':'일어나기'}
  }
  if(s.level===0&&s.x>-30&&s.x<-16&&s.z>15&&s.z<31&&!nearbySeat(s,world))return {type:'cafe',label:'북카페 큐레이션 · 메뉴 · 상영표 보기'}
  if(s.level===0&&world?.verandaDoor&&near(-10.2,-6.7,2))return {type:'verandaDoor',label:world.verandaDoor.open?'바다 마루 문 닫기':'바다 마루 문 열기'}
  if(Math.abs(s.level-ATTIC_HEIGHT)<.1&&near(atticX(-16.8),9.3,1.65))return {type:'telescope',label:'테라스에서 별과 달 관측하기'}
  const rest=meadowRest(s)
  if(rest&&Math.abs(s.level-rest.level)<.15)return {type:'seat',seat:rest,label:'잔디에 누워 하늘 보기'}
  const seat=nearbySeat(s,world)
  if(seat)return {type:'seat',seat,label:seat.label+(heldBook?'에 앉아 읽기':'에 앉기')}
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
  if(Math.abs(s.level-ATTIC_HEIGHT)<.1&&near(atticX(-17.25),4.6,1.8))return {type:'telescope',label:'망원경으로 별과 달 보기'}
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
