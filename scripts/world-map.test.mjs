import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {build} from 'esbuild'
import {mkdtemp,rm,writeFile,mkdir,readFile} from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
await mkdir('outputs',{recursive:true})
const dir=await mkdtemp(path.resolve('outputs/map-test-')),file=path.join(dir,'map.mjs')
await build({entryPoints:['src/WorldMap.jsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent'})
const {default:WorldMap,floorForZone}=await import(pathToFileURL(file).href)
after(()=>rm(dir,{recursive:true,force:true}))
test('storybook directory preserves accessible destinations on all floors',async()=>{
 for(let floor=0;floor<4;floor++){
  const html=renderToStaticMarkup(React.createElement(WorldMap,{floor,zone:'저택 정원',stackLayout:{end:45},onFloor(){},onTravel(){},onClose(){}}))
  assert.ok(html.includes('role="tabpanel"'))
  assert.ok(html.includes('공간 바로 이동'))
  assert.ok(html.includes('class="map-art"')||html.includes('class="map-art" transform'))
  assert.ok(!html.includes('NaN'))
  if(floor===0){
   for(const name of ['북카페','서가','동쪽 잔디 들판','바다 마루','정원 산책로'])assert.ok(html.includes(name))
   assert.ok(html.includes('outdoor is-current'))
   const svg=html.match(/<svg[\s\S]*?<\/svg>/)[0]
   const css=await readFile('src/style.css','utf8')
   await writeFile('outputs/story-map-preview.html',`<!doctype html><meta charset="utf-8"><style>${css}</style><main style="width:600px;background:#fff7e8;padding:20px">${html}</main>`)
   await writeFile('outputs/story-map-preview.svg',svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"').replace(/(<svg[^>]*>)/,`$1<style>${css.replaceAll('&','&amp;')}</style>`))
  }
 }
 assert.equal(floorForZone('별빛 테라스'),2)
 assert.equal(floorForZone('숲 온천'),3)
})
