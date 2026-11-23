import test from 'node:test'
import assert from 'node:assert/strict'
import {environmentMix,nextBirdDelay} from '../src/environmentAudioMix.js'
import {resolveQuality} from '../src/graphicsQuality.js'
import {windEnvelope,windStrength,grassDensity,leafDensity,leafScale,easeLeafScale} from '../src/vegetationWind.js'
test('coast and woodland produce distinct proximity mixes',()=>{
 const coast=environmentMix({x:-38,z:0},'저택 정원'),forest=environmentMix({x:35,z:22},'동쪽 잔디 들판')
 assert.ok(coast.surf>forest.surf);assert.ok(forest.leaves>coast.leaves);assert.ok(forest.birds>coast.birds)
 const indoors=environmentMix({x:0,z:0},'중앙 홀');assert.equal(indoors.surf,0);assert.equal(indoors.birds,0)
})
test('walking toward shore changes targets smoothly and keeps all levels bounded',()=>{
 let previous
 for(let x=0;x>=-39;x-=.1){const m=environmentMix({x,z:0},'저택 정원');for(const v of Object.values(m))assert.ok(v>=0&&v<=1);if(previous)assert.ok(Math.abs(m.surf-previous.surf)<.001);previous=m}
})
test('bird intervals vary and evening/rain reduce calls',()=>{
 assert.equal(nextBirdDelay(()=>0),4);assert.equal(nextBirdDelay(()=>1),16)
 const p={x:35,z:22};assert.ok(environmentMix(p,'동쪽 잔디 들판','rain').birds<environmentMix(p,'동쪽 잔디 들판').birds)
 assert.ok(environmentMix(p,'동쪽 잔디 들판','sunny','evening').birds<environmentMix(p,'동쪽 잔디 들판').birds)
})
test('mobile has a smaller render budget; detail decays with distance',()=>{
 const mobile=resolveQuality('auto',true),desktop=resolveQuality('auto',false)
 assert.ok(mobile.density<desktop.density);assert.ok(mobile.maxDpr<desktop.maxDpr);assert.equal(resolveQuality('desktop',true),desktop)
 assert.ok(grassDensity(5)>grassDensity(50));assert.ok(leafDensity(5)>leafDensity(100))
})
test('wind evolves over time rather than remaining a still pose',()=>{
 const values=Array.from({length:60},(_,i)=>windEnvelope(i*.2,windStrength('sunny')))
 assert.ok(Math.max(...values)-Math.min(...values)>.02)
 assert.ok(windEnvelope(3,windStrength('rain'))>windEnvelope(3,windStrength('sunny')))
})

test('LOD leaf size is bounded and eases without overshoot across frame rates',()=>{
 assert.equal(leafScale(1000,0),1.5)
 for(const dt of [1/144,1/60,1/20,.5]){let value=1;for(let i=0;i<60;i++){const next=easeLeafScale(value,1.5,dt);assert.ok(next>=value&&next<=1.5);value=next}assert.ok(value>1.3)}
 assert.equal(easeLeafScale(1,1.5,0),1)
})
