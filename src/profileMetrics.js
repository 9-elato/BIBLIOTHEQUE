export const PROFILE_WARMUP_MS=2000
export const PROFILE_DURATION_MS=30000
const percentile=(values,p)=>{const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);return sorted.length?sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]:null}
const round=v=>v===null?null:Math.round(v*10)/10
export function createProfileRun(now,context={}){return {context,readyAt:now+PROFILE_WARMUP_MS,last:null,elapsed:0,frames:[],cpu:[],calls:[],triangles:[],invalid:false}}
export function sampleProfile(r,now,sample,visible=true){
 if(!visible){r.invalid=true;return 'hidden'}
 if(now<r.readyAt)return 'warmup'
 if(r.last===null){r.last=now;return 'sampling'}
 const dt=now-r.last;if(dt<=0)return 'sampling'
 r.last=now;r.elapsed+=dt;r.frames.push(dt);r.cpu.push(sample.cpu);r.calls.push(sample.calls);r.triangles.push(sample.triangles)
 return r.elapsed>=PROFILE_DURATION_MS?'complete':'sampling'
}
export function profileResult(r){
 const valid=!r.invalid&&r.elapsed>=PROFILE_DURATION_MS&&r.frames.length>=12
 return {...r.context,valid,durationMs:round(r.elapsed),frames:r.frames.length,fps:r.elapsed?round(r.frames.length*1000/r.elapsed):null,
 frameP50:round(percentile(r.frames,.5)),frameP95:round(percentile(r.frames,.95)),renderP50:round(percentile(r.cpu,.5)),calls:percentile(r.calls,.5),
 triangles:r.triangles.length&&r.triangles.every(Number.isFinite)?percentile(r.triangles,.5):null,
 frameMax:r.frames.length?round(Math.max(...r.frames)):null,stalls:r.frames.filter(ms=>ms>250).length,
 warning:r.invalid?'화면이 숨겨져 측정을 취소했습니다. 활성 창에서 다시 측정하세요.':!valid?'측정 시간 또는 프레임 샘플이 부족합니다.':r.triangles.some(n=>!Number.isFinite(n))?'삼각형 통계 오류를 확인하세요.':null}
}
