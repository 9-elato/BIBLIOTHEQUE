import test from 'node:test'
import assert from 'node:assert/strict'
import {Mesh,MeshBasicMaterial,DoubleSide,Raycaster,Vector3} from 'three'
import {createWindowGeometry} from '../src/windowGeometry.js'

test('wide greenhouse windows fill rectangular frame corners without inverted arch geometry',()=>{
 for(const w of [2.0666667,3.2,4.2,7.2]){
  const g=createWindowGeometry(w-.04,3.4,true),mesh=new Mesh(g,new MeshBasicMaterial({side:DoubleSide}))
  mesh.updateMatrixWorld()
  for(const x of [-(w-.06)/2,0,(w-.06)/2])for(const y of [-1.69,0,1.69]){
   const ray=new Raycaster(new Vector3(x,y,1),new Vector3(0,0,-1))
   assert.ok(ray.intersectObject(mesh).length>0,`window ${w} has no missing corner at ${x}/${y}`)
  }
  for(const value of g.attributes.uv.array)assert.ok(value>=-1e-6&&value<=1+1e-6)
  g.dispose();mesh.material.dispose()
 }
})
test('existing arched windows retain the rounded upper corners',()=>{
 const g=createWindowGeometry(2,4),mesh=new Mesh(g,new MeshBasicMaterial({side:DoubleSide}))
 mesh.updateMatrixWorld()
 assert.equal(new Raycaster(new Vector3(.95,1.95,1),new Vector3(0,0,-1)).intersectObject(mesh).length,0)
 assert.ok(new Raycaster(new Vector3(0,1.9,1),new Vector3(0,0,-1)).intersectObject(mesh).length>0)
 g.dispose();mesh.material.dispose()
})

