import test from 'node:test'
import assert from 'node:assert/strict'
import {CORRIDOR_CEILING,PASSAGE_CEILING,underside,suspension} from '../src/fixtureMounts.js'

test('entrance pendants reach actual ceiling underside, including after ceiling resize',()=>{
 for(const [lightY,ceiling] of [[3.63,CORRIDOR_CEILING],[3.4,CORRIDOR_CEILING],[2.93,PASSAGE_CEILING]]){
  for(const rise of [0,2]){
   const target=underside({...ceiling,y:ceiling.y+rise}),m=suspension(lightY,target)
   assert.ok(Math.abs(lightY+m.center-m.length/2-lightY)<1e-10)
   assert.ok(Math.abs(lightY+m.center+m.length/2-target)<1e-10)
   assert.ok(Math.abs(lightY+m.cap-target)<1e-10)
  }
 }
})
test('invalid pendant mounts cannot silently create inverted support geometry',()=>{
 for(const y of [2,3,NaN,Infinity])assert.throws(()=>suspension(3,y),RangeError)
})

