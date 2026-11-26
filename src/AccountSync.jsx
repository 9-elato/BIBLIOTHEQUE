import React,{useEffect,useState} from 'react'
import {applySnapshot,recordAccount,recordSnapshot,setRecordAccount,guestSnapshot} from './recordStorage'
import {mergeRecords} from './recordMerge'
let runSync=()=>{},status='로그인하면 같은 계정의 기록이 연동됩니다.'
function report(text){status=text;window.dispatchEvent(new Event('library-sync-status'))}
export function SyncStatus(){const [text,setText]=useState(status);useEffect(()=>{const fn=()=>setText(status);window.addEventListener('library-sync-status',fn);return()=>window.removeEventListener('library-sync-status',fn)},[]);return <section><h3>기기 간 기록 동기화</h3><p role="status">{text}</p><p>PC·모바일에서 같은 계정으로 로그인하세요. 출석·쿠폰·편지·독서 시간·북카페 설정·책 배치를 연동합니다. 책 목록과 감상은 기존 공개 서재 서버를 사용합니다.</p>{recordAccount()&&<><button onClick={()=>runSync()}>지금 동기화</button><button onClick={()=>{try{const local=guestSnapshot();if(!confirm('이 브라우저에 로그인 전 작성한 기록을 현재 계정에 합칠까요? 같은 설정 항목은 이 브라우저의 값을 사용하며 원본은 남겨둡니다.'))return;applySnapshot(mergeRecords({},local,recordSnapshot()));runSync()}catch{report('기록을 가져오지 못했습니다. 원본은 보존되어 있습니다.')}}}>이 브라우저의 기존 기록 합치기</button></>}<button onClick={()=>{const payload={account:recordAccount(),records:recordSnapshot(),guest:guestSnapshot(),legacyBooks:localStorage.getItem('virtual-library-v1')};const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.href=url;a.download='library-records-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>전체 기록 백업 (편지 본문 포함)</button></section>}
export default function AccountSync({db,children}){
 const [session,setSession]=useState(undefined),[hydrated,setHydrated]=useState('')
 useEffect(()=>{if(!db){setRecordAccount('');setSession(null);report('서버 연결 설정이 없습니다. 현재 브라우저에만 저장됩니다.');return}let live=true,received=false;db.auth.getSession().then(({data,error})=>{if(live&&!received){setRecordAccount(data.session?.user?.id);setSession(data.session);if(error)report('로그인 상태 확인 실패: '+error.message)}});const {data:{subscription}}=db.auth.onAuthStateChange((_,s)=>{received=true;setRecordAccount(s?.user?.id);setSession(s)});return()=>{live=false;subscription.unsubscribe()}},[db])
 useEffect(()=>{
  const id=session?.user?.id;if(!db||!id){if(db)report('로그인이 필요합니다. 로그아웃 상태의 기록은 이 브라우저에만 저장됩니다.');return}
  let disposed=false,busy=false,timer,lastRevision=-1,lastRemote={};const baseKey=`library-sync-base:${id}`
  const active=()=>!disposed&&recordAccount()===id
  async function sync(){
   if(!active()||busy||document.visibilityState==='hidden')return
   busy=true
   try{if(navigator.locks)await navigator.locks.request(`library-sync:${id}`,cycle);else await cycle()}finally{busy=false}
  }
  async function cycle(){
   if(!active())return
   report('기록을 동기화하고 있습니다…')
   try{
    for(let attempt=0;attempt<4;attempt++){
     let {data,error}=await db.from('account_records').select('revision').eq('user_id',id).maybeSingle();if(!active())return;if(error)throw error
     if((data?.revision||0)!==lastRevision){const full=await db.from('account_records').select('revision,payload').eq('user_id',id).maybeSingle();if(!active())return;if(full.error)throw full.error;data=full.data;lastRevision=data?.revision||0;lastRemote=data?.payload||{}}
     const remote=lastRemote,base=JSON.parse(localStorage.getItem(baseKey)||'{}'),before=recordSnapshot(),merged=mergeRecords(base,before,remote)
     let accepted=true
     if(JSON.stringify(merged)!==JSON.stringify(remote)){const result=await db.rpc('save_account_records',{expected_revision:lastRevision,new_payload:merged});if(!active())return;if(result.error)throw result.error;accepted=result.data===true;if(accepted){lastRevision++;lastRemote=merged}}
     if(!accepted)continue
     // Preserve edits made while the request was in flight, including reading seconds.
     const now=recordSnapshot(),rebased=mergeRecords(before,now,merged)
     if(JSON.stringify(now)!==JSON.stringify(rebased)){
      localStorage.setItem(`library-sync-backup:${id}`,JSON.stringify({at:new Date().toISOString(),records:now}))
      applySnapshot(rebased)
     }
     localStorage.setItem(baseKey,JSON.stringify(merged))
     report(JSON.stringify(rebased)===JSON.stringify(merged)?'동기화 완료 · '+new Date().toLocaleTimeString():'새 기록 저장됨 · 다음 동기화 대기')
     return
    }
    throw Error('다른 기기에서 수정 중입니다. 잠시 후 다시 시도합니다.')
   }catch(e){if(active())report('동기화 대기 · 로컬 기록 보존 중. '+e.message)}finally{if(active())setHydrated(id)}
  }
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(sync,1500)},wake=()=>sync(),otherTab=e=>{if(e.key?.startsWith(`library-account:${id}:`)){window.dispatchEvent(new Event('library-records-updated'));schedule()}}
  runSync=sync;sync();const interval=setInterval(sync,15000)
  window.addEventListener('storage',otherTab);window.addEventListener('library-records-dirty',schedule);window.addEventListener('online',wake);window.addEventListener('focus',wake);document.addEventListener('visibilitychange',wake)
  return()=>{disposed=true;clearTimeout(timer);clearInterval(interval);runSync=()=>{};window.removeEventListener('storage',otherTab);window.removeEventListener('library-records-dirty',schedule);window.removeEventListener('online',wake);window.removeEventListener('focus',wake);document.removeEventListener('visibilitychange',wake)}
 },[db,session?.user?.id])
 return session===undefined||(session?.user?.id&&hydrated!==session.user.id)?<p>기록을 준비하고 있습니다…</p>:<React.Fragment key={session?.user?.id||'guest'}>{children(session)}</React.Fragment>
}
