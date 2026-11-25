import React from 'react'
import './cafeInvitation.css'

export default function CafeInvitation({config}){
 return <section className="cafe-invitation" aria-label="책방지기의 초대장">
  <p className="invitation-kicker">A LETTER FROM YOUR BOOKKEEPER</p>
  <span className="invitation-seal" aria-hidden="true">✉</span>
  <h2>당신을 북카페에 초대합니다</h2>
  <p>반가운 손님께,</p>
  <p>좋아하는 책 한 권과 따뜻한 차 한 잔을 준비했습니다. 서두르지 않고 머물러 주세요. 오늘의 자리는 당신을 위해 비워 두었습니다.</p>
  <p className="invitation-signature">{config.title} · 책방지기 드림</p>
  <h3>이곳의 작은 이야기</h3>
  <p>{config.intro}</p>
  <p>녹는 유령 눈사람처럼, 마음의 긴장도 천천히 녹아드는 곳. 고요한 클래식 모던 공간에서 책방지기가 고른 책과 이야기를 만나세요.</p>
  <h3>초대받은 공간 둘러보기</h3>
  <svg className="invitation-map" viewBox="0 0 440 420" role="img" aria-labelledby="cafe-map-title cafe-map-desc">
   <title id="cafe-map-title">북카페 미니맵</title>
   <desc id="cafe-map-desc">오른쪽 입구로 들어오면 초대장과 메뉴 카운터가 있습니다. 왼쪽은 창가 좌석, 중앙은 2인 좌석, 위쪽은 큐레이션과 굿즈, 아래쪽 별도 공간은 미니 극장입니다.</desc>
   <rect x="12" y="12" width="390" height="390" rx="18" fill="#f4e8cf" stroke="#816443" strokeWidth="3"/>
   <rect x="30" y="30" width="166" height="54" rx="9" fill="#d6dfc4"/>
   <rect x="209" y="30" width="175" height="54" rx="9" fill="#e7cfb3"/>
   <text x="113" y="62">선별 도서</text><text x="296" y="62">굿즈</text>
   <path d="M25 102V245" stroke="#86b8bd" strokeWidth="8"/>
   <rect x="43" y="110" width="91" height="126" rx="15" fill="#b9cbb1"/>
   <text x="88" y="166">창가</text><text x="88" y="192">1인 좌석</text>
   <circle cx="202" cy="165" r="31" fill="#c8a27b"/>
   <rect x="182" y="113" width="40" height="15" rx="7" fill="#537568"/>
   <rect x="182" y="202" width="40" height="15" rx="7" fill="#537568"/>
   <text x="202" y="170">2인</text>
   <rect x="283" y="102" width="100" height="90" rx="9" fill="#e5d4b9"/>
   <text x="333" y="135">메뉴</text><text x="333" y="163">✉ 초대장</text>
   <path d="M402 204V247" stroke="#f4e8cf" strokeWidth="7"/>
   <path d="M428 225H354m10-7-10 7 10 7" fill="none" stroke="#a56534" strokeWidth="3"/>
   <text x="369" y="264">입구</text>
   <path d="M13 283H254m54 0h94" stroke="#816443" strokeWidth="5"/>
   <text x="282" y="306" fontSize="13">출입구</text>
   <rect x="41" y="302" width="178" height="9" rx="4" fill="#547269"/>
   {[60,119,178].map(x=><rect key={x} x={x} y="330" width="39" height="27" rx="8" fill="#b78070"/>)}
   <text x="200" y="384">별도 공간 · 미니 극장</text>
  </svg>
  <p className="invitation-note">공간을 쉽게 찾기 위한 간략 안내도입니다.</p>
  <h3>오늘의 메뉴</h3>
  <ul className="invitation-menu">{config.menu.split('\n').filter(line=>line.trim()).map((line,i)=><li key={i}>{line}</li>)}</ul>
  <h3>편안히 머무는 방법</h3>
  <ol>
   <li>선별 도서 진열대에서 책방지기의 큐레이션을 살펴보세요.</li>
   <li>빈 좌석 가까이에서 E 키 또는 화면의 상호작용 버튼으로 앉고 일어날 수 있습니다.</li>
   <li>메뉴와 굿즈는 책방지기가 고른 소개 목록입니다. 실제 주문·결제 기능은 없습니다.</li>
   <li>안쪽 미니 극장은 별도 공간입니다. 아래 상영표에서 작품과 책방지기가 정한 시각을 확인하세요.</li>
  </ol>
  <p className="invitation-note">초대장은 입구 카운터에서 언제든 다시 펼칠 수 있습니다.</p>
 </section>
}
