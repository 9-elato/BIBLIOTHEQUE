import test from 'node:test'
import assert from 'node:assert/strict'
import {GROUND_BACKING,SEABED_BACKING,SUNKEN_GARDEN} from '../src/terrainContinuityLayout.js'
import {replaceAtticEndWall} from '../src/atticLayout.js'
const inside=(x,z,[l,r,b,f])=>x>l&&x<r&&z>b&&z<f
test('ground backing seals garden and meadow seams without sealing lower rooms or stairs',()=>{
 for(const [x,z] of [[0,11.5],[0,9],[35,-10],[70,12],[-20,20],[4,-20]])assert.ok(GROUND_BACKING.some(r=>inside(x,z,r)))
 for(const [x,z] of [[8,-4.8],[4,-4.8],[16,12],[22,25]])assert.ok(!GROUND_BACKING.some(r=>inside(x,z,r)))
 for(const r of GROUND_BACKING){assert.ok(r[1]>r[0]&&r[3]>r[2]);assert.ok(!inside((r[0]+r[1])/2,(r[2]+r[3])/2,SUNKEN_GARDEN))}
})
test('continuous distant sea extends beyond camera range on all sides',()=>{
 const {position:[x,y,z],size:[w,d]}=SEABED_BACKING
 assert.ok(y<-7);for(const p of [[-180,-150],[170,-150],[-180,120],[170,120]])assert.ok(inside(...p,[x-w/2,x+w/2,z-d/2,z+d/2]))
})
test('both old gables and terrace window trim are replaced while front walls remain',()=>{
 for(const name of ['GABLE · end triangular infill 6.64','GABLE · end triangular infill -6.64','WINDOW · rear stone sill','WINDOW · vertical mullion'])assert.ok(replaceAtticEndWall(name,0))
 assert.equal(replaceAtticEndWall('WALL · end low plinth',-6.64),false)
})


test('veranda inlet has no ground backing in its sea sightline',()=>{
 for(const z of [-16,-20,-26,-33])assert.ok(!GROUND_BACKING.some(r=>inside(-14.7,z,r)))
 assert.ok(GROUND_BACKING.some(r=>inside(-14.7,-12,r)))
})
