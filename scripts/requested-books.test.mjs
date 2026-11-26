import test from 'node:test'
import assert from 'node:assert/strict'
import {REQUESTED_BOOKS,missingRequestedBooks,requestedCuration} from '../src/requestedBooks.js'
import {spineSource} from '../src/bookMetadata.js'
test('requested books preserve existing editions and never invent reading history',()=>{
 assert.equal(REQUESTED_BOOKS.length,6)
 assert.ok(REQUESTED_BOOKS.every(b=>b.rating===0&&b.completed===''&&b.notes===''))
 const existing={...REQUESTED_BOOKS[0],id:'already-present',rating:4}
 assert.equal(missingRequestedBooks([existing]).length,5)
 assert.ok(spineSource(REQUESTED_BOOKS[0].spine).endsWith('/book-assets/walser-spine.png'))
 assert.equal(spineSource('bundled:../secret.png'),'')
 const config=requestedCuration({bookIds:['other']},[existing,...REQUESTED_BOOKS.slice(1)])
 assert.ok(config.bookIds.includes('already-present'));assert.ok(config.bookIds.includes('other'))
 assert.equal(requestedCuration(config,[]),config)
})
