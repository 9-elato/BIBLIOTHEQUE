import {archBlocks} from './groundArchitecture.js'
import {inMeadow,meadowHeight} from './meadowLayout.js'
import {eastMeadowWalk,inEastMeadow} from './eastMeadowLayout.js'
import {atticX} from './atticLayout.js'
export const GENRES = [
  { id:'literature', name:'문학', categories:['소설','희곡','시·에세이','시','에세이','기타'], wood:'#4c2c20', trim:'#865437', plate:'#b99150' },
  { id:'humanities', name:'인문학·철학', categories:['인문·사회','인문학','철학'], wood:'#4f2428', trim:'#794537', plate:'#d1ae75' },
  { id:'history', name:'역사', categories:['역사'], wood:'#60422c', trim:'#97734b', plate:'#bc9b69' },
  { id:'science', name:'과학', categories:['과학'], wood:'#344340', trim:'#8e7552', plate:'#a8b9ac' },
  { id:'art', name:'예술', categories:['예술'], wood:'#34533e', trim:'#bb925d', plate:'#dec7a0' },
  { id:'languages', name:'외국어', categories:['외국어','영어','프랑스어','기타 외국어'], wood:'#6a4936', trim:'#996e50', plate:'#a9bdc4' }
]

export function genreOf(category) {
  return GENRES.find(genre => genre.categories.includes(category))?.id ?? 'literature'
}

export const ROOM_SPOTS = {
  eastmeadow:[21,-19,0,Math.PI/2],
  terrace:[-13.2,8,10.6,0],basement:[14,-2.9,-5.2,-2.75],bathroom:[19.3,0,-5.2,2.7],basementstairs:[3,-4.8,0,-Math.PI/2],
  veranda:[-10.2,-8.5,0,0], greenhouse:[0,-6,7.2,0], vestibule:[0,9.3,0,0], 'garden-west':[-5.6,17.75,0,Math.PI], 'garden-east':[5.6,23.75,0,Math.PI],
  meadow:[0,48,meadowHeight(0,48),Math.PI], estate:[0,23,0,0], main:[0,5.5,0,0], lounge:[-8.8,0,0,-Math.PI/2],
  stacks:[8.4,0,0,Math.PI/2], corridor:[0,-9,0,0], secret:[0,-20,0,0],
  mezzanine:[-6.35,-5.7,7.2,Math.PI], reading:[8.2,0,7.2,Math.PI/2], attic:[-15.6,4.4,10.6,0], atticbed:[atticX(-15.6),-.4,10.6,0], stairs:[-6.35,6.1,0,0]
}

export const SOFAS = [
  {x:-13.6,z:2.8,seats:6,turn:Math.PI,color:'#674044'},
  {x:-9.2,z:-3.6,seats:3,turn:-Math.PI/2,color:'#425c4d'},
  {x:-17,z:.3,seats:2,turn:Math.PI/2,color:'#795740'},
  {x:-9.9,z:3.6,seats:1,turn:-Math.PI/2,color:'#76604b'}
]
export const DESKS = [[9.6,-3],[12,-3]]
export const SHELF_CAPACITY = 24

export function makeStacks(books,placements={}) {
  const groups = Object.fromEntries(GENRES.map(genre => [genre.id, []]))
  for (const book of books) {
    const placement=placements[book.id]
    if(placement?.kind==='table')continue
    const genre=placement?.kind==='shelf'&&groups[placement.genre]?placement.genre:genreOf(book.category)
    if(placement?.kind==='shelf')groups[genre][placement.slot]=book
    else groups[genre].push(book)
  }
  let x = 15.1
  const sections = GENRES.map(genre => {
    const collection = groups[genre.id]
    const bays = Math.max(1, Math.ceil(collection.length / (SHELF_CAPACITY * 2)))
    const start = x
    const cases = Array.from({length:bays * 2}, (_,index) => ({
      x:start + Math.floor(index / 2) * 3.4,
      z:index % 2 ? 4.9 : -4.9,
      number:index + 1,
      books:collection.slice(index * SHELF_CAPACITY, (index + 1) * SHELF_CAPACITY)
    }))
    x += bays * 3.4 + 1.6
    return {genre,cases,start}
  })
  return {sections, end:x - 2}
}

