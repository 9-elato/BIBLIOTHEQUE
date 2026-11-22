export function youtubeVideoId(value){
 try{const u=new URL(value.trim());if(!['https:','http:'].includes(u.protocol))return null;const h=u.hostname.toLowerCase().replace(/^www\./,'');let id;
 if(h==='youtu.be')id=u.pathname.split('/')[1];else if(['youtube.com','m.youtube.com'].includes(h))id=u.pathname==='/watch'?u.searchParams.get('v'):['embed','shorts','live'].includes(u.pathname.split('/')[1])?u.pathname.split('/')[2]:null;
 return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:null}catch{return null}
}
