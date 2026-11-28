import test from 'node:test'
import assert from 'node:assert/strict'
import {CAFE_SOLIDS} from '../src/cafeLayout.js'
import {cafeX,cafeZ} from '../src/cafeExpansion.js'
import {walkHeight,movePlayer} from '../src/navigation.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('cafe furniture footprints reject walking through their centres',()=>{
 for(const {id,rect:[l,r,b,f]} of CAFE_SOLIDS) assert.equal(walkHeight((l+r)/2,(b+f)/2,0,world),null,id)
})
test('entrance remains continuous from garden through threshold into cafe',()=>{
 for(let x=-12;x>=-20;x-=.1) assert.equal(walkHeight(cafeX(x),cafeZ(22.25),0,world),0,`entrance ${x}`)
})
test('large movement cannot tunnel through the coffee counter',()=>{
 const start={x:cafeX(-21),z:cafeZ(19.85),level:0}
 const end=movePlayer(start,5,0,world)
 assert.ok(end.x<cafeX(-20.05))
})
