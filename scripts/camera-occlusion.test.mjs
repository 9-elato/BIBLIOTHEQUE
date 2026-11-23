import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {collectCameraObstacles} from '../src/cameraOcclusion.js'

test('camera obstacles exclude hidden rooms, avatar and transparent glass',()=>{
  const scene=new THREE.Scene()
  const wall=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial())
  const hidden=new THREE.Group();hidden.visible=false;hidden.add(wall.clone())
  const avatar=new THREE.Group();avatar.userData.player=true;avatar.add(wall.clone())
  const glass=new THREE.Mesh(wall.geometry,new THREE.MeshBasicMaterial({transparent:true}))
  scene.add(wall,hidden,avatar,glass)
  const reused=[glass]
  assert.equal(collectCameraObstacles(scene,reused),reused)
  assert.deepEqual(reused,[wall])
  hidden.visible=true
  assert.deepEqual(collectCameraObstacles(scene,reused),[wall,hidden.children[0]])
})

test('camera bounds reject empty box corners before triangle tests and refresh changed positions',()=>{
 const scene=new THREE.Scene(),geometry=new THREE.BoxGeometry(.1,8,.1)
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());scene.add(mesh);scene.updateMatrixWorld(true)
 const ray=new THREE.Raycaster(new THREE.Vector3(2,0,3),new THREE.Vector3(0,0,-1))
 let triangles=0
 // Mesh uses a local scratch Ray, so instrument the shared prototype briefly.
 const proto=THREE.Ray.prototype,intersect=proto.intersectTriangle
 proto.intersectTriangle=function(...args){triangles++;return intersect.apply(this,args)}
 try{
  assert.equal(ray.intersectObject(mesh).length,0);assert.ok(triangles>0)
  triangles=0;collectCameraObstacles(scene)
  assert.equal(ray.intersectObject(mesh).length,0);assert.equal(triangles,0)
  const box=geometry.boundingBox;let recomputes=0;const compute=geometry.computeBoundingBox.bind(geometry)
  geometry.computeBoundingBox=()=>{recomputes++;compute()}
  collectCameraObstacles(scene);assert.equal(recomputes,0);assert.equal(geometry.boundingBox,box)
  const p=geometry.attributes.position
  for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)+2)
  p.needsUpdate=true
  collectCameraObstacles(scene);assert.equal(recomputes,1)
  assert.ok(ray.intersectObject(mesh).length>0,'changed geometry remains hittable')
 }finally{proto.intersectTriangle=intersect;geometry.dispose();mesh.material.dispose()}
})

test('camera bounds leave skinned, instanced and morph targets to their own raycasters',()=>{
 for(const kind of ['skin','instance','morph']){
  const g=new THREE.BoxGeometry(),m=new THREE.MeshBasicMaterial()
  const mesh=kind==='skin'?new THREE.SkinnedMesh(g,m):kind==='instance'?new THREE.InstancedMesh(g,m,1):new THREE.Mesh(g,m)
  if(kind==='morph')g.morphAttributes.position=[g.attributes.position.clone()]
  collectCameraObstacles(mesh);assert.equal(g.boundingBox,null)
  g.dispose();m.dispose()
 }
})

test('bounds preserve every production bookcase camera hit across a grid of viewing rays',async()=>{
 const {bookcaseComponents,mountBookcase,THREE:T}=await import('./bookcase-harness.mjs')
 const {GENRES}=await import('../src/layout.js')
 const components=await bookcaseComponents();let mounted
 try{
  mounted=await mountBookcase(components.after,{item:{x:15.1,z:-4.9,number:1,books:Array.from({length:24},(_,i)=>({id:'b'+i,title:'Book',pages:240}))},genre:GENRES[0],onPick(){},onGenre(){}})
  const objects=[]
  function visit(n){if(!n.visible||n.userData?.player||n.userData?.noCameraCollision)return;if(n.isMesh&&!n.material?.transparent)objects.push(n);for(const child of n.children)visit(child)}
  visit(mounted.scene)
  const rays=[]
  for(let x=12;x<=18;x+=.15)for(let y=.4;y<=5;y+=.3)rays.push(new T.Raycaster(new T.Vector3(x,y,0),new T.Vector3(.1,.3,-1).normalize(),.12,6.15))
  const hits=()=>rays.map(r=>r.intersectObjects(objects,false).map(h=>[h.object.uuid,h.distance,h.faceIndex]))
  const before=hits()
  assert.deepEqual(collectCameraObstacles(mounted.scene),objects)
  assert.deepEqual(hits(),before)
 }finally{if(mounted)await mounted.dispose();await components.dispose()}
})
