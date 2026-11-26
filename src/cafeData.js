import {CAFE_GOODS_DETAILS} from './cafeGoods.js'
export const DEFAULT_CAFE={title:'책방지기의 북카페',intro:'개인 서재에서 고른 책과 이야기를 나누는 곳',curationTitle:'이번 달, 오래 머물고 싶은 책',bookIds:[],curationNote:'',menu:'핸드드립 커피 · 5,000원\n카페라테 · 5,500원\n바닐라 라테 · 6,000원\n얼그레이 · 5,000원\n캐모마일 · 5,000원\n레몬에이드 · 6,000원\n핫초콜릿 · 6,000원\n버터 스콘 · 4,000원\n레몬 케이크 · 5,500원',goods:'독서 포스트잇\n책갈피\n유령 인형\n여우의 삐뚤어진 안경 키링',eventTitle:'책과 만나는 행사',eventPoster:'',eventNote:'책방지기가 고른 행사 포스터를 기다리고 있습니다.',filmTitle:'다음 상영작 준비 중',filmPoster:'',filmUrl:'',startTime:''}
export function isScreeningDate(year,month,day){return day%3===0&&new Date(Date.UTC(year,month-1,day)).getUTCDay()===4}
export function screeningDates(from=new Date(),count=6){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(from),get=k=>Number(parts.find(p=>p.type===k).value)
 const cursor=new Date(Date.UTC(get('year'),get('month')-1,get('day'))),result=[]
 for(let i=0;i<730&&result.length<count;i++){const y=cursor.getUTCFullYear(),m=cursor.getUTCMonth()+1,d=cursor.getUTCDate();if(isScreeningDate(y,m,d))result.push(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);cursor.setUTCDate(d+1)}return result
}
export function validCafeTime(value){return value===''||/^(18|19|20|21|22|23):[0-5][0-9]$/.test(value)}
export const CAFE_IDENTITY={name:'유령단',concept:'눈사람 유령이 남긴 흔적',open:'10:00',close:'20:00'}
const NEW_GOODS=['눈사람 실내화','녹은 눈사람 모양 냉장고 마그넷','독서하는 유령 소형 조각상']
export function cafeIdentity(config){
 if(config.conceptVersion===2)return config
 const goods=(config.goods||'').split('\n').filter(Boolean),additions=config.conceptVersion===1?Object.keys(CAFE_GOODS_DETAILS):[...NEW_GOODS,...Object.keys(CAFE_GOODS_DETAILS)]
 return {...config,conceptVersion:2,title:config.title==='책방지기의 북카페'?'유령단':config.title,goods:[...goods,...additions.filter(g=>!goods.includes(g))].join('\n')}
}
