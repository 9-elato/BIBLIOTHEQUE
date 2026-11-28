import test from 'node:test'
import assert from 'node:assert/strict'
import {teaStep,breathState} from '../src/verandaRitual.js'
import {SPRING_BATH,SPRING_WATER_HEIGHT,SPRING_BENCH_TOP} from '../src/basementLayout.js'
import {WORLD_HEIGHT_SCALE} from '../src/worldScale.js'
test('tea pours, steeps, serves six sips and cannot skip brewing',()=>{
 let s={stage:'pouring',elapsed:0,sips:0}
 for(let i=0;i<10;i++)s=teaStep(s,.25)
 assert.equal(s.stage,'steeping')
 for(let i=0;i<48;i++)s=teaStep(s,.25)
 assert.equal(s.stage,'ready')
 for(let sip=1;sip<=6;sip++){
  s={...s,stage:'sipping',elapsed:0}
  for(let i=0;i<10;i++)s=teaStep(s,.25)
  assert.equal(s.sips,sip);assert.equal(s.stage,sip===6?'empty':'ready')
 }
 assert.deepEqual(teaStep(s,99),s)
})
test('breathing cycle changes smoothly from inhaling to exhaling',()=>{
 assert.equal(breathState(0).phase,'들이쉬기')
 assert.equal(breathState(4).phase,'내쉬기')
 assert.equal(breathState(4).size,1)
 assert.equal(breathState(60).cycles,6)
 assert.ok(Math.abs(breathState(9.99).size-breathState(10).size)<.001)
})
test('half bath leaves the seated upper torso above water in world units',()=>{
 const immersion=(SPRING_WATER_HEIGHT-SPRING_BATH.height)*WORLD_HEIGHT_SCALE
 assert.ok(immersion>=.3&&immersion<=.5)
 assert.equal(SPRING_BENCH_TOP,SPRING_BATH.height)
 // Even a low seated face at 0.8m retains ample clearance.
 assert.ok(.8-immersion>.3)
})
