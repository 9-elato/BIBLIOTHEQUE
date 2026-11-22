import test from 'node:test'
import assert from 'node:assert/strict'
import {natureMood,sceneLighting} from '../src/natureMood.js'
import {surfaceRelief} from '../src/surfaceRelief.js'
const luminance=hex=>{const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
test('forest distance layers retain readable atmospheric contrast in all supported moods',()=>{
 for(const time of ['afternoon','evening'])for(const weather of ['sunny','rain','snow']){
  const p=natureMood(time,weather)
  assert.ok(luminance(p.far)>luminance(p.mid));assert.ok(luminance(p.mid)>luminance(p.near));assert.ok(p.fogNear<p.fogFar);assert.ok(p.fogFar<190)
  for(const outside of [false,true])for(const cozy of [false,true]){const l=sceneLighting({time,weather,outside,cozy});for(const key of ['ambient','hemisphere','direct'])assert.ok(Number.isFinite(l[key])&&l[key]>=0);assert.ok(l.ambient>=.2)}
 }
 assert.ok(sceneLighting({time:'afternoon',weather:'rain',outside:true}).direct<sceneLighting({time:'afternoon',weather:'sunny',outside:true}).direct)
})
test('surface relief remains small, deterministic and contains continuous material variation',()=>{
 for(const kind of ['stone','wood','fabric']){const a=surfaceRelief(kind),b=surfaceRelief(kind);assert.equal(a.image.width,128);assert.deepEqual(a.image.data,b.image.data);const values=new Set();for(let i=0;i<a.image.data.length;i+=4){values.add(a.image.data[i]);assert.equal(a.image.data[i+3],255)}assert.ok(values.size>20);assert.ok(a.generateMipmaps);a.dispose();b.dispose()}
})
