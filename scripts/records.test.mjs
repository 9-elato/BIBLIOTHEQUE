import test from 'node:test'
import assert from 'node:assert/strict'
import {PLAYLIST_ID,playlistRequest,recordIndex} from '../src/youtubeRecords.js'
test('ten LP selections address distinct videos in the original playlist',()=>{
 const requests=Array.from({length:10},(_,i)=>playlistRequest(i))
 assert.equal(new Set(requests.map(r=>r.index)).size,10)
 for(const [i,r] of requests.entries())assert.deepEqual(r,{listType:'playlist',list:PLAYLIST_ID,index:i,startSeconds:0})
 assert.equal(recordIndex(-1),0);assert.equal(recordIndex(10),9);assert.equal(recordIndex(NaN),0)
})