const inside = (x,z,[left,right,back,front]) => x > left && x < right && z > back && z < front
const SOLIDS = [
  ...SOFAS.map(({x,z,seats,turn}) => {
    const width = seats * .72 + .35
    const alongZ = Math.abs(Math.sin(turn)) > .9
    return [x,z,alongZ?1.1:width,alongZ?width:1.1]
  }),
  ...DESKS.map(([x,z]) => [x,z,2.05,1.9]),
  [-13.8,-5.9,4.3,1.4],[-16.35,-5.8,1.3,.8],
  [-13.4,.15,1.75,.85],
  [-3.1,-14.4,3.05,1], [3.1,-14.4,3.05,1],
  [0,-28.75,13.7,.9],[-6.45,-24.8,.92,7.9]
]

export function canWalk(x,z,{end,gateReady,entranceOpen,verandaDoor}) {
  const meadow=eastMeadowWalk(x,z,gateReady)
  if(meadow!==null)return meadow
  if(archBlocks(x,z))return false
  if(x < -8.8 && z < -6.35){
    if(z > -7.15)return Math.abs(x+10.2)<.64 && verandaDoor?.open && (verandaDoor?.amount??0)>.85
    if(x<=-20.25||x>=-9.05||z<=-13.7)return false
    return !(Math.abs(x+15)<1.1&&Math.abs(z+11)<.8)
  }
  if(inMeadow(x,z,.3))return true
  const ax = Math.abs(x)
  if (z > 11.3) {
    if(z<17.4&&x>6.55)return false
    if (z < 12.25) return entranceOpen && ax < 1.23
    return ax < 12.8 && z < 33.5
  }
  if (z > 7.1) return ax < 2.55
  if (z < -6.48 && z > -7.35 && ax < 7.5 && ax >= 1.95) return false
  if (Math.abs(ax - 7.5) < .35 && z > -6.8 && Math.abs(z) >= 2.05) return false
  if (z <= -6.8 && ax < 7.5) {
    if (z > -13 && ax >= 2.1) return false
    if (z <= -13 && z > -14.02 && ax >= 4.55) return false
    if (z <= -14.02 && z >= -15.18 && (!gateReady || ax >= 1.25)) return false
    if (z < -15.18 && z > -19 && ax >= 1.35) return false
    if (z <= -19 && (ax >= 7 || z <= -29.3)) return false
    return !SOLIDS.some(([cx,cz,w,d]) => Math.abs(x-cx)<w/2+.22 && Math.abs(z-cz)<d/2+.22)
  }
  const inRoom = [[-7.5,7.5,-6.8,7.2],[-20.5,-7.15,-6.6,6.6],[7.15,end,-5.75,5.75]]
    .some(rect => inside(x,z,rect))
  if (!inRoom || (x > 13.5 && Math.abs(z) > 4.23) || x>end-.9) return false
  return !SOLIDS.some(([cx,cz,w,d]) => Math.abs(x-cx)<w/2+.22 && Math.abs(z-cz)<d/2+.22)
}

export function zoneAt(x,z) {
  if(inEastMeadow(x,z))return '동쪽 잔디 들판'
  if (z > 32) return '잔디 동산'
  if (z > 12.2) return '저택 정원'
  if (z > 7.1) return '현관'
  if (x < -8.8 && z < -6.7) return '바다 마루'
  if (x < -7.5) return '벽난로 라운지'
  if (x > 7.5) return '서가'
  if (z < -19) return '개인 작업실'
  if (z < -14.6) return '비밀 통로'
  if (z < -6.8) return '북쪽 복도'
  return '중앙 홀'
}
