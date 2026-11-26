import test from 'node:test'
import assert from 'node:assert/strict'
import {koreaDate,nextYear,postLetter,readLetters,LETTER_KEY} from '../src/futureLetters.js'
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}}
test('slow mail uses Korean calendar and clamps leap day to February end',()=>{
 assert.equal(koreaDate(new Date('2026-11-25T15:01:00Z')),'2026-11-26')
 assert.equal(nextYear('2028-02-29'),'2029-02-28')
 assert.equal(nextYear('2026-12-31'),'2027-12-31')
})
test('letters persist without overwriting earlier envelopes',()=>{
 const storage=memory(),date=new Date('2026-11-25T15:01:00Z')
 const first=postLetter(storage,{title:'오늘',body:'기억하고 싶은 문장'},date,'a')
 assert.equal(first.openOn,'2027-11-26')
 postLetter(storage,{title:'',body:'두 번째 편지'},date,'b')
 assert.equal(readLetters(storage).length,2)
 assert.equal(readLetters(storage)[0].body,'기억하고 싶은 문장')
 assert.throws(()=>postLetter(storage,{title:'',body:'   '},date,'c'))
 assert.equal(readLetters(storage).length,2)
})
test('corrupt storage and quota failures cannot silently replace letters',()=>{
 const storage=memory();storage.setItem(LETTER_KEY,'broken')
 assert.throws(()=>postLetter(storage,{title:'',body:'new'},new Date(),'a'))
 assert.equal(storage.getItem(LETTER_KEY),'broken')
 const full={getItem:()=>null,setItem:()=>{throw new Error('quota')}}
 assert.throws(()=>postLetter(full,{title:'',body:'new'},new Date(),'a'),/quota/)
})
