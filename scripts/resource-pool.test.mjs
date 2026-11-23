import test from 'node:test'
import assert from 'node:assert/strict'
import {createResourcePool} from '../src/resourcePool.js'

test('concurrent cover users share one load and dispose only after the last release',async()=>{
 let loads=0;const disposed=[];const texture={id:1}
 const pool=createResourcePool(async()=>{loads++;return texture},value=>disposed.push(value))
 const a=pool.acquire('cover'),b=pool.acquire('cover')
 assert.equal(await a.promise,await b.promise);assert.equal(loads,1)
 a.release();a.release();assert.equal(disposed.length,0)
 b.release();assert.deepEqual(disposed,[texture])
 const c=pool.acquire('cover');await c.promise;assert.equal(loads,2);c.release()
})
test('unmounted pending cover releases without disposing a newer request',async()=>{
 const resolvers=[],disposed=[]
 const pool=createResourcePool(()=>new Promise(resolve=>resolvers.push(resolve)),value=>disposed.push(value))
 const old=pool.acquire('same');await Promise.resolve();old.release()
 const fresh=pool.acquire('same');await Promise.resolve()
 resolvers[0]('old');await old.promise;assert.deepEqual(disposed,['old'])
 const shared=pool.acquire('same');assert.equal(shared.promise,fresh.promise)
 resolvers[1]('new');await fresh.promise;fresh.release();assert.deepEqual(disposed,['old'])
 shared.release();assert.deepEqual(disposed,['old','new'])
})
test('failed covers can retry and releasing a failed lease leaves retry alive',async()=>{
 let attempts=0;const disposed=[]
 const pool=createResourcePool(async()=>{if(++attempts===1)throw Error('network');return 'retry'},value=>disposed.push(value))
 const failed=pool.acquire('cover');await assert.rejects(failed.promise,/network/)
 const retry=pool.acquire('cover');await retry.promise;failed.release()
 const shared=pool.acquire('cover');assert.equal(shared.promise,retry.promise)
 retry.release();shared.release();assert.deepEqual(disposed,['retry'])
})
