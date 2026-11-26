import test from 'node:test'
import assert from 'node:assert/strict'
import {LITERARY_MENU,LEGACY_CAFE_MENU,SINGLE_LITERARY_MENU} from '../src/literaryMenu.js'
import {menuItems} from '../src/cafeMenu.js'
import {cafeIdentity} from '../src/cafeData.js'
test('literary menu separates work title, recipe and undecided price',()=>{
 const items=menuItems(LITERARY_MENU)
 assert.equal(items.length,12)
 assert.deepEqual(items.slice(0,9).map(i=>i.art),[0,1,2,3,4,5,6,7,8])
 assert.equal(items[1].description,'복숭아·배 주스')
 assert.ok(items.every(i=>i.price==='가격 준비 중'))
 assert.equal(items[0].name,'눈사람자살사건')
})
test('pairings keep both recipes and illustrations and migrate the earlier menu',()=>{
 const sets=menuItems(LITERARY_MENU).filter(item=>item.set)
 assert.equal(sets.length,3)
 assert.equal(sets[0].name,'마담 프루스트의 비밀정원')
 assert.deepEqual(sets.map(item=>item.arts),[[5,6],[2,8],[7,4]])
 assert.equal(cafeIdentity({conceptVersion:2,menu:SINGLE_LITERARY_MENU}).menu,LITERARY_MENU)
 assert.equal(menuItems('나만의 세트 (얼그레이 + 마들렌) | 8,000원')[0].price,'8,000원')
})
test('old default menu is migrated without replacing edited recipes',()=>{
 assert.equal(cafeIdentity({conceptVersion:2,menu:LEGACY_CAFE_MENU}).menu,LITERARY_MENU)
 const edited={conceptVersion:2,menu:'나의 음료 | 5,000원'}
 assert.equal(cafeIdentity(edited),edited)
 assert.deepEqual(menuItems('콜미바이유어네임 (복숭아·배 주스) | 6,000원')[0],{name:'콜미바이유어네임',description:'복숭아·배 주스',price:'6,000원',art:1})
})
