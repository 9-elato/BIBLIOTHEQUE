import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {HALL_ARCH,archInfillPoints,archBlocks,SECRET_BOOKCASE_TOP,CORRIDOR_TOP} from '../src/groundArchitecture.js'
import {walkHeight,movePlayer} from '../src/navigation.js'
const world={end:45,entranceOpen:true,gateReady:true}
test('arched wall fills the upper opening but leaves the curved passage clear',()=>{
 const shape=new THREE.Shape(archInfillPoints().map(([x,y])=>new THREE.Vector2(x,y)))
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:false}),material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(geometry,material)
 mesh.updateMatrixWorld();const ray=new THREE.Raycaster()
 const hits=(x,y)=>{ray.set(new THREE.Vector3(x,y,2),new THREE.Vector3(0,0,-1));return ray.intersectObject(mesh).length>0}
 assert.equal(hits(0,6.5),true);assert.equal(hits(1.8,5.5),true)
 assert.equal(hits(0,4),false);assert.equal(hits(1.4,4),false)
 assert.ok(SECRET_BOOKCASE_TOP>5);assert.ok(SECRET_BOOKCASE_TOP<CORRIDOR_TOP)
 geometry.dispose();material.dispose()
})
test('four hall archways allow centred round trips and block jamb penetration',()=>{
 for(const [x,z,dx,dz] of [[6.7,0,1.6,0],[-6.7,0,-1.6,0],[0,6.5,0,1.5],[0,-6,0,-1.6]]){
 let p={x,z,level:0};p=movePlayer(p,dx,dz,world);assert.ok(Math.hypot(p.x-x-dx,p.z-z-dz)<.01);p=movePlayer(p,-dx,-dz,world);assert.ok(Math.hypot(p.x-x,p.z-z)<.01)
 }
 for(const [x,z] of [[7.5,1.9],[-7.5,-1.9],[1.9,-6.82],[-1.9,7.25]]){assert.ok(archBlocks(x,z));assert.equal(walkHeight(x,z,0,world),null)}
 assert.ok(HALL_ARCH.playerClear+.22+HALL_ARCH.jambWidth/2<HALL_ARCH.halfWidth)
})
test('entry console and coat stand block the body without obstructing the entrance route',()=>{
 for(const [x,z] of [[-2.3,9.55],[2.2,10]])assert.equal(walkHeight(x,z,0,world),null)
 let p={x:0,z:13,level:0};p=movePlayer(p,0,-6.5,world);assert.ok(Math.abs(p.z-6.5)<.01)
})
