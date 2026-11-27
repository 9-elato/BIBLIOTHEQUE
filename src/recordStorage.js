let account=''
export const RECORD_KEYS=['mll-cafe-reservations','mll-cinema-kit','mll-content-imports','mll-book-cafe','mll-library-attendance-v1','cafe-membership-v1','mll-future-letters-v1','mll-reading-seconds-v1','mll-world-note','mll-character','mll-study-lamp','mll-welcome-open','mll-book-placements']
const canonical=k=>k.startsWith('mll-book-placements-v1:')?'mll-book-placements':k
const physical=k=>account?`library-account:${account}:${canonical(k)}`:k
export function setRecordAccount(id){account=id||''}
export function recordAccount(){return account}
export function notifyRecords(){window.dispatchEvent(new Event('library-records-updated'))}
export const recordStorage={
 getItem(k){return localStorage.getItem(physical(k))},
 setItem(k,v){localStorage.setItem(physical(k),v);window.dispatchEvent(new Event('library-records-dirty'))},
 removeItem(k){localStorage.removeItem(physical(k));window.dispatchEvent(new Event('library-records-dirty'))}
}
export function recordSnapshot(){return Object.fromEntries(RECORD_KEYS.map(k=>[k,recordStorage.getItem(k)]).filter(([,v])=>v!==null))}
export function applySnapshot(snapshot){for(const k of RECORD_KEYS){if(typeof snapshot[k]==='string')localStorage.setItem(physical(k),snapshot[k]);else localStorage.removeItem(physical(k))}notifyRecords()}
export function guestSnapshot(){const result={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(RECORD_KEYS.includes(k)||k.startsWith('mll-book-placements-v1:')){result[canonical(k)]=localStorage.getItem(k)}}return result}
