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
