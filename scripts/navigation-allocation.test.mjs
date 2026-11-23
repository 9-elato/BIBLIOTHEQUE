import test from 'node:test'
import assert from 'node:assert/strict'
import {movePlayer,walkHeight,FURNITURE} from '../src/navigation.js'
const world={end:45,entranceOpen:true,gateReady:true}

test('movement carries avatar state once while collision substeps slide along furniture',()=>{
 let reads=0
 const state={x:2.3,z:1,level:0,get animation(){reads++;return 'walking'}}
 const next=movePlayer(state,-.8,1.5,world)
 assert.ok(next.x>=2.23,'player radius stays outside the central table')
 assert.ok(Math.abs(next.z-2.5)<1e-9,'unblocked axis slides smoothly')
 assert.equal(next.animation,'walking')
 assert.equal(reads,1,'animation state is copied once, not for each collision probe')
 assert.equal(state.x,2.3,'input state is not mutated')
})

test('collision optimization sees newly placed and relocated blockers without stale caches',()=>{
 const obstacle={floor:0,id:'temporary-audit-blocker',rect:[2.7,3.3,-3.3,-2.7]}
 assert.equal(walkHeight(3,-3,0,world),0)
 FURNITURE.push(obstacle)
 try{
  assert.equal(walkHeight(3,-3,0,world),null)
  obstacle.rect=[3.7,4.3,-3.3,-2.7]
  assert.equal(walkHeight(3,-3,0,world),0)
  assert.equal(walkHeight(4,-3,0,world),null)
 }finally{FURNITURE.splice(FURNITURE.indexOf(obstacle),1)}
 assert.equal(walkHeight(4,-3,0,world),0)
})
