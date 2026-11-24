import {nextVegetationPoll} from '../src/vegetationSchedule.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import {oceanSegments} from '../src/oceanGeometry.js'
import {windMaterial,windEnvelope} from '../src/vegetationWind.js'
test('bay mesh keeps sub-metre sampling with fewer vertices and a smaller mobile budget',()=>{
 const a=oceanSegments([16,25]),b=oceanSegments([16,25],true)
 assert.ok((a[0]+1)*(a[1]+1)<6161*.3)
 assert.ok(b[0]*b[1]<a[0]*a[1])
 for(const mobile of [false,true]){const c=oceanSegments([200,105],mobile);assert.ok(c[0]*c[1]<=6000)}
})
test('tree shaders share CPU gust without repeating envelope per vertex',()=>{
 const gust={value:windEnvelope(2,.24)},m=windMaterial('leaf',{clock:{value:2},strength:{value:.24},gust})
 try{const s={uniforms:{},vertexShader:'#include <project_vertex>\n#include <worldpos_vertex>'};m.onBeforeCompile(s);assert.equal(s.uniforms.plantGust,gust);assert.ok(s.vertexShader.includes('float gust=plantGust;'));assert.ok(!s.vertexShader.includes('sin(plantClock*.31)'))}finally{m.dispose()}
})


test('vegetation polling is distributed and catches up directly after a long pause',()=>{
 const slots=new Set();for(let i=0;i<80;i++){const t=nextVegetationPoll(1,i*12,24);assert.ok(t>1&&t<=1.2);slots.add(Math.floor((t-1)*60));const resumed=nextVegetationPoll(800,i*12,24);assert.ok(resumed>800&&resumed<=800.2)}assert.ok(slots.size>=10)
})
