import {fitImage,coverColor} from './bookAppearance'
import {useThree} from '@react-three/fiber'
import {spineSource} from './bookMetadata'
import React,{useEffect,useState,useMemo} from 'react'
import {TextureLoader,SRGBColorSpace,CanvasTexture} from 'three'
import {normalizeCoverUrl} from './coverUrl'

export function CoverImage({url,title='',className='',onStatus}){
 const src=normalizeCoverUrl(url),[failed,setFailed]=useState('')
 return src&&failed!==src?<img key={src} className={className} src={src} alt={title} referrerPolicy="no-referrer"
  onLoad={()=>onStatus?.('표지를 불러왔습니다.')}
  onError={()=>{setFailed(src);onStatus?.('이미지를 불러오지 못했습니다. 이미지 주소와 외부 접근 허용 여부를 확인해 주세요.')}}/>:<span className="cover-fallback">{title||'✦'}</span>
}

// Do not suspend the entire scene on an external image; preserve the book on failure.
export function BookCoverMesh({url,position=[0,0,0],rotation=[0,0,0],size=[.3,.4],onColor}){
 const {gl}=useThree()
 const src=spineSource(url)||normalizeCoverUrl(url),[loaded,setLoaded]=useState(null)
 useEffect(()=>{
  if(!src)return
  let live=true
  const texture=new TextureLoader().setCrossOrigin('anonymous').load(src,t=>{
   if(!live)return
   t.colorSpace=SRGBColorSpace;t.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());setLoaded({src,texture:t})
   if(onColor){try{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d');ctx.drawImage(t.image,0,0,32,32);onColor(coverColor(ctx.getImageData(0,0,32,32).data))}catch{/* CORS: keep the book's chosen colour. */}}
  },undefined,()=>{if(live)setLoaded(null)})
  return ()=>{live=false;texture.dispose()}
 },[src,gl,onColor])
 if(!src||loaded?.src!==src)return null
 return <mesh userData={{noCameraCollision:true}} position={position} rotation={rotation}><planeGeometry args={fitImage(loaded.texture.image.width,loaded.texture.image.height,size)}/><meshBasicMaterial map={loaded.texture} toneMapped={false} polygonOffset polygonOffsetFactor={-1}/></mesh>
}

export function SpineTitle({title,width}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=192;c.height=256;const x=c.getContext('2d');x.fillStyle='#eee2c8';x.fillRect(0,0,192,256);x.fillStyle='#342b22';x.textAlign='center';x.textBaseline='middle';const chars=Array.from(title||'');const lines=[];for(let i=0;i<chars.length;i+=4)lines.push(chars.slice(i,i+4).join(''));const count=Math.max(1,lines.length);x.font=`bold ${Math.min(40,220/count)}px sans-serif`;lines.forEach((line,i)=>x.fillText(line,96,18+(i+.5)*220/count,176));const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t},[title])
 useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh userData={{noCameraCollision:true}} position={[0,-.15,.197]}><planeGeometry args={[width,.20]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
}
