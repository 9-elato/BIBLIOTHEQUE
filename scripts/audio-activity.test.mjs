import test from 'node:test'
import assert from 'node:assert/strict'
import {createAudioActivity} from '../src/audioActivity.js'
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve()}
function fixture(){
 let id=0
 const timers=new Map(),targets=[]
 const ctx={state:'suspended',currentTime:1,resumes:0,suspends:0,
  resume(){this.resumes++;this.state='running';return Promise.resolve()},
  suspend(){this.suspends++;this.state='suspended';return Promise.resolve()},
 }
 const activity=createAudioActivity(ctx,{gain:{setTargetAtTime:(...args)=>targets.push(args)}},{fade:.4,setTimer:(fn,ms)=>{timers.set(++id,{fn,ms});return id},clearTimer:id=>timers.delete(id)})
 return {ctx,activity,timers,targets,fire(){const pending=[...timers.values()];timers.clear();pending.forEach(t=>t.fn())}}
}
test('audio waits for activation and fades once before suspending idle DSP',async()=>{
 const f=fixture();await settle();assert.equal(f.ctx.resumes,0)
 f.activity.setVolume(.28);await settle();assert.equal(f.ctx.resumes,1)
 f.activity.setVolume(0);assert.equal(f.ctx.suspends,0);assert.equal([...f.timers.values()][0].ms,2400)
 for(let i=0;i<100;i++)f.activity.setVolume(0)
 assert.equal(f.targets.length,2);assert.equal(f.timers.size,1,'polling must not postpone suspension')
 f.fire();await settle();assert.equal(f.ctx.suspends,1)
 f.activity.setVolume(.28);await settle();assert.equal(f.ctx.resumes,2)
})
test('returning before fade completes cancels suspension',async()=>{
 const f=fixture();f.activity.setVolume(.14);await settle()
 f.activity.setVolume(0);f.activity.setVolume(.14);f.fire();await settle()
 assert.equal(f.ctx.suspends,0);assert.equal(f.timers.size,0)
})
test('hide/show race with delayed suspend resumes only when sound is wanted',async()=>{
 const f=fixture();f.activity.setVolume(.28);await settle()
 let complete
 f.ctx.suspend=function(){this.suspends++;return new Promise(resolve=>{complete=()=>{this.state='suspended';resolve()}})}
 f.activity.setVolume(0);f.fire();await settle();assert.equal(f.ctx.suspends,1)
 f.activity.setVolume(.28);assert.equal(f.ctx.resumes,1)
 complete();await settle();assert.equal(f.ctx.state,'running');assert.equal(f.ctx.resumes,2)
})
test('pending resume followed by hide suspends when the resume completes',async()=>{
 const f=fixture();let complete
 f.ctx.resume=function(){this.resumes++;return new Promise(resolve=>{complete=()=>{this.state='running';resolve()}})}
 f.activity.setVolume(.28);await settle();f.activity.setVolume(0);f.fire();await settle()
 assert.equal(f.ctx.suspends,0)
 complete();await settle();assert.equal(f.ctx.suspends,1)
})
test('cleanup cancels timers and prevents a queued resume after close',async()=>{
 const f=fixture();f.activity.setVolume(.28);f.activity.dispose();f.ctx.state='closed';await settle()
 assert.equal(f.ctx.resumes,0)
 f.activity.setVolume(0);assert.equal(f.timers.size,0)
 const g=fixture();g.activity.setVolume(0);assert.equal(g.timers.size,1);g.activity.dispose();g.fire();await settle();assert.equal(g.ctx.suspends,0)
})
test('suspend rejection stays muted without an unhandled rejection or retry loop',async()=>{
 const f=fixture();f.activity.setVolume(.28);await settle()
 f.ctx.suspend=function(){this.suspends++;return Promise.reject(new Error('not supported'))}
 f.activity.setVolume(0);f.fire();await settle()
 assert.equal(f.ctx.suspends,1);assert.equal(f.targets.at(-1)[0],0);assert.equal(f.timers.size,0)
 f.activity.setVolume(.28);await settle();assert.equal(f.targets.at(-1)[0],.28)
})
