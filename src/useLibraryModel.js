import {useGLTF} from '@react-three/drei'
import {decodeModel} from './modelTransfer'
const urls=new Map()
function modelUrl(url){
 if(import.meta.env.DEV||typeof DecompressionStream==='undefined')return url
 let entry=urls.get(url)
 if(!entry){
  entry={url:null,promise:null}
  entry.promise=fetch(`${url}.gz?v=${__ASSET_VERSION__}`).then(async response=>{
   if(!response.ok)throw new Error('Compressed model unavailable')
   const bytes=await decodeModel(response)
   if(new TextDecoder().decode(new Uint8Array(bytes,0,4))!=='glTF')throw new Error('Invalid compressed model')
   entry.url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}))
  }).catch(()=>{entry.url=`${url}?v=${__ASSET_VERSION__}`})
  urls.set(url,entry)
 }
 if(!entry.url)throw entry.promise
 return entry.url
}
// GLTFLoader and React Suspense still manage parsing, errors and cache reuse.
export function useLibraryModel(url){return useGLTF(modelUrl(url))}
