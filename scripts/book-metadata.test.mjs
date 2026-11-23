import test from 'node:test'
import assert from 'node:assert/strict'
import {STAR_RATINGS,validRating,shelfImage,validateBook,importSpine} from '../src/bookMetadata.js'
test('ratings permit half stars from one to five and an unrated record',()=>{
 assert.deepEqual(STAR_RATINGS,[1,1.5,2,2.5,3,3.5,4,4.5,5]);assert.ok(validRating(0))
 for(const value of [-1,.5,2.2,5.5,NaN])assert.equal(validRating(value),false)
})
test('shelved books prefer JPG spines and fall back to cover URLs',()=>{
 const spine='data:image/jpeg;base64,/9j/AA==',cover='https://example.com/cover.jpg'
 assert.equal(shelfImage({spine,cover}),spine);assert.equal(shelfImage({cover}),cover)
 assert.equal(shelfImage({spine:'data:text/html,hello',cover}),cover);assert.equal(shelfImage({}), '')
})
test('metadata validates page count and preserves legacy unrated books',()=>{
 const book={title:'Book',rating:0,cover:''};assert.equal(validateBook(book),'')
 for(const pages of [0,-1,1.5,'no'])assert.ok(validateBook({...book,pages}))
 assert.equal(validateBook({...book,pages:320,rating:4.5}),'')
})
test('spine import rejects disguised or excessive files before decoding',async()=>{
 await assert.rejects(importSpine(new Blob(['not a jpg'],{type:'image/jpeg'})),/JPG/)
 await assert.rejects(importSpine({size:11*1024*1024}),/10MB/)
})
