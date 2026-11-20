import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'

const args=process.argv.slice(2)
const repo=fs.realpathSync(path.resolve(args.includes('--repo')?args[args.indexOf('--repo')+1]:fileURLToPath(new URL('..',import.meta.url))))
const watch=args.includes('--watch')
function decision(branch,changes,ahead,behind){
 if(branch!=='main')return 'skip-branch'
 if(changes.trim())return 'skip-changes'
 if(ahead>0)return 'skip-unpublished'
 return behind>0?'fast-forward':'current'
}
function git(...gitArgs){
 const r=spawnSync('git',['-C',repo,...gitArgs],{encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:4*1024*1024,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'}})
 if(r.error||r.status!==0)throw Error(`git ${gitArgs[0]} failed: ${r.error?.message||r.stderr?.trim()||r.status}`)
 return r.stdout.trim()
}
if(args.includes('--self-test')){
 for(const [branch,changes,ahead,behind,expected] of [['main','',0,3,'fast-forward'],['main',' M src/main.jsx',0,3,'skip-changes'],['main','?? notes.txt',0,3,'skip-changes'],['main','',2,0,'skip-unpublished'],['main','',2,3,'skip-unpublished'],['codex/work','',0,3,'skip-branch'],['HEAD','',0,3,'skip-branch'],['main','',0,0,'current']])assert.equal(decision(branch,changes,ahead,behind),expected)
 console.log('PASS: 8 sync safety cases. No repository changes or network requests.')
}else{
 const top=fs.realpathSync(git('rev-parse','--show-toplevel'))
 if(top.toLowerCase()!==repo.toLowerCase())throw Error('Select the repository root.')
 if(!/^(https:\/\/github\.com\/9-elato\/BIBLIOTHEQUE(?:\.git)?\/?|git@github\.com:9-elato\/BIBLIOTHEQUE(?:\.git)?)$/.test(git('remote','get-url','origin')))throw Error('Origin is not the expected 9-elato/BIBLIOTHEQUE repository.')
 console.log(`Repository: ${repo}`)
 if(args.includes('--validate-only')){
  console.log(`Branch: ${git('rev-parse','--abbrev-ref','HEAD')}`)
  console.log(`Working tree: ${git('status','--porcelain')?'changes present; apply will stop':'clean'}`)
  console.log('Validation only: no fetch, merge, commit, push, or scheduling.')
 }else{
  // One receiver per checkout. Stale locks are not removed automatically.
  const lock=path.join(os.tmpdir(),`bibliotheque-sync-${createHash('sha256').update(repo.toLowerCase()).digest('hex').slice(0,20)}.lock`)
  let fd
  try{fd=fs.openSync(lock,'wx');fs.writeSync(fd,String(process.pid))}catch{throw Error(`Sync lock exists. Check whether another watcher is running: ${lock}`)}
  const cleanup=()=>{if(fd!==undefined){fs.closeSync(fd);fd=undefined;fs.unlinkSync(lock)}}
  process.on('exit',cleanup);process.on('SIGINT',()=>process.exit(0));process.on('SIGTERM',()=>process.exit(0))
  console.log('Receive-only. No automatic commit/push/stash/reset. Stop this window before editing. Ctrl+C stops.')
  const cycle=()=>{
   try{
    let result=decision(git('rev-parse','--abbrev-ref','HEAD'),git('status','--porcelain','--untracked-files=normal'),0,0)
    if(result==='current'){
     git('fetch','--quiet','--no-recurse-submodules','origin','main')
     const counts=git('rev-list','--left-right','--count','HEAD...FETCH_HEAD').split(/\s+/).map(Number)
     if(counts.length!==2||counts.some(n=>!Number.isFinite(n)))throw Error('Invalid divergence counts; not applying.')
     result=decision(git('rev-parse','--abbrev-ref','HEAD'),git('status','--porcelain','--untracked-files=normal'),...counts)
     if(result==='fast-forward'){git('merge','--ff-only','--no-edit','FETCH_HEAD');result=`updated: ${git('rev-parse','--short','HEAD')}`}
    }
    console.log(`[${new Date().toLocaleTimeString()}] ${result}`)
   }catch(e){console.error(e.message);if(!watch)process.exitCode=1}
   if(watch)setTimeout(cycle,60000)
  }
  cycle()
 }
}
