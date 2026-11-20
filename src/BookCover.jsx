import React,{useEffect,useState} from 'react'
import {TextureLoader,SRGBColorSpace} from 'three'
import {normalizeCoverUrl} from './coverUrl'

export function CoverImage({url,title='',className='',onStatus}){
 const src=normalizeCoverUrl(url),[failed,setFailed]=useState('')
 return src&&failed!==src?<img key={src} className={className} src={src} alt={title} referrerPolicy="no-referrer"
  onLoad={()=>onStatus?.('표지를 불러왔습니다.')}
  onError={()=>{setFailed(src);onStatus?.('이미지를 불러오지 못했습니다. 이미지 주소와 외부 접근 허용 여부를 확인해 주세요.')}}/>:<span className="cover-fallback">{title||'✦'}</span>
}

// Do not suspend the entire scene on an external image; preserve the book on failure.
export function BookCoverMesh({url,position=[0,0,0],rotation=[0,0,0],size=[.3,.4]}){
 const src=normalizeCoverUrl(url),[loaded,setLoaded]=useState(null)
 useEffect(()=>{
  if(!src)return
  let live=true
  const texture=new TextureLoader().setCrossOrigin('anonymous').load(src,t=>{
   if(!live)return
   t.colorSpace=SRGBColorSpace;setLoaded({src,texture:t})
  },undefined,()=>{if(live)setLoaded(null)})
  return ()=>{live=false;texture.dispose()}
 },[src])
 if(!src||loaded?.src!==src)return null
 return <mesh position={position} rotation={rotation}><planeGeometry args={size}/><meshBasicMaterial map={loaded.texture} toneMapped={false} polygonOffset polygonOffsetFactor={-1}/></mesh>
}
