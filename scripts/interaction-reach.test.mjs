import test from 'node:test'
import assert from 'node:assert/strict'
import {Scene,Group,Mesh,BoxGeometry,MeshBasicMaterial,Vector3} from 'three'
import {setInteractionWorld,canReachEvent,withinReach} from '../src/interactionReach.js'

test('inspection rejects distant objects and other floors',()=>{
 assert.equal(withinReach({x:0,z:0,level:0},{x:5,y:1,z:0}),false)
 assert.equal(withinReach({x:0,z:0,level:0},{x:0,y:8,z:0}),false)
})
test('inspection respects opaque obstacles but permits transparent glazing',()=>{
 const scene=new Scene(),wall=new Mesh(new BoxGeometry(2,3,.2),new MeshBasicMaterial())
 wall.position.set(0,1.1,1);scene.add(wall);scene.updateMatrixWorld(true)
 setInteractionWorld({x:0,z:0,level:0},scene)
 const event={point:new Vector3(0,1.1,2)}
 assert.equal(canReachEvent(event),false)
 wall.material.transparent=true;wall.material.opacity=.2
 assert.equal(canReachEvent(event),true)
 wall.material.opacity=1;wall.visible=false
 assert.equal(canReachEvent(event),true)
 wall.geometry.dispose();wall.material.dispose();setInteractionWorld(null,null)
})

test('parts of the clicked prop do not obstruct it, but a separate wall still does',()=>{
 const scene=new Scene(),prop=new Group(),geometry=new BoxGeometry(1,2,.1),material=new MeshBasicMaterial()
 const part=new Mesh(geometry,material),wall=new Mesh(geometry,material)
 part.position.set(0,1.1,1.8);prop.add(part);scene.add(prop)
 setInteractionWorld({x:0,z:0,level:0},scene);scene.updateMatrixWorld(true)
 const event={point:new Vector3(0,1.1,2),eventObject:prop}
 assert.equal(canReachEvent(event),true)
 wall.position.set(0,1.1,1);scene.add(wall);scene.updateMatrixWorld(true)
 assert.equal(canReachEvent(event),false)
 geometry.dispose();material.dispose();setInteractionWorld(null,null)
})
