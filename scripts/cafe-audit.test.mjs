import test from 'node:test'
import assert from 'node:assert/strict'
import {curatedDisplay,representativeDisplays} from '../src/cafeDisplays.js'
import {cafeIdentity,DEFAULT_CAFE,upcomingScreenings} from '../src/cafeData.js'
test('curation preserves owner order, fills eight slots and retains registered metadata',()=>{
 const books=[{id:'mine',title:'직접 고른 책',author:'책방지기'},{id:'walk',title:'산책자',author:'로베르트 발저',cover:'https://example.com/cover.jpg'}]
 const shown=curatedDisplay({bookIds:['mine','missing','mine']},books)
 assert.equal(shown.length,8);assert.equal(shown[0],books[0]);assert.equal(shown[1],books[1]);assert.equal(new Set(shown.map(b=>b.id)).size,8)
 assert.equal(representativeDisplays(books)[0].books[0],books[1])
})
test('same title by a different author does not replace representative book metadata',()=>{
 const other={id:'other',title:'산책자',author:'다른 작가',cover:'wrong'}
 assert.equal(representativeDisplays([other])[0].books[0].cover,'')
})
test('default event migration never overwrites bookkeeper event text or image',()=>{
 for(const edited of [{eventTitle:'새 행사'},{eventNote:'직접 쓴 행사 안내'},{eventPoster:'https://example.com/poster.jpg'}]){
  const original={...DEFAULT_CAFE,...edited},migrated=cafeIdentity(original)
  for(const key of ['eventTitle','eventNote','eventPoster'])assert.equal(migrated[key],original[key])
  assert.equal(cafeIdentity(migrated),migrated)
 }
 assert.match(cafeIdentity(DEFAULT_CAFE).eventTitle,/서울국제도서전/)
})
test('screening list excludes a screening that has already started in Korean time',()=>{
 assert.equal(upcomingScreenings('19:00',new Date('2026-11-12T09:59:00Z'))[0],'2026-11-12')
 assert.notEqual(upcomingScreenings('19:00',new Date('2026-11-12T10:01:00Z'))[0],'2026-11-12')
 assert.equal(upcomingScreenings('',new Date('2026-11-12T10:01:00Z'))[0],'2026-11-12')
})
