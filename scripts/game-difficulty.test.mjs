import test from 'node:test'
import assert from 'node:assert/strict'
import {HERBS,inversions,shelfPuzzle,adjacentSwap,cipherFeedback} from '../src/miniGames.js'
import {boardResult,playBoard} from '../src/boardGame.js'
import {READING_CLEAR_HEIGHT,eastHallClosure,readingCeilingY,HALL_CEILING} from '../src/upperArchitecture.js'
import {GALLERY_HEIGHT} from '../src/navigation.js'
test('hard puzzles have eight pairs, meaningful shuffles and adjacent-only moves',()=>{
 assert.equal(new Set(HERBS).size,8)
 for(let i=0;i<40;i++){const p=shelfPuzzle();assert.equal(p.length,8);assert.ok(inversions(p)>=8);let moves=0;while(inversions(p)){for(let j=0;j<7;j++)if(p[j]>p[j+1]){const before=inversions(p);const next=adjacentSwap(p,j,j+1);assert.equal(inversions(next),before-1);p.splice(0,p.length,...next);moves++}}assert.ok(moves>=8)}
 const p=[3,2,1];assert.equal(adjacentSwap(p,0,2),p)
 assert.deepEqual(cipherFeedback('8172','1287'),{exact:0,near:4,won:false})
 assert.deepEqual(cipherFeedback('1287','1287'),{exact:4,near:0,won:true})
 assert.ok(cipherFeedback('123','1287').error)
})
test('strong moon player cannot lose against any legal player sequence',()=>{
 const seen=new Set();function visit(board){const key=board.map(x=>x||'-').join();if(seen.has(key))return;seen.add(key);const result=boardResult(board);assert.notEqual(result,'star');if(result)return;for(let i=0;i<9;i++)if(!board[i])visit(playBoard(board,i))}visit(Array(9).fill(null));assert.ok(seen.size>50)
})
test('reading room clear height and east hall wall use one matching ceiling boundary',()=>{
 const wall=eastHallClosure(GALLERY_HEIGHT)
 assert.ok(READING_CLEAR_HEIGHT>=5.5)
 assert.equal(wall.center-wall.height/2,readingCeilingY(GALLERY_HEIGHT))
 assert.equal(wall.center+wall.height/2,HALL_CEILING)
 assert.ok(wall.height>0)
})
