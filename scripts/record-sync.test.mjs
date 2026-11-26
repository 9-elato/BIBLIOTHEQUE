import test from 'node:test'
import assert from 'node:assert/strict'
import {mergeRecords} from '../src/recordMerge.js'
import {recordStorage,setRecordAccount,recordSnapshot,applySnapshot} from '../src/recordStorage.js'
const obj=(k,v)=>({[k]:JSON.stringify(v)}),read=(r,k)=>JSON.parse(r[k])
test('independent device attendance, letters and gift choices survive merge',()=>{
 const key='cafe-membership-v1'
 const result=mergeRecords(obj(key,{visits:['2026-11-01']}),obj(key,{visits:['2026-11-01','2026-11-02'],giftChoice:'keyring'}),obj(key,{visits:['2026-11-01','2026-11-03']}))
 assert.deepEqual(read(result,key),{visits:['2026-11-01','2026-11-02','2026-11-03'],giftChoice:'keyring'})
 const letters='mll-future-letters-v1'
 assert.equal(read(mergeRecords({},obj(letters,[{id:'a',body:'first'}]),obj(letters,[{id:'b',body:'second'}])),letters).length,2)
})
test('reading time merges device deltas without double counting retry or in-flight reading',()=>{
 const k='mll-reading-seconds-v1',base=obj(k,{a:100}),local=obj(k,{a:120}),remote=obj(k,{a:130})
 const merged=mergeRecords(base,local,remote);assert.equal(read(merged,k).a,150)
 assert.equal(read(mergeRecords(merged,merged,merged),k).a,150)
 assert.equal(read(mergeRecords(local,obj(k,{a:122}),merged),k).a,152)
})
test('unmodified remote fields win, changed local fields survive and deletions remain deleted',()=>{
 const k='mll-book-cafe',b=obj(k,{title:'A',menu:'old',goods:'old'}),l=obj(k,{title:'A',menu:'new'}),r=obj(k,{title:'B',menu:'old',goods:'old'})
 assert.deepEqual(read(mergeRecords(b,l,r),k),{title:'B',menu:'new'})
})
test('account stores never read guest data or another account records',()=>{
 const map=new Map([['mll-world-note','guest private']]);globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};globalThis.window={dispatchEvent(){}}
 setRecordAccount('A');assert.equal(recordStorage.getItem('mll-world-note'),null);recordStorage.setItem('mll-world-note','A private')
 setRecordAccount('B');assert.equal(recordStorage.getItem('mll-world-note'),null);applySnapshot({'mll-world-note':'B private','evil-key':'not copied'});assert.equal(recordSnapshot()['mll-world-note'],'B private');assert.equal(map.has('evil-key'),false)
 setRecordAccount('A');assert.equal(recordStorage.getItem('mll-world-note'),'A private');setRecordAccount('');assert.equal(recordStorage.getItem('mll-world-note'),'guest private')
})
