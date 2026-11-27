import {cafeLocal,PRIVATE_ROOMS} from './cafeExpansion.js'

// Visitor-side approach zones, not the positions of objects behind the counter.
export function cafeBrowseAction(player){
 const [x,z]=cafeLocal(player.x,player.z)
 if(Math.abs(player.level-7.2)<.1){
  const room=PRIVATE_ROOMS.find(r=>Math.abs(x-r.x)<.7&&z>22.15&&z<23.2)
  return room?{type:'cafePrivate',roomId:room.id,label:room.name+' · 예약 수첩 확인'}:null
 }
 if(Math.abs(player.level)>.1)return null
 if(x>-21&&x<-19.15&&z>19&&z<21.3)return {type:'cafeMenu',label:'작은 메뉴판 펼치기'}
 if(x>-24.8&&x<-20.5&&z>16.35&&z<17.2)return {type:'cafeGoods',label:'유령단 굿즈 살펴보기'}
 if((x>-31&&x<-27.8&&z>16.6&&z<24)||(x>-29.7&&x<-25.5&&z>16.3&&z<17.2))return {type:'cafeBooks',label:'진열된 책 소개 보기'}
 if(x>-19.6&&x<-16.35&&z>21&&z<23.5)return {type:'cafe',label:'책방지기의 초대장 펼치기'}
 return null
}
