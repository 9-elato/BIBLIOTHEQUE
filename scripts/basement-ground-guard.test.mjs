import test from 'node:test'
import assert from 'node:assert/strict'
import {BASEMENT_GROUND_GUARDS,BASEMENT_HEIGHT} from '../src/basementLayout.js'
import {walkHeight,movePlayer,PLAYER_RADIUS} from '../src/navigation.js'
const world={end:45,entranceOpen:true,gateReady:true}

test('ground-level basement stair guard prevents the body passing through its visible rail',()=>{
 assert.equal(walkHeight(8,-3.85,0,world),null,'previously accepted although the body overlaps the rail')
 const guard=BASEMENT_GROUND_GUARDS.find(g=>g.rect[2]>-4.8),edge=guard.rect[3]
 const p=movePlayer({x:8,z:-3,level:0},0,-1,world)
 assert.ok(p.z-PLAYER_RADIUS>=edge,'whole body stays outside the guard')
 const q=movePlayer(p,.2,0,world)
 assert.ok(Math.abs(q.x-8.2)<.01,'can slide along the guard without sticking')
})

test('guardrails leave the basement stair entrance and both floor landings unobstructed',()=>{
 let p={x:3,z:-4.8,level:0}
 p=movePlayer(p,10.5,0,world)
 assert.ok(Math.abs(p.x-13.5)<.01);assert.equal(p.level,BASEMENT_HEIGHT)
 p=movePlayer(p,-10.5,0,world)
 assert.ok(Math.abs(p.x-3)<.01);assert.equal(p.level,0)
 for(const {rect:[l,r,b,f]} of BASEMENT_GROUND_GUARDS){
  assert.equal(walkHeight((l+r)/2,(b+f)/2,0,world),null)
 }
})
