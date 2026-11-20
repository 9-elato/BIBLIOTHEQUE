import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {gzipSync} from 'node:zlib'
import {decodeModel} from '../src/modelTransfer.js'
test('compressed GLB decodes byte-for-byte, including hosts that decode it already',async()=>{
 const source=await readFile(new URL('../public/models/ghost_avatar.glb',import.meta.url))
 for(const body of [gzipSync(source),source])assert.deepEqual(Buffer.from(await decodeModel(new Response(body))),source)
})
test('corrupt compressed response rejects so the loader can use the original GLB',async()=>{
 await assert.rejects(()=>decodeModel(new Response(new Uint8Array([0x1f,0x8b,0,0]))))
})
