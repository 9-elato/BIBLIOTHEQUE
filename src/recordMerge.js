const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)
function mergeFields(base,local,remote){
 if(equal(local,base))return remote
 if(equal(remote,base)||equal(local,remote))return local
 if(object(local)&&object(remote)){const result={};for(const k of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){const value=mergeFields(base?.[k],local[k],remote[k]);if(value!==undefined)result[k]=value}return result}
 return local
}
function parse(v){if(v===undefined)return undefined;try{return JSON.parse(v)}catch{return v}}
export function mergeRecords(base,local,remote){
 const result={}
 for(const key of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){
  const b=parse(base[key]),l=parse(local[key]),r=parse(remote[key]);let value
  if(key==='mll-library-attendance-v1')value=[...new Set([...(l||[]),...(r||[])])].sort()
  else if(key==='cafe-membership-v1')value={...mergeFields(b,l,r),visits:[...new Set([...(l?.visits||[]),...(r?.visits||[])])].sort()}
  else if(key==='mll-future-letters-v1')value=Array.from(new Map([...(r||[]),...(l||[])].map(x=>[x.id,x])).values())
  else if(key==='mll-reading-seconds-v1'){value={};for(const id of new Set([...Object.keys(l||{}),...Object.keys(r||{})]))value[id]=b?Number(r?.[id]||0)+Math.max(0,Number(l?.[id]||0)-Number(b[id]||0)):Math.max(Number(l?.[id]||0),Number(r?.[id]||0))}
  else value=mergeFields(b,l,r)
  if(value!==undefined)result[key]=typeof value==='string'?value:JSON.stringify(value)
 }
 return result
}
