import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {CAFE_FLOOR_TILES,CAFE_GARDEN_TREES,CAFE_GARDEN_BOUNDS,cafeGardenHeight} from '../src/cafeGroundLayout.js'
import {cafeX} from '../src/cafeExpansion.js'
test('cafe entrance floor tiles meet without overlapping surfaces',()=>{
 for(let i=0;i<CAFE_FLOOR_TILES.length;i++)for(let j=i+1;j<CAFE_FLOOR_TILES.length;j++){
  const a=CAFE_FLOOR_TILES[i].rect,b=CAFE_FLOOR_TILES[j].rect
  assert.ok(Math.min(a[1],b[1])<=Math.max(a[0],b[0])||Math.min(a[3],b[3])<=Math.max(a[2],b[2]))
 }
 for(let x=-33.9;x< -12;x+=.05)assert.equal(CAFE_FLOOR_TILES.filter(({rect:r})=>x>=r[0]&&x<r[1]&&22.25>=r[2]&&22.25<r[3]).length,1)
})
test('window planting is rooted in the ground outside the cafe wall',()=>{
 assert.ok(CAFE_GARDEN_BOUNDS[1]<cafeX(-34)-.3)
 for(const [x,y,z] of CAFE_GARDEN_TREES)assert.equal(y,cafeGardenHeight(x,z))
 for(const z of [13.5,20,32])assert.ok(Math.abs(cafeGardenHeight(-38,z))<.04)
})
test('Blender furniture contains tailored details within a modest rendering budget',()=>{
 const b=readFileSync(new URL('../public/models/reading_nook.glb',import.meta.url))
 assert.equal(b.toString('ascii',0,4),'glTF')
 const j=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)))
 assert.equal(j.meshes.length,5)
 assert.ok(j.materials.some(m=>m.name==='Sewn piping'))
 const triangles=j.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+j.accessors[p.indices].count/3,0)
 assert.ok(triangles<40000,`${triangles} triangles`)
})
