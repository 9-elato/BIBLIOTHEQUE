export function cafeDisplays(books){
 const groups=new Map()
 for(const book of books){const name=book.category?.trim()||'미분류';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(book)}
 if(!groups.size)return ['문학','인문·사회','예술·취미','과학·자연'].map(name=>({name,books:[]}))
 const entries=[...groups].map(([name,books])=>({name,books}))
 return entries.length<=4?entries:[...entries.slice(0,3),{name:'다양한 분야',books:entries.slice(3).flatMap(g=>g.books)}]
}
const PICKS=[
 ['문학',[['산책자','로베르트 발저'],['분신','히가시노 게이고'],['1984','조지 오웰'],['멋진 신세계','올더스 헉슬리'],['동물농장','조지 오웰'],['저 이승의 선지자','김보영'],['데미안','헤르만 헤세'],['어린 왕자','앙투안 드 생텍쥐페리']]],
 ['인문·사회',[['사피엔스','유발 하라리'],['정의란 무엇인가','마이클 샌델'],['군주론','니콜로 마키아벨리'],['국가','플라톤'],['자유론','존 스튜어트 밀'],['월든','헨리 데이비드 소로'],['목민심서','정약용'],['인간의 조건','한나 아렌트']]],
 ['예술·취미',[['예술의 이야기','E. H. 곰브리치'],['다른 방식으로 보기','존 버거'],['방구석 미술관','조원재'],['그림의 힘','김선현'],['카메라 루시다','롤랑 바르트'],['사진에 관하여','수전 손택'],['음악으로 자유로워지다','류이치 사카모토'],['건축을 향하여','르 코르뷔지에']]],
 ['과학·자연',[['코스모스','칼 세이건'],['침묵의 봄','레이첼 카슨'],['이기적 유전자','리처드 도킨스'],['종의 기원','찰스 다윈'],['시간의 역사','스티븐 호킹'],['물고기는 존재하지 않는다','룰루 밀러'],['거의 모든 것의 역사','빌 브라이슨'],['엔트로피','제러미 리프킨']]],
]
// Display-only selections do not create completed books or personal reading records.
export function representativeDisplays(books=[]){return PICKS.map(([name,titles],group)=>({name,books:titles.map(([title,author],i)=>books.find(b=>bookKey(b.title)===bookKey(title)&&bookKey(b.author)===bookKey(author))||{id:`cafe-pick-${group}-${i}`,title,author,category:name,cover:'',color:['#3e453e','#9c8668','#ded2bb','#554a44'][i%4],displayOnly:true})}))}
const bookKey=value=>(value||'').replace(/\s/g,'')
export function curatedDisplay(config,books=[]){
 const selected=(config.bookIds||[]).map(id=>books.find(b=>b.id===id)).filter(Boolean)
 const unique=[],seen=new Set()
 for(const b of [...selected,...representativeDisplays(books)[0].books]){const key=bookKey(b.title)+'|'+bookKey(b.author);if(!seen.has(key)){seen.add(key);unique.push(b)}}
 return unique.slice(0,8)
}
