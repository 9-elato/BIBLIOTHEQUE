import {LITERARY_MENU,LEGACY_CAFE_MENU,SINGLE_LITERARY_MENU} from './literaryMenu.js'
import {CAFE_GOODS_DETAILS} from './cafeGoods.js'
export const DEFAULT_CAFE={title:'책방지기의 북카페',intro:'개인 서재에서 고른 책과 이야기를 나누는 곳',curationTitle:'이번 달, 오래 머물고 싶은 책',bookIds:[],curationNote:'',menu:LITERARY_MENU,goods:'독서 포스트잇\n책갈피\n유령 인형\n여우의 삐뚤어진 안경 키링',eventTitle:'책과 만나는 행사',eventPoster:'',eventNote:'책방지기가 고른 행사 포스터를 기다리고 있습니다.',filmTitle:'다음 상영작 준비 중',filmPoster:'',filmUrl:'',startTime:''}
export function isScreeningDate(year,month,day){return day%3===0&&new Date(Date.UTC(year,month-1,day)).getUTCDay()===4}
export function screeningDates(from=new Date(),count=6){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(from),get=k=>Number(parts.find(p=>p.type===k).value)
 const cursor=new Date(Date.UTC(get('year'),get('month')-1,get('day'))),result=[]
 for(let i=0;i<730&&result.length<count;i++){const y=cursor.getUTCFullYear(),m=cursor.getUTCMonth()+1,d=cursor.getUTCDate();if(isScreeningDate(y,m,d))result.push(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);cursor.setUTCDate(d+1)}return result
}
export function validCafeTime(value){return value===''||/^(18|19|20|21|22|23):[0-5][0-9]$/.test(value)}
export function upcomingScreenings(startTime,from=new Date(),count=6){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(from)
 const get=k=>parts.find(p=>p.type===k).value,today=`${get('year')}-${get('month')}-${get('day')}`,time=`${get('hour')}:${get('minute')}`
 return screeningDates(from,count+1).filter(date=>date!==today||!startTime||time<=startTime).slice(0,count)
}
export const CAFE_IDENTITY={name:'유령단',concept:'눈사람 유령이 남긴 흔적',open:'10:00',close:'20:00'}
const NEW_GOODS=['눈사람 실내화','녹은 눈사람 모양 냉장고 마그넷','독서하는 유령 소형 조각상']
export function cafeIdentity(config){
 if('eventTitle' in config&&config.eventPosterVersion!==20261126){
  const untouched=!config.eventPoster&&(!config.eventTitle||config.eventTitle===DEFAULT_CAFE.eventTitle)&&(!config.eventNote||config.eventNote===DEFAULT_CAFE.eventNote)
  config={...config,eventPosterVersion:20261126,...(untouched?{eventTitle:'2026 서울국제도서전 · 지난 행사',eventNote:'인간서어 Homo duduri | 2026.6.24(수)–28(일) | 코엑스 A&B1홀. 첨부 포스터 아카이브입니다.',eventPoster:new URL(`${import.meta.env?.BASE_URL||'/'}posters/seoul-book-fair-2026.webp`,globalThis.location?.href||'http://localhost/').href}:{})}
 }

 if(['책방지기의 북카페','유령단','눈사람 유령이 남긴 흔적'].includes(config.title))config={...config,title:'BOOk'}
 if(config.menu===LEGACY_CAFE_MENU||config.menu===SINGLE_LITERARY_MENU)config={...config,menu:LITERARY_MENU}
 if(config.conceptVersion===2)return config
 const goods=(config.goods||'').split('\n').filter(Boolean),additions=config.conceptVersion===1?Object.keys(CAFE_GOODS_DETAILS):[...NEW_GOODS,...Object.keys(CAFE_GOODS_DETAILS)]
 return {...config,conceptVersion:2,title:config.title==='책방지기의 북카페'?'유령단':config.title,goods:[...goods,...additions.filter(g=>!goods.includes(g))].join('\n')}
}
