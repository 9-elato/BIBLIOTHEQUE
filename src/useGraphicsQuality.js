import {useEffect,useState} from 'react'
import {resolveQuality} from './graphicsQuality'
export function qualityChoice(){try{return localStorage.getItem('mll-quality')||'auto'}catch{return 'auto'}}
export function setQualityChoice(choice){try{localStorage.setItem('mll-quality',choice)}catch{}window.dispatchEvent(new Event('library-quality'))}
export default function useGraphicsQuality(){
 const read=()=>resolveQuality(qualityChoice(),globalThis.window?.matchMedia?.('(pointer: coarse)').matches||false)
 const [quality,setQuality]=useState(read)
 useEffect(()=>{if(!globalThis.window?.matchMedia)return;const media=window.matchMedia('(pointer: coarse)'),update=()=>setQuality(read());window.addEventListener('library-quality',update);media.addEventListener('change',update);return()=>{window.removeEventListener('library-quality',update);media.removeEventListener('change',update)}},[])
 return quality
}
