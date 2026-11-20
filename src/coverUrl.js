export function normalizeCoverUrl(value=''){
 const raw=String(value).trim()
 const markdown=raw.match(/^\[[\s\S]*\]\((https?:\/\/[^\s]+)\)$/i)
 const candidate=(markdown?.[1]||raw).replace(/^<|>$/g,'')
 if(!candidate)return ''
 try{const url=new URL(candidate);return ['https:','http:'].includes(url.protocol)?url.href:''}catch{return ''}
}
