import test from 'node:test'
import assert from 'node:assert/strict'
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,Raycaster,Vector3} from 'three'
import {batchStaticMeshes} from '../src/staticMeshBatch.js'

test('batch preserves transformed surfaces, per-object colors and camera collision',()=>{
 const root=new Group();root.scale.set(1,1.35,1)
 const source=[]
 for(let i=0;i<3;i++){
  const mesh=new Mesh(new BoxGeometry(1,1,1),new MeshStandardMaterial({color:i===0?'#ff0000':'#00ff00'}))
  mesh.position.set(i*2,1,0);mesh.castShadow=true;root.add(mesh);source.push(mesh)
 }
 root.updateWorldMatrix(true,true)
 const ray=new Raycaster(new Vector3(0,1.35,5),new Vector3(0,0,-1))
 const before=ray.intersectObjects(source,false)[0].distance
 const batch=batchStaticMeshes(root)
 assert.equal(batch.sourceCount,3);assert.equal(batch.batchCount,1)
 const merged=root.children.find(m=>m.name==='Static decoration batch')
 root.updateWorldMatrix(true,true)
 assert.equal(ray.intersectObject(merged)[0].distance,before)
 assert.equal(merged.geometry.attributes.color.getX(0),1)
 assert.equal(merged.castShadow,true)
 assert.ok(source.every(m=>!m.visible))
 batch.dispose();assert.equal(root.children.length,3);assert.ok(source.every(m=>m.visible))
})
test('transparent decorations and hidden objects are not baked; cells stay separately cullable',()=>{
 const root=new Group(),geometry=new BoxGeometry()
 for(const x of [0,1,20,21]){const mesh=new Mesh(geometry,new MeshStandardMaterial());mesh.position.x=x;root.add(mesh)}
 const glass=new Mesh(geometry,new MeshStandardMaterial({transparent:true,opacity:.3}));root.add(glass)
 const hidden=new Mesh(geometry,new MeshStandardMaterial());hidden.visible=false;root.add(hidden)
 const batch=batchStaticMeshes(root)
 assert.equal(batch.sourceCount,4);assert.equal(batch.batchCount,2)
 assert.equal(glass.visible,true);assert.equal(hidden.visible,false)
 batch.dispose();assert.equal(hidden.visible,false)
})
test('animated and interactive subtrees explicitly opt out of batching',()=>{
 const root=new Group(),animated=new Group();animated.userData.noBatch=true;root.add(animated)
 for(let i=0;i<3;i++)animated.add(new Mesh(new BoxGeometry(),new MeshStandardMaterial()))
 const batch=batchStaticMeshes(root)
 assert.equal(batch.sourceCount,0);assert.ok(animated.children.every(m=>m.visible))
 batch.dispose()
})
