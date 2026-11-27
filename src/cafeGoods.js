export const CAFE_GOODS_DETAILS={
 '티백 모양 책갈피':'반투명 티백 속 작은 찻잎, 실 끝의 유령단 종이 태그.',
 '과일 모양 투명 책갈피':'오렌지·레몬·키위 단면의 투명한 책갈피. 글 위에 맑은 색을 남깁니다.',
 '영화유령단 에코백':'영화 보러 가는 유령과 책 한 권을 담은 크림색 천 가방.',
 '북커버':'차분한 녹색 천과 작은 유령 라벨로 책을 감싸는 커버.',
 '노트':'기억하고 싶은 문장을 적는 실 제본 노트.',
 '달력':'책상 위에 세우는 유령단 월간 달력.',
 '큐앤에이다이어리':'하루의 질문과 답을 나란히 기록하는 Q&A 다이어리.'
}
export function goodsKind(name=''){
 for(const [pattern,kind] of [[/티백/,'tea'],[/과일/,'fruit'],[/에코백/,'bag'],[/실내화|슬리퍼/,'slippers'],[/마그넷/,'magnet'],[/키링/,'keyring'],[/조각상/,'statue'],[/인형/,'doll'],[/달력/,'calendar'],[/포스트잇/,'sticky'],[/책갈피/,'bookmark'],[/북커버/,'cover'],[/다이어리/,'diary']])if(pattern.test(name))return kind
 return 'notebook'
}
export function goodsNames(value=''){return [...new Set(value.split('\n').map(v=>v.trim()).filter(Boolean))]}
