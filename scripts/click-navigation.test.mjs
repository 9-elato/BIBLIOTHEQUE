import test from 'node:test'
import assert from 'node:assert/strict'
import {findClickPath,clearClickSegment,enteringCafe} from '../src/clickNavigation.js'
import {walkHeight} from '../src/navigation.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('click walking reaches cafe through the real entrance and avoids furniture',()=>{
 const start={x:-11,z:22.25,level:0},goal={x:-20.8,z:25.5,level:0},path=findClickPath(start,goal,world)
 assert.ok(path);let previous=start;for(const point of path){assert.ok(clearClickSegment(previous,point,world));previous=point}assert.equal(previous,goal)
})
test('click walking rejects solid furniture, other floors and distant clicks',()=>{
 const start={x:-20.8,z:22.25,level:0}
 assert.equal(findClickPath(start,{x:-18,z:18,level:0},world),null)
 assert.equal(findClickPath(start,{x:-20.8,z:22.25,level:7.2},world),null)
 assert.equal(findClickPath(start,{x:90,z:90,level:0},world),null)
})
test('terrace is usable, glass is solid and benches cannot be crossed',()=>{
 assert.equal(walkHeight(-13.5,18,0,world),0)
 assert.equal(walkHeight(-16,18,0,world),null)
 assert.equal(walkHeight(-16,27,0,world),null)
 assert.equal(walkHeight(-14.9,17.2,0,world),null)
 assert.equal(walkHeight(-16,22.25,0,world),0)
})
test('ghost bell rings only while entering the doorway at ground level',()=>{
 assert.equal(enteringCafe({x:-15.9},{x:-16.1,z:22.25,level:0}),true)
 assert.equal(enteringCafe({x:-16.1},{x:-15.9,z:22.25,level:0}),false)
 assert.equal(enteringCafe({x:-15.9},{x:-16.1,z:18,level:0}),false)
})
