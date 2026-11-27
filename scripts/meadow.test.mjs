import {collectCameraObstacles} from '../src/cameraOcclusion.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import {meadowHeight,meadowRest,inMeadow} from '../src/meadowLayout.js'
import {movePlayer,walkHeight} from '../src/navigation.js'
import {startSitting,advanceSeating,startStanding} from '../src/seating.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('meadow shares a continuous height with the garden and supports round trips over hills',()=>{
 assert.equal(meadowHeight(0,32),0)
 let p={x:0,z:30,level:0,yaw:0}
 for(const [x,z] of [[0,50],[35,80],[-35,100],[0,100],[0,33],[0,30]]){
 p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.01,JSON.stringify(p));assert.ok(Math.abs(p.level-meadowHeight(x,z))<.001)
 }
 assert.equal(walkHeight(49,80,meadowHeight(49,80),world),null)
 assert.equal(inMeadow(0,113),false)
})
test('lying on the hillside and standing restores a safe supported position',()=>{
 const p={x:8,z:65,level:meadowHeight(8,65),yaw:0,bodyYaw:0}
 const action=interactionAt(p,{world});assert.equal(action.type,'seat');assert.equal(action.seat.id,'meadow-rest')
 let s=startSitting(p,meadowRest(p)),result
 for(let i=0;i<100;i++){result=advanceSeating(s,.05);s=result.seating}
 assert.equal(s.phase,'seated');assert.ok(s.recline>1.55);assert.ok(result.pose.y>p.level+.5)
 s=startStanding(s,world)
 for(let i=0;i<65&&s;i++){result=advanceSeating(s,.05);s=result.seating}
 assert.equal(s,null);assert.ok(Math.abs(result.pose.y-p.level)<1e-8)
 assert.notEqual(walkHeight(result.pose.x,result.pose.z,p.level,world),null)
 assert.equal(meadowRest({x:0,z:20}),null)
})

test('grass and sky do not enter expensive camera collision checks',()=>{
 const mesh=(data={})=>({visible:true,isMesh:true,userData:data,material:{},children:[]})
 const ground=mesh(),grass=mesh({noCameraCollision:true}),sky=mesh({noCameraCollision:true})
 assert.deepEqual(collectCameraObstacles({visible:true,children:[ground,grass,sky]}),[ground])
})
