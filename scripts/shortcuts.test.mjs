import test from 'node:test'
import assert from 'node:assert/strict'
import {SHORTCUTS,shortcutAllowed,shortcutAction} from '../src/shortcuts.js'
test('interaction shortcut codes are unique and repeat-safe',()=>{
 assert.equal(new Set(Object.values(SHORTCUTS)).size,Object.keys(SHORTCUTS).length)
 for(const [code,action] of Object.entries(SHORTCUTS)){
  assert.equal(shortcutAction({code}),action)
  assert.equal(shortcutAction({code,repeat:true}),null)
 }
 assert.equal(shortcutAction({code:'KeyZ'}),null)
})
test('typing, IME composition and browser modifier keys never trigger world shortcuts',()=>{
 for(const prop of ['isComposing','ctrlKey','metaKey','altKey','defaultPrevented'])assert.equal(shortcutAction({code:'KeyE',[prop]:true}),null)
 assert.equal(shortcutAction({code:'KeyE',target:{closest:()=>({})}}),null)
 assert.equal(shortcutAction({code:'KeyE',key:'ㄷ'}),'interact')
 assert.equal(shortcutAllowed({code:'KeyW',target:{closest:()=>null}}),true)
})
