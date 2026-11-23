import test from 'node:test'
import assert from 'node:assert/strict'
import {STAIRS,stairPoint,movePlayer,walkHeight,FURNITURE,GALLERY_HEIGHT,ATTIC_HEIGHT} from '../src/navigation.js'
import {STUDY_EXIT} from '../src/eastMeadowLayout.js'

test('east meadow exits work both ways and respect the secret passage lock',()=>{
 const world={end:45,gateReady:true,entranceOpen:true}
 const paths=[
  [[world.end+6,0],[world.end+10,0]],
  [[4,STUDY_EXIT.z],[9,STUDY_EXIT.z]],
 ]
 for(const [a,b] of paths)for(const [[x,z],[tx,tz]] of [[a,b],[b,a]]){
  const result=movePlayer({x,z,level:0},tx-x,tz-z,world)
  assert.ok(Math.hypot(result.x-tx,result.z-tz)<.01)
 }
 assert.equal(walkHeight(15,-5.85,0,world),null)
 assert.equal(walkHeight(STUDY_EXIT.x,STUDY_EXIT.z,0,{...world,gateReady:false}),null)
})
const world={end:45,entranceOpen:true,gateReady:true}
test('entrance supports a continuous round trip and a closed door blocks passage',()=>{
 let p={x:0,z:23,level:0}
 p=movePlayer(p,0,-17,world);assert.ok(Math.abs(p.z-6)<.01)
 p=movePlayer(p,0,17,world);assert.ok(Math.abs(p.z-23)<.01)
 const closed=movePlayer({x:0,z:13,level:0},0,-5,{...world,entranceOpen:false})
 assert.ok(closed.z>=12.25)
 assert.equal(walkHeight(.9,11,0,world),null)
})
test('garden loop connects both sides of the path without trapping the player',()=>{
 let p={x:0,z:23,level:0}
 for(const [x,z] of [[0,30],[8,30],[8,22],[4,22],[4,16.5],[0,16.5],[-3.5,16.5],[-3.5,22],[-8,22],[-8,30],[0,30],[0,23]]){
  p=movePlayer(p,x-p.x,z-p.z,world)
  assert.ok(Math.abs(p.x-x)<.01&&Math.abs(p.z-z)<.01,`garden route blocked at ${x},${z}`)
 }
 for(const obstacle of FURNITURE.filter(s=>s.id.startsWith('garden-'))){
  const [l,r,b,f]=obstacle.rect,x=(l+r)/2,z=(b+f)/2
  assert.equal(walkHeight(x,z,0,world),null,obstacle.id)
  let q=movePlayer({x:l-1,z,level:0},r-l+2,0,world)
  assert.ok(q.x<l,obstacle.id+' blocks entry')
  q=movePlayer(q,-1,0,world);assert.ok(q.x<l-.5,'can retreat')
 }
})
test('lounge arch connects both directions under the high stair, while low treads stay solid',()=>{
 const entered=movePlayer({x:-8.8,z:0,level:0},4.1,0,world)
 assert.ok(Math.abs(entered.x+4.7)<.01);assert.equal(entered.level,0)
 const returned=movePlayer(entered,-4.1,0,world)
 assert.ok(Math.abs(returned.x+8.8)<.01);assert.equal(returned.level,0)
 assert.equal(walkHeight(-6.35,3,0,world),null)
 assert.equal(walkHeight(-6.35,0,0,world),0)
})
test('central table detour connects to the genre aisle and north corridor',()=>{
 let p={x:0,z:5.5,level:0}
 for(const [x,z] of [[3,5.5],[3,0],[44,0],[3,0],[3,-4],[0,-4],[0,-12]]){
  p=movePlayer(p,x-p.x,z-p.z,world)
  assert.ok(Math.abs(p.x-x)<.01&&Math.abs(p.z-z)<.01,`blocked before ${x},${z}`)
  assert.equal(p.level,0)
 }
})
for(const stair of STAIRS)for(const reverse of [false,true])test(`${stair.id}: continuous ${reverse?'descent':'ascent'} including both landings`,()=>{
  const direction=reverse?-1:1
  const start=stairPoint(stair,reverse?1.02:-.02)
  let p={x:start[0],z:start[2],level:reverse?stair.to[1]:stair.from[1]}
  const length=Math.hypot(stair.to[0]-stair.from[0],stair.to[2]-stair.from[2])
  const dx=(stair.to[0]-stair.from[0])/length*.04*direction,dz=(stair.to[2]-stair.from[2])/length*.04*direction
  for(let i=0;i<Math.ceil(length*1.04/.04);i++){
    const next=movePlayer(p,dx,dz,world)
    assert.ok(Math.abs(next.level-p.level)<.04,'height must change smoothly')
    assert.ok(Math.abs(next.x-p.x)+Math.abs(next.z-p.z)>.001,'must not get stuck')
    p=next
  }
  assert.ok(Math.abs(p.level-(reverse?stair.from[1]:stair.to[1]))<.03)
})
test('cannot step sideways off a stair or walk across atrium',()=>{
  for(const stair of STAIRS){
    const center=stairPoint(stair,.5),p={x:center[0],level:center[1],z:center[2]}
    const side=stairPoint(stair,.5,2)
    const q=movePlayer(p,side[0]-p.x,side[2]-p.z,world)
    assert.ok(Math.hypot(q.x-p.x,q.z-p.z)<stair.width/2)
  }
  assert.equal(walkHeight(0,0,GALLERY_HEIGHT,world),null)
  assert.equal(walkHeight(0,0,ATTIC_HEIGHT,world),null)
})
test('all registered furniture blocks its own floor',()=>{
  for(const {floor,rect:[l,r,b,f],id} of FURNITURE)
    assert.equal(walkHeight((l+r)/2,(b+f)/2,floor,world),null,id)
})
test('large frame steps cannot tunnel through a wall or furniture',()=>{
  const p=movePlayer({x:0,z:4,level:0},0,-5,world)
  assert.ok(p.z>3.05)
  const q=movePlayer({x:8.2,z:0,level:GALLERY_HEIGHT},10,0,world)
  assert.ok(q.x<8.9)
})
test('attic doorway connects but closed wall sections do not',()=>{
  assert.equal(walkHeight(-11.5,5.65,ATTIC_HEIGHT,world),ATTIC_HEIGHT)
  assert.equal(walkHeight(-11.4,0,ATTIC_HEIGHT,world),null)
})
