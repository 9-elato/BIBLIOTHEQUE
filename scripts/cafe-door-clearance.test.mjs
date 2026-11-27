import test from 'node:test'
import assert from 'node:assert/strict'
import {movePlayer as moveWorld,walkHeight as heightWorld,PLAYER_RADIUS} from '../src/navigation.js'
import {cafeX,cafeZ,cafeLocal} from '../src/cafeExpansion.js'
const walkHeight=(x,z,y,w)=>heightWorld(cafeX(x),cafeZ(z),y,w)
const movePlayer=(p,dx,dz,w)=>{const q=moveWorld({...p,x:cafeX(p.x),z:cafeZ(p.z)},dx*2.2,dz*2.2,w);const [x,z]=cafeLocal(q.x,q.z);return {...q,x,z}}
const world={end:45,gateReady:true,entranceOpen:true}

test('cafe entrance keeps the whole avatar clear of both door jambs',()=>{
 for(const z of [21.05,21.15,23.4]){
  assert.equal(walkHeight(-16,z,0,world),null,`radius overlaps the doorway at z=${z}`)
  const q=movePlayer({x:-17,z,level:0},2,0,world)
  assert.ok(q.x<=-16.4,'cannot cross the jamb along the wall edge')
 }
 for(const z of [21.25,22.25,23.25]){
  assert.equal(walkHeight(-16,z,0,world),0)
  for(const [x,dx] of [[-17,2],[-15,-2]]){
   const q=movePlayer({x,z,level:0},dx,0,world)
   assert.ok(Math.abs(q.x-(x+dx))<1e-9,'doorway remains passable in both directions')
  }
 }
})

test('diagonal movement slides away from cafe jamb and resumes through the opening',()=>{
 let p={x:-17,z:21.1,level:0}
 p=movePlayer(p,2,1,world)
 assert.ok(p.x>-16,'player reaches doorway by sliding alongside the blocked jamb')
 assert.ok(p.z-PLAYER_RADIUS>21,'body is inside the path when crossing')
 assert.equal(walkHeight(p.x,p.z,p.level,world),0)
})
