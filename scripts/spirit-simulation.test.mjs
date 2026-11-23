import test from 'node:test'
import assert from 'node:assert/strict'
import {advanceSpirit} from '../src/spiritSimulation.js'

const route={floor:0,points:[[0,0],[3,0],[3,3]]}
const state=()=>({x:0,z:0,level:0,target:1,pause:0})
const visible={visible:true}
const freeMove=(s,x,z)=>({...s,x:s.x+x,z:s.z+z})

test('hidden interior skips navigation and preserves spirit route and pause state',()=>{
 const parent={visible:false},object={visible:true,parent},s={...state(),pause:1},before={...s}
 let calls=0
 const move=(s,x,z)=>{calls++;return freeMove(s,x,z)}
 for(let i=0;i<3600;i++)assert.equal(advanceSpirit(s,route,null,1/60,0,object,move),false)
 assert.equal(calls,0);assert.deepEqual(s,before)
 parent.visible=true
 advanceSpirit(s,route,null,60,0,object,move)
 assert.equal(s.pause,.95);assert.equal(s.x,0);assert.equal(calls,0)
 s.pause=0
 advanceSpirit(s,route,null,60,0,object,move)
 assert.equal(calls,1);assert.ok(s.x>0&&s.x<=.024)
})

test('visible spirit moves at its existing speed and waits at route points',()=>{
 const s=state()
 for(let i=0;i<60;i++)advanceSpirit(s,route,null,1/60,0,visible,freeMove)
 assert.ok(Math.abs(s.x-.48)<1e-9);assert.equal(s.z,0)
 s.x=2.96
 advanceSpirit(s,route,null,1/60,0,visible,freeMove)
 assert.equal(s.target,2);assert.equal(s.pause,2.5)
 advanceSpirit(s,route,null,1/60,0,visible,freeMove)
 assert.equal(s.x,2.96);assert.ok(s.pause<2.5&&s.pause>2.4)
})

test('paused spirit prioritizes yielding to nearby visitor and rejects worsening overlap',()=>{
 const s={...state(),x:.9,pause:1},player={x:0,z:0,level:0}
 advanceSpirit(s,route,player,1/60,0,visible,freeMove)
 assert.ok(s.x>.9)
 const crowded={...state(),x:.7},before={...crowded}
 const enterVisitor=()=>({...crowded,x:.2})
 assert.equal(advanceSpirit(crowded,route,player,1/60,0,visible,enterVisitor),false)
 assert.deepEqual(crowded,before)
})

test('blocked spirit chooses its next route point without walking through the obstacle',()=>{
 const s=state()
 advanceSpirit(s,route,null,1/60,0,visible,p=>({...p}))
 assert.equal(s.x,0);assert.equal(s.z,0);assert.equal(s.target,2);assert.equal(s.pause,.5)
})

test('invalid or zero frame deltas cannot advance the spirit',()=>{
 for(const dt of [0,-1,NaN,Infinity]){
  const s=state(),before={...s}
  assert.equal(advanceSpirit(s,route,null,dt,0,visible,()=>{throw Error('unexpected movement')}),false)
  assert.deepEqual(s,before)
 }
})
