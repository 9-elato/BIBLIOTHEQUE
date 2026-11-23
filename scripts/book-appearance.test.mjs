import test from 'node:test'
import assert from 'node:assert/strict'
import {bookDimensions,fitImage,coverColor} from '../src/bookAppearance.js'
test('page count controls thickness within shelf slots; missing pages have a default',()=>{
 assert.ok(bookDimensions(100).thickness<bookDimensions(500).thickness)
 assert.ok(bookDimensions(100000).thickness<.373)
 assert.equal(bookDimensions(undefined).thickness,bookDimensions(300).thickness)
 assert.ok(bookDimensions(1).thickness>0);assert.ok(bookDimensions(300).height<.65)
})
test('spine and cover retain their image proportions within the book face',()=>{
 for(const [w,h] of [[100,1500],[600,900],[1500,100]]){const size=fitImage(w,h,[.12,.52]);assert.ok(size[0]<=.120001&&size[1]<=.520001);assert.ok(Math.abs(size[0]/size[1]-w/h)<1e-8)}
})
test('back cover takes the dominant colour and ignores transparent pixels',()=>{
 assert.equal(coverColor(new Uint8ClampedArray([25,50,75,255,25,50,75,255,255,255,255,255,0,0,0,0])),'#19324b')
 assert.equal(coverColor([],'#123456'),'#123456')
})
