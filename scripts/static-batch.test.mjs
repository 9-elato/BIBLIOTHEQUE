import test from 'node:test'
import assert from 'node:assert/strict'
import {BoxGeometry,InstancedBufferGeometry,Group,Mesh,MeshStandardMaterial,Raycaster,Vector3} from 'three'
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

test('custom instanced geometry is never flattened or stripped of shader attributes',()=>{
 const root=new Group(),g=new InstancedBufferGeometry().copy(new BoxGeometry())
 g.instanceCount=7
 const a=new Mesh(g,new MeshStandardMaterial()),b=new Mesh(g,new MeshStandardMaterial());root.add(a,b)
 const batch=batchStaticMeshes(root)
 assert.equal(batch.sourceCount,0);assert.equal(a.visible,true);assert.equal(g.instanceCount,7)
 batch.dispose()
})
test('batched plant geometry follows its animated parent without changing local surfaces',()=>{
 const wind=new Group(),root=new Group();wind.add(root)
 for(let i=0;i<8;i++){const leaf=new Mesh(new BoxGeometry(.1,.5,.01),new MeshStandardMaterial());leaf.position.x=i*.1;root.add(leaf)}
 const batch=batchStaticMeshes(root),merged=root.children.find(m=>m.name==='Static decoration batch')
 assert.equal(batch.batchCount,1)
 wind.rotation.y=.2;wind.updateWorldMatrix(true,true)
 assert.equal(merged.matrixWorld.elements[0],Math.cos(.2))
 batch.dispose();assert.equal(root.children.length,8)
})

test('isolated detailed geometry is not copied or de-indexed for an unused batch',()=>{
 const root=new Group(),geometry=new BoxGeometry(),material=new MeshStandardMaterial()
 for(const x of [0,20,40]){const mesh=new Mesh(geometry,material);mesh.position.x=x;root.add(mesh)}
 geometry.toNonIndexed=()=>{throw new Error('unnecessary geometry copy')}
 geometry.clone=()=>{throw new Error('unnecessary geometry copy')}
 const batch=batchStaticMeshes(root)
 assert.equal(batch.sourceCount,0);assert.equal(batch.batchCount,0)
 assert.ok(root.children.every(mesh=>mesh.geometry===geometry&&mesh.visible))
 batch.dispose()
})

test('batch colors multiply vertex colors only when the source material enables them',()=>{
 const root=new Group(),geometry=new BoxGeometry().toNonIndexed()
 const colors=new Float32Array(geometry.attributes.position.count*3).fill(.5)
 geometry.setAttribute('color',new geometry.attributes.position.constructor(colors,3))
 for(const vertexColors of [true,false]){
  const material=new MeshStandardMaterial({vertexColors});material.color.setRGB(.4,.6,.8)
  const mesh=new Mesh(geometry,material);root.add(mesh)
 }
 const batch=batchStaticMeshes(root),merged=root.children.find(m=>m.name==='Static decoration batch')
 assert.equal(batch.sourceCount,2)
 const color=merged.geometry.attributes.color,count=geometry.attributes.position.count
 for(const [i,expected] of [[0,[.2,.3,.4]],[count,[.4,.6,.8]]]){
  const actual=[color.getX(i),color.getY(i),color.getZ(i)]
  actual.forEach((v,j)=>assert.ok(Math.abs(v-expected[j])<1e-6))
 }
 assert.equal(geometry.attributes.color.getX(0),.5)
 batch.dispose()
})
