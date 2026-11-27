import test from 'node:test'
import assert from 'node:assert/strict'
import {drinkRecipe,holdDrink,drinkSnapshot,subscribeDrink} from '../src/cafeDrink.js'
test('matcha uses the same green drink in a hot mug and an iced glass',()=>{
 const item={name:'말차 라테'},hot=drinkRecipe(item,'hot'),cold=drinkRecipe(item,'iced')
 assert.equal(hot.vessel,'mug');assert.equal(cold.vessel,'glass')
 assert.equal(hot.color,'#a5bd65');assert.equal(hot.color,cold.color)
})
test('cold-only recipes and pairing sets retain their actual beverage',()=>{
 assert.equal(drinkRecipe({name:'눈사람자살사건',description:'밀크쉐이크'},'hot').temperature,'iced')
 assert.equal(drinkRecipe({name:'마담 프루스트',description:'얼그레이 + 마들렌'}).vessel,'mug')
 assert.equal(drinkRecipe({name:'브라우니'}),null)
 assert.notEqual(drinkRecipe({name:'호지 라테'}).color,drinkRecipe({name:'말차 라테'}).color)
})
test('ordering replaces one held drink, returning clears it and subscribers are released',()=>{
 let updates=0;const unsubscribe=subscribeDrink(()=>updates++)
 holdDrink(drinkRecipe({name:'말차 라테'}));holdDrink(drinkRecipe({name:'커피'},'iced'))
 assert.equal(drinkSnapshot().name,'커피');assert.equal(updates,2)
 holdDrink(null);assert.equal(drinkSnapshot(),null);assert.equal(updates,3)
 unsubscribe();holdDrink(null);assert.equal(updates,3)
})
