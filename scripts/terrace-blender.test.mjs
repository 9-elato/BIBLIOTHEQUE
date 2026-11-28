import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {Vector3} from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {TERRACE_MODEL_SOLIDS} from '../src/terraceFurnitureBounds.js'
import {atticX} from '../src/atticLayout.js'
import {movePlayer,walkHeight,ATTIC_HEIGHT as level,FURNITURE} from '../src/navigation.js'
const world={end:45,gateReady:true,entranceOpen:true}
test('Blender terrace vertices are covered by exported collision footprints',async()=>{
 const b=await readFile(new URL('../public/models/terrace_furniture.glb',import.meta.url))
 const {scene}=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')
 scene.updateMatrixWorld(true);const v=new Vector3();let count=0
 scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);const x=v.x-15.6,z=v.z
   assert.ok(TERRACE_MODEL_SOLIDS.some(({rect:[l,r,b,f]})=>x>=l-.002&&x<=r+.002&&z>=b-.002&&z<=f+.002),`${o.name}: ${x},${z}`);count++
  }
 });assert.ok(count>1000)
})
test('terrace rails stop long steps and central passage stays clear',()=>{
 const p={x:atticX(-14),z:9,level}
 const stopped=movePlayer(p,0,20,world)
 assert.ok(stopped.z<10.6)
 for(const x of [-17,-15,-12.8])for(const z of [6.4,6.6,7,8])assert.equal(walkHeight(atticX(x),z,level,world),level)
 assert.ok(!FURNITURE.some(o=>o.id==='telescope'))
})
