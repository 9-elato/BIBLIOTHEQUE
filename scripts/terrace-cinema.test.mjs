import test from 'node:test'
import assert from 'node:assert/strict'
import {walkHeight,movePlayer,ATTIC_HEIGHT as level} from '../src/navigation.js'
import {atticX} from '../src/atticLayout.js'
import {youtubeVideoId} from '../src/cinemaLink.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('terrace doorway connects both ways, leaving other rear walls and rail edges closed',()=>{
 let p={x:atticX(-12.8),z:5.6,level};p=movePlayer(p,0,2.6,world);assert.ok(Math.abs(p.z-8.2)<.01);p=movePlayer(p,0,-2.6,world);assert.ok(Math.abs(p.z-5.6)<.01)
 for(const [x,z] of [[-15,6.6],[-12,11],[-20,9]])assert.equal(walkHeight(atticX(x),z,level,world),null)
 assert.equal(walkHeight(atticX(-16.8),9.3,level,world),null)
 assert.equal(interactionAt({x:atticX(-15.7),z:9.3,level},{world}).type,'telescope')
})
test('cinema accepts only YouTube video URLs and rejects arbitrary iframe sources',()=>{
 for(const s of ['https://youtu.be/abcdefghijk?t=10','https://www.youtube.com/watch?v=abcdefghijk','https://youtube.com/shorts/abcdefghijk'])assert.equal(youtubeVideoId(s),'abcdefghijk')
 for(const s of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=abcdefghijk','https://example.com/abcdefghijk','https://youtube.com/playlist?list=foo','garbage'])assert.equal(youtubeVideoId(s),null)
})
