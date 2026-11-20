import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizePlacements,placeBook,firstEmptySlot,loadPlacements,savePlacements} from '../src/placements.js'
import {makeStacks} from '../src/layout.js'
const books=[{id:'a',category:'소설'},{id:'b',category:'과학'},{id:'c',category:'소설'}]
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}}
test('placements survive serialization, title/category changes, and book ordering',()=>{
 const store=memory(),initial=normalizePlacements(books)
 const placed=placeBook(initial,'a',{kind:'table',tableId:'central',slot:3})
 assert.equal(savePlacements(store,'test',placed),'')
 const loaded=loadPlacements(store,'test')
 const reordered=normalizePlacements([{...books[2],category:'역사'},books[0],books[1]],loaded.placements)
 assert.deepEqual(reordered,placed)
})
test('table books leave shelves, shelf slots stay stable after deletion and insertion',()=>{
 const saved=placeBook(normalizePlacements(books),'a',{kind:'table',tableId:'central',slot:0})
 const next=normalizePlacements([books[0],books[2],{id:'new',category:'소설'}],saved)
 assert.deepEqual(next.c,saved.c)
 assert.ok(!next.b)
 const layout=makeStacks([books[0],books[2],{id:'new',category:'소설'}],next)
 const shelfBooks=layout.sections.flatMap(g=>g.cases.flatMap(c=>c.books)).filter(Boolean)
 assert.equal(shelfBooks.length,2)
 assert.ok(!shelfBooks.some(b=>b.id==='a'))
})
test('occupied and invalid placements are rejected without modifying source',()=>{
 const p=normalizePlacements(books),before=JSON.stringify(p)
 assert.throws(()=>placeBook(p,'a',p.c),/다른 책/)
 assert.throws(()=>placeBook(p,'a',{kind:'table',tableId:'central',slot:6}))
 assert.throws(()=>placeBook(p,'a',{kind:'shelf',genre:'unknown',slot:0}))
 assert.equal(JSON.stringify(p),before)
})
test('full tables have no free place and duplicate saved slots are repaired',()=>{
 const full=Object.fromEntries(Array.from({length:3},(_,i)=>[String(i),{kind:'table',tableId:'lounge',slot:i}]))
 assert.equal(firstEmptySlot(full,{kind:'table',tableId:'lounge'},3,'new'),null)
 assert.equal(firstEmptySlot(full,{kind:'table',tableId:'lounge'},3,'1').slot,1)
 const fixed=normalizePlacements(books,{a:{kind:'shelf',genre:'literature',slot:0},c:{kind:'shelf',genre:'literature',slot:0}})
 assert.notDeepEqual(fixed.a,fixed.c)
})
test('corrupt saved data is not overwritten and quota errors are visible',()=>{
 const store=memory();store.setItem('test','{invalid')
 assert.ok(loadPlacements(store,'test').error)
 assert.equal(store.getItem('test'),'{invalid')
 assert.ok(savePlacements({setItem:()=>{throw Error('quota')}},'test',{}))
})
