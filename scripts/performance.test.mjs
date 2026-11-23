import test from 'node:test'
import assert from 'node:assert/strict'
import {createProfileRun,sampleProfile,profileResult} from '../src/profileMetrics.js'
import {createHintScheduler} from '../src/interactionScheduler.js'
import {startInteractionTrace} from '../src/interactionMetrics.js'
const sample={cpu:3,calls:100,triangles:50000}
test('wall clock sampling excludes warmup and includes long stalls',()=>{
 const r=createProfileRun(0)
 assert.equal(sampleProfile(r,1000,sample),'warmup');sampleProfile(r,2000,sample)
 for(let t=2010;t<=30000;t+=10)sampleProfile(r,t,sample)
 assert.equal(sampleProfile(r,32000,sample),'complete')
 const result=profileResult(r)
 assert.equal(result.durationMs,30000);assert.equal(result.valid,true);assert.equal(result.frameMax,2000);assert.equal(result.stalls,1);assert.ok(result.fps<100)
})
test('hidden run cannot be reported as a valid benchmark',()=>{
 const r=createProfileRun(0);sampleProfile(r,2000,sample)
 assert.equal(sampleProfile(r,3000,sample,false),'hidden');assert.equal(profileResult(r).valid,false);assert.match(profileResult(r).warning,/숨겨/)
})
test('invalid geometry is not a zero triangle count',()=>{
 const r=createProfileRun(0);sampleProfile(r,2000,sample)
 for(let t=3000;t<=32000;t+=1000)sampleProfile(r,t,{...sample,triangles:NaN})
 assert.equal(profileResult(r).triangles,null);assert.match(profileResult(r).warning,/삼각형/)
})
test('hint scans are throttled and resume immediately after overlays',()=>{
 const s=createHintScheduler();let scans=0;const resolve=()=>({type:'seat',label:String(++scans)})
 for(let i=0;i<60;i++)s.next(1/60,true,resolve)
 assert.ok(scans<=11);assert.ok(scans>=8);assert.equal(s.next(.016,false,resolve),null)
 const before=scans;s.next(.016,true,resolve);assert.equal(scans,before+1)
 s.invalidate();s.next(0,true,resolve);assert.equal(scans,before+2)
})
test('interaction metrics separate resolution, execution and next callback time',()=>{
 let time=0,callback,result,calls=0
 const trace=startInteractionTrace({now:()=>time,requestFrame:fn=>{callback=fn},publish:r=>{result=r;calls++}})
 time=2;trace.resolved('seat');time=5;trace.finish();trace.finish()
 time=17;callback()
 assert.equal(calls,1);assert.equal(result.type,'seat');assert.equal(result.resolveMs,2)
 assert.equal(result.executeMs,3);assert.equal(result.handlerMs,5);assert.equal(result.nextFrameCallbackMs,17)
})
