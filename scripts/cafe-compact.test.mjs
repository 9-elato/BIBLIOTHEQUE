import test from 'node:test'
import assert from 'node:assert/strict'
import {CAFE_SCALE,CINEMA_CHAIRS,cafeX,cafeZ,cinemaZ,cinemaGround,cinemaCurtain} from '../src/cafeExpansion.js'
import {STAIRS,stairPoint,walkHeight,movePlayer} from '../src/navigation.js'
import {findClickPath,clearClickSegment} from '../src/clickNavigation.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('compact cinema retains two front seats and three elevated rear seats',()=>{
 assert.equal(CAFE_SCALE,2.2/1.5/Math.sqrt(2))
 const front=CINEMA_CHAIRS.filter(s=>s.level===0),rear=CINEMA_CHAIRS.filter(s=>s.level===.36)
 assert.equal(front.length,2);assert.equal(rear.length,3)
 assert.ok(front.every(a=>rear.every(b=>a.z>b.z)))
 assert.ok((cinemaZ(39)-cinemaZ(32))*CAFE_SCALE/(7*2.2)<.5)
})
test('rear riser can be walked up and down without jumping or passing through seats',()=>{
 cinemaCurtain.clear=true
 try{
 let p={x:cafeX(-31),z:cafeZ(cinemaZ(39.5)),level:0}
 p.level=cinemaGround(p.x,p.z);const initialLevel=p.level
 for(const end of [44.9,39.5]){
 const z=cafeZ(cinemaZ(end)),start=p.z
 for(let i=1;i<=200;i++){
 const target=start+(z-start)*i/200,q=movePlayer(p,0,target-p.z,world)
 assert.ok(Math.abs(q.z-target)<.001)
 assert.ok(Math.abs(q.level-p.level)<.03)
 assert.equal(walkHeight(q.x,q.z,q.level,world),q.level)
 p=q
 }
 }
 assert.ok(Math.abs(p.level-initialLevel)<1e-9)
 assert.equal(cinemaGround(cafeX(-31),cafeZ(cinemaZ(42))),.36)
 }finally{cinemaCurtain.clear=false}
})
test('click routes follow all five stairways in both directions',()=>{
 for(const stair of STAIRS){
 const point=t=>{const [x,level,z]=stairPoint(stair,t);return {x,level,z}}
 for(const [a,b] of [[.01,.99],[.99,.01]]){
 const start=point(a),goal=point(b),path=findClickPath(start,goal,world)
 assert.ok(path,stair.id)
 let previous=start
 for(const next of path){assert.ok(clearClickSegment(previous,next,world),stair.id);previous=next}
 }
 }
})
