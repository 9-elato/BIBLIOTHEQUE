import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {ATTIC_MOBILE,ATTIC_EAVE,ATTIC_RIDGE,ATTIC_HALF_WIDTH,ATTIC_SCREEN,ATTIC_SCREEN_SLOPE,ATTIC_SCREEN_TARGET,atticRoofY,replaceAtticEndWall,atticArchitecture,atticX} from '../src/atticLayout.js'
test('attic gables share raised roof height and screen stays below both roof slopes',()=>{
 assert.equal(atticRoofY(0),ATTIC_RIDGE)
 assert.ok(Math.abs(atticRoofY(ATTIC_HALF_WIDTH)-ATTIC_EAVE)<1e-9)
 assert.ok(ATTIC_EAVE>5)
 const norm=Math.hypot(1,ATTIC_SCREEN_SLOPE)
 for(const sign of [-1,1]){const x=ATTIC_SCREEN[0]-sign*1.35/norm,y=ATTIC_SCREEN[1]+sign*1.35*ATTIC_SCREEN_SLOPE/norm;assert.ok(y+.1<atticRoofY(x))}
 assert.deepEqual(ATTIC_SCREEN_TARGET,[atticX(-15.6+ATTIC_SCREEN[0]),10.6+ATTIC_SCREEN[1],ATTIC_SCREEN[2]])
})
test('actual GLB rear piers are replaced and every rafter follows the raised architecture',()=>{
 const bytes=fs.readFileSync(new URL('../public/models/starlight_attic.glb',import.meta.url));const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)))
 const rear=gltf.nodes.filter(n=>replaceAtticEndWall(n.name||'',n.translation?.[2]||0))
 assert.equal(rear.length,4)
 assert.ok(rear.some(n=>n.name.includes('opening pier')))
 const rafters=gltf.nodes.filter(n=>n.name?.startsWith('RAFTER'))
 assert.ok(rafters.length>=8);assert.ok(rafters.every(n=>atticArchitecture(n.name)))
 assert.equal(atticArchitecture('DAYBED carved frame'),false)
 assert.equal(replaceAtticEndWall('WALL end low plinth',-6.64),false)
})

test('moving planets stay outside the projected cinema frame footprint',()=>{
 const xMin=ATTIC_SCREEN[0]-1.35/Math.hypot(1,ATTIC_SCREEN_SLOPE)
 const zMax=ATTIC_SCREEN[2]+4.65/2
 assert.ok(Math.hypot(xMin-ATTIC_MOBILE[0],ATTIC_MOBILE[2]-zMax)>2.12)
 assert.ok(Math.abs(ATTIC_MOBILE[1]+2.82-ATTIC_RIDGE)<.02)
})
