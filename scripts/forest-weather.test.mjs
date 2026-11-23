import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {createForestTreeAssets} from '../src/forestTreeAssets.js'
// Captured from the previous weather-dependent generator, before refactoring.
const golden=JSON.parse(readFileSync(new URL('./fixtures/forest-weather-golden.json',import.meta.url),'utf8'))
const digest=array=>createHash('sha256').update(Buffer.from(array.buffer,array.byteOffset,array.byteLength)).digest('hex')
for(const f of golden)test(`forest seed ${f.seed} retains exact transforms, root data and both weather palettes`,()=>{
 const assets=createForestTreeAssets(f.trees,f.seed,{clock:{value:0},strength:{value:0},detail:{value:1}})
 try{
  assert.equal(assets.b.length,f.branches);assert.equal(assets.l.length,f.leaves)
  assert.equal(digest(assets.colors),f.colors)
  assert.equal(digest(assets.snowColors),f.snowColors)
  assert.equal(digest(new Float64Array(assets.l.flatMap(m=>m.elements))),f.leafMatrices)
  assert.equal(digest(assets.lg.attributes.plantRoot.array),f.roots)
 }finally{for(const key of ['bg','lg','bm','lm','bd','ld'])assets[key].dispose()}
})
