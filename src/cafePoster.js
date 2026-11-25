import {normalizeCoverUrl} from './coverUrl.js'
import {spineSource} from './bookMetadata.js'
export function posterSource(value){return spineSource(value)||normalizeCoverUrl(value)}
export async function importPoster(file){
 if(!file||file.size>10*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('10MB 이하 JPG, PNG, WebP 이미지를 선택하세요.')
 const url=URL.createObjectURL(file)
 try{const image=new Image();image.src=url;await image.decode();const scale=Math.min(1,1200/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.86)}finally{URL.revokeObjectURL(url)}
}

export function withCafePoster(config){
 if(config.filmPoster||config.filmTitle!=='다음 상영작 준비 중')return config
 return {...config,filmTitle:'Call Me by Your Name',filmPoster:new URL(`${import.meta.env?.BASE_URL||'/'}posters/call-me-by-your-name.webp`,globalThis.location?.href||'http://localhost/').href}
}
