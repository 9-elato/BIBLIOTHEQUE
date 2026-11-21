import test from 'node:test'
import assert from 'node:assert/strict'
import {movePlayer,walkHeight} from '../src/navigation.js'
import {interactionAt} from '../src/interactions.js'
const world={end:45,gateReady:true,entranceOpen:true,verandaDoor:{open:true,amount:1}}
test('veranda door allows a continuous round trip and closed panel blocks passage',()=>{
 let p={x:-10.2,z:-5.4,level:0}
 for(const [x,z] of [[-10.2,-8.3],[-11.3,-8.3],[-11.3,-12.92],[-12.5,-12.92],[-11.3,-12.92],[-11.3,-8.3],[-16.3,-8.3],[-16.3,-12.92],[-17.5,-12.92],[-16.3,-12.92],[-16.3,-8.3],[-10.2,-8.3],[-10.2,-5.4]]){
 p=movePlayer(p,x-p.x,z-p.z,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.02,`${x},${z}`)
 }
 const closed={...world,verandaDoor:{open:false,amount:0}}
 const blocked=movePlayer({x:-10.2,z:-5.4,level:0},0,-4,closed)
 assert.ok(blocked.z>-6.4)
 assert.equal(walkHeight(-15,-11,0,world),null)
 assert.equal(walkHeight(-15,-14,0,world),null)
 assert.equal(walkHeight(-15,-6.7,0,world),null)
 for(const z of [-5.4,-8])assert.equal(interactionAt({x:-10.2,z,level:0},{world}).type,'verandaDoor')
})
