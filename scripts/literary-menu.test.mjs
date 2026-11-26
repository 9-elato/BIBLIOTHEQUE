import test from 'node:test'
import assert from 'node:assert/strict'
import {LITERARY_MENU,LEGACY_CAFE_MENU} from '../src/literaryMenu.js'
import {menuItems} from '../src/cafeMenu.js'
import {cafeIdentity} from '../src/cafeData.js'
test('literary menu separates work title, recipe and undecided price',()=>{
 const items=menuItems(LITERARY_MENU)
 assert.equal(items.length,9)
 assert.deepEqual(items.map(i=>i.art),[0,1,2,3,4,5,6,7,8])
 assert.equal(items[1].description,'복숭아·배 주스')
 assert.ok(items.every(i=>i.price==='가격 준비 중'))
 assert.equal(items[0].name,'눈사람자살사건')
})
test('old default menu is migrated without replacing edited recipes',()=>{
 assert.equal(cafeIdentity({conceptVersion:2,menu:LEGACY_CAFE_MENU}).menu,LITERARY_MENU)
 const edited={conceptVersion:2,menu:'나의 음료 | 5,000원'}
 assert.equal(cafeIdentity(edited),edited)
 assert.deepEqual(menuItems('콜미바이유어네임 (복숭아·배 주스) | 6,000원')[0],{name:'콜미바이유어네임',description:'복숭아·배 주스',price:'6,000원',art:1})
})
