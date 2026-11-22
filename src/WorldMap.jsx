import React from 'react'
const FLOORS=[
 {name:'1층',rooms:[
  ['corridor','북쪽 복도','',35,3,30,13,'북쪽 복도'],
  ['lounge','벽난로 라운지','벽난로 별자리 삼목',2,22,29,21,'벽난로 라운지'],
  ['main','중앙 홀','',35,22,30,21,'중앙 홀'],
  ['stacks','서가','',69,22,29,21,'서가'],
  ['veranda','바다 마루','',2,3,29,13,'바다 마루'],
  ['stairs','중앙 계단','2층으로 ↑',2,47,29,12,'중앙 계단'],
  ['basementstairs','지하 계단','',69,49,29,12,'지하 계단'],
  ['vestibule','현관','',35,49,30,12,'현관'],
  ['estate','정원 산책로','',35,70,30,13,'저택 정원'],
  ['meadow','잔디 동산','',35,85,30,13,'잔디 동산'],
  ['garden-west','서쪽 벤치','',2,70,29,16],
  ['garden-east','동쪽 벤치','',69,79,29,16],
 ],lines:['M16 16 V22','M50 16 V22','M31 32 H35','M65 32 H69','M50 43 V70','M35 40 H33 V53 H31','M31 78 H35','M65 87 H69'],notes:'정원 → 현관 → 중앙 홀. 서쪽은 라운지, 동쪽은 서가입니다. 중앙 계단은 홀 서쪽에 있습니다.'},
 {name:'2층',rooms:[
  ['greenhouse','실내온실','온실 식물 짝맞추기',3,2,94,15,'실내 온실'],
  ['mezzanine','2층 갤러리','',3,20,94,13,'2층 갤러리'],
  ['reading','열람실','열람실 책 순서 퍼즐',65,36,32,42,'열람실'],
  ['stairs','1층 계단 입구','',3,36,29,19],
  ['attic','다락방으로','남서쪽 다락 계단 ↑',3,67,29,19],
 ],lines:['M50 17 V20','M17 33 V36','M81 33 V36','M17 55 V67'],notes:'실내온실: 가운데 분수, 서쪽 연못과 벤치, 동쪽 라탄 소파와 티 테이블, 안쪽 열대 식물. 갤러리 가운데는 중앙 홀 위의 열린 공간입니다. 북쪽 온실, 동쪽 열람실, 남서쪽 다락 계단으로 이어집니다.'},
 {name:'3층',rooms:[
  ['attic','다락방','',9,10,82,24,'다락방'],
  ['atticbed','다락 침대','',9,42,39,23],
  ['terrace','별빛 테라스','',52,42,39,23,'별빛 테라스'],
  ['mezzanine','2층 갤러리로','다락 계단을 따라 ↓',36,77,55,16],
 ],lines:['M77 65 V77'],notes:'책을 들고 안락의자나 데이베드에 다가가 E를 누르면 앉아 읽을 수 있습니다.'},
]
FLOORS.push({name:'지하',rooms:[['basement','숲 라운지','',5,27,48,55,'지하 숲 라운지'],['bathroom','숲 온천','',58,27,37,55,'숲 온천'],['basementstairs','1층 중앙 홀로','',5,5,90,15,'지하 계단']],lines:['M27 20 V27','M53 52 H58'],notes:'중앙 홀 북동쪽 목재 계단으로 내려옵니다. 지하 남쪽은 경사지에 열린 숲과 연못 전망입니다.'})
export function floorForZone(zone){return ['지하 숲 라운지','숲 온천','지하 계단'].includes(zone)?3: ['다락방','별빛 테라스'].includes(zone)?2:['2층 갤러리','열람실','다락 계단','실내 온실'].includes(zone)?1:0}
export default function WorldMap({floor,onFloor,zone,onTravel,onClose}){
 const plan=FLOORS[floor]
 return <section className="world-map floating detailed-map" aria-label="저택 층별 지도">
  <div className="world-map-head"><strong>저택 안내도</strong><button onClick={onClose} aria-label="지도 닫기">×</button></div>
  <p className="map-location" role="status">● 현재 공간: {zone}</p>
  <div className="map-tabs" role="tablist" aria-label="층 선택">{FLOORS.map((item,i)=><button key={item.name} id={'floor-tab-'+i} aria-controls="floor-map-panel" role="tab" aria-selected={floor===i} onClick={()=>onFloor(i)}>{item.name}</button>)}</div>
  <div id="floor-map-panel" className="estate-plan" role="tabpanel" aria-labelledby={'floor-tab-'+floor}>
   <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{plan.lines.map(d=><path key={d} d={d}/>)}</svg>
   {floor===1&&<div className="plan-void">중앙 홀 상부<br/>열린 공간</div>}
   {plan.rooms.map(([id,name,detail,x,y,w,h,location])=><button key={id} style={{left:x+'%',top:y+'%',width:w+'%',height:h+'%'}} aria-label={name+' 이동'} aria-current={zone===location?'location':undefined} onClick={()=>onTravel(id)}><b>{name}</b><small>{detail}</small>{zone===location&&<em>● 현재</em>}</button>)}
  </div>
  <div className="map-legend"><span>↑ 북쪽</span><span>─ 연결 동선</span><span>● 현재 공간</span></div>
  <p>{plan.notes}</p><p className="map-help">잔디 동산: Shift로 달리기, E로 눕기·일어나기, V로 하늘 보기. 모바일은 이동 조이스틱을 끝까지 밀면 달립니다. 공간 이름을 누르면 안전한 진입 지점으로 이동합니다.<br/>배치와 연결을 보여 주는 안내도이며 실제 축척과는 다릅니다.</p>
 </section>
}
