import test from 'node:test'
import assert from 'node:assert/strict'
import {rockGeometry,rockFieldGeometry} from '../src/rockSurface.js'
import {solarProfile,natureMood,sceneLighting} from '../src/natureMood.js'
test('rock shapes are deterministic, distinct and finite with wet and dry regions',()=>{
 const a=rockGeometry({seed:2,waterLevel:0}),b=rockGeometry({seed:2,waterLevel:0}),c=rockGeometry({seed:5,waterLevel:0})
 assert.deepEqual(a.attributes.position.array,b.attributes.position.array)
 assert.notDeepEqual(a.attributes.position.array,c.attributes.position.array)
 assert.ok([...a.attributes.normal.array].every(Number.isFinite))
 const wet=[...a.attributes.stoneWet.array];assert.equal(Math.min(...wet),0);assert.equal(Math.max(...wet),1)
 a.dispose();b.dispose();c.dispose()
 const field=rockFieldGeometry([{seed:1},{seed:2,position:[3,0,0]}]);assert.ok(field.boundingSphere.radius>2);field.dispose()
})
test('sun and scene share normalized directions for all four times',()=>{
 for(const time of ['morning','noon','afternoon','evening']){
  const p=solarProfile(time),m=natureMood(time,'sunny');assert.ok(Math.abs(Math.hypot(...p.direction)-1)<1e-9)
  assert.deepEqual(m.sunDirection,p.direction);assert.deepEqual(sceneLighting({time,weather:'sunny'}).sunDirection,p.direction)
 }
 assert.ok(solarProfile('noon').direction[1]>solarProfile('morning').direction[1])
 assert.ok(sceneLighting({time:'noon',outside:true}).direct>sceneLighting({time:'morning',outside:true}).direct)
 assert.ok(natureMood('noon','rain').sunStrength<natureMood('noon','sunny').sunStrength)
})
