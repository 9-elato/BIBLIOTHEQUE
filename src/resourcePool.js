// Share only resources currently in use. Pending loads are released on completion;
// a late completion must never dispose a newer request for the same URL.
export function createResourcePool(load,dispose){
 const entries=new Map()
 return {acquire(key){
  let entry=entries.get(key)
  if(!entry){
   entry={refs:0,value:null,ready:false}
   entries.set(key,entry)
   entry.promise=Promise.resolve().then(()=>load(key)).then(value=>{
    entry.value=value;entry.ready=true
    if(entry.refs===0)dispose(value)
    return value
   },error=>{
    if(entries.get(key)===entry)entries.delete(key)
    throw error
   })
  }
  entry.refs++
  let released=false
  return {promise:entry.promise,release(){
   if(released)return
   released=true
   if(--entry.refs===0){
    if(entries.get(key)===entry)entries.delete(key)
    if(entry.ready)dispose(entry.value)
   }
  }}
 }}
}
