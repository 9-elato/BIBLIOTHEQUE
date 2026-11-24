import test from 'node:test'
import assert from 'node:assert/strict'
import {gardenClimate,gardenRoofY,roofDrop,skyFlake} from '../src/greenhouseClimate.js'
test('winter garden changes sunlight, lamps and wildlife with time and weather',()=>{
 const morning=gardenClimate('morning'),afternoon=gardenClimate('afternoon'),night=gardenClimate('night'),rain=gardenClimate('afternoon','rain')
 assert.ok(morning.position[1]>afternoon.position[1]);assert.notEqual(morning.color,afternoon.color)
 assert.ok(night.sun<afternoon.sun);assert.ok(night.lamps);assert.equal(night.butterflies,false);assert.equal(night.dust,false)
 assert.ok(rain.sun<afternoon.sun);assert.ok(rain.lamps);assert.equal(rain.butterflies,false)
 assert.ok(afternoon.butterflies&&afternoon.dust)
})
test('rain stays on the outer roof and snow remains above glass and dome',()=>{
 for(const t of [0,1,20,1000])for(let i=0;i<180;i++){
  const [x,y,z]=roofDrop(i,t);assert.ok(y>gardenRoofY(x));assert.ok(Math.abs(x)<5.3&&z<-7&&z>-30)
  const [,snowY]=skyFlake(i,t);assert.ok(snowY>=8.1)
 }
})
