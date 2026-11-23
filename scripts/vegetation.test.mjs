import test from 'node:test'
import assert from 'node:assert/strict'
import {ShaderLib} from 'three'
import {seeded,windStrength,windEnvelope,grassDensity,leafDensity,windMaterial} from '../src/vegetationWind.js'
test('vegetation density falls continuously with distance and retains a distant canopy',()=>{
 for(const density of [grassDensity,leafDensity]){
  let previous=1
  for(let d=0;d<220;d+=.1){const value=density(d);assert.ok(value>0&&value<=previous+1e-9);assert.ok(Math.abs(value-previous)<.01);previous=value}
 }
 assert.equal(grassDensity(0),1);assert.equal(leafDensity(200),.16)
})
test('calm wind moves leaves without large branch sway and storms engage the hierarchy',()=>{
 const calm=windStrength('sunny'),storm=windStrength('rain')
 for(let t=0;t<120;t+=.3){assert.ok(windEnvelope(t,calm)>0);assert.ok(windEnvelope(t,calm)<.48);assert.ok(windEnvelope(t,storm)>windEnvelope(t,calm))}
 assert.ok(windEnvelope(5,storm)>.48)
 const a=seeded(31),b=seeded(31),c=seeded(32)
 for(let i=0;i<20;i++){const value=a();assert.equal(value,b());assert.notEqual(value,c())}
})
test('visible and depth shaders use identical wind geometry and shadow coordinates use displaced positions',()=>{
 const uniforms={clock:{value:3},strength:{value:.8},detail:{value:1.4}}
 for(const kind of ['grass','leaf','branch']){
  const material=windMaterial(kind,uniforms),depth=windMaterial(kind,uniforms,true)
  const a={uniforms:{},vertexShader:ShaderLib.standard.vertexShader},b={uniforms:{},vertexShader:ShaderLib.depth.vertexShader}
  material.onBeforeCompile(a);depth.onBeforeCompile(b)
  const motion=s=>s.slice(s.indexOf('vec4 mvPosition='),s.indexOf('gl_Position=projectionMatrix*mvPosition;'))
  assert.equal(motion(a.vertexShader),motion(b.vertexShader))
  assert.ok(a.vertexShader.includes('worldPosition=modelMatrix*plantPosition'))
  assert.equal(a.uniforms.plantClock,b.uniforms.plantClock)
  assert.equal(a.uniforms.leafSize,b.uniforms.leafSize)
  material.dispose();depth.dispose()
 }
})
