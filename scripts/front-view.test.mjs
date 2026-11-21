import test from 'node:test'
import assert from 'node:assert/strict'
import {frontViewYaw} from '../src/cameraMovement.js'
test('front view places camera along character facing for arbitrary body rotation',()=>{
 for(const facing of [0,Math.PI/2,-Math.PI/2,Math.PI,7.3]){
  const yaw=frontViewYaw(facing)
  // WalkControl camera offset is (-sin(yaw), cos(yaw)); avatar forward is -Z.
  assert.ok(Math.abs(-Math.sin(yaw)+Math.sin(facing))<1e-10)
  assert.ok(Math.abs(Math.cos(yaw)+Math.cos(facing))<1e-10)
 }
})
