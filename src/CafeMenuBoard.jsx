import React,{useEffect,useMemo,useState} from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {menuItems,MENU_ART_PATH} from './cafeMenu'
const artUrl=import.meta.env.BASE_URL+MENU_ART_PATH
export function IllustratedMenu({menu}){
 const [expanded,setExpanded]=useState(null)
 return <div className="illustrated-menu">{menuItems(menu).map((item,i)=><article key={i} role="button" tabIndex={0} aria-expanded={expanded===i} className={expanded===i?'menu-expanded':''} onClick={()=>setExpanded(expanded===i?null:i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setExpanded(expanded===i?null:i)}}}><span className="menu-kind">{item.set?'PAIRING SET':'A LA CARTE'}</span><h4>{item.name}</h4>{item.description&&<small>{item.description}</small>}<div className={item.set?'menu-art-pair':'menu-art-single'}>{(item.arts||[item.art]).map((art,j)=>art>=0?<div key={j} role="img" aria-label={(item.description||item.name).split('+')[j]?.trim()} className="menu-watercolor" style={{backgroundImage:`url(${artUrl})`,backgroundPosition:`${art%3*50}% ${Math.floor(art/3)*50}%`}}/>:<div key={j} className="menu-watercolor menu-custom">GHOST COLLECTIVE</div>)}</div><p>{item.price}</p></article>)}</div>
}
function Card({item,image,position,size}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=384;c.height=512;const x=c.getContext('2d');x.fillStyle='#f5f0e6';x.fillRect(0,0,384,512);
 x.fillStyle='#777067';x.textAlign='left';x.font='14px sans-serif';x.fillText(item.set?'PAIRING SET':'A LA CARTE',24,32);x.fillStyle='#242424';x.font='24px sans-serif';
 const words=item.name.split(' '),lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(x.measureText(next).width>336&&line){lines.push(line);line=word}else line=next}lines.push(line);lines.slice(0,2).forEach((v,i)=>x.fillText(v,24,72+i*30,336));
 if(image){const w=image.width/3,h=image.height/3,arts=item.arts||[item.art];arts.forEach((art,i)=>{if(art<0)return;const side=arts.length>1?164:280,left=arts.length>1?24+i*172:52,top=arts.length>1?173:117;x.drawImage(image,art%3*w,Math.floor(art/3)*h,w,h,left,top,side,side)})}
 x.fillStyle='#55504a';x.font='18px sans-serif';(item.description||'').split('+').forEach((v,i)=>x.fillText(v.trim(),24,410+i*24,336));x.strokeStyle='#c7bba8';x.beginPath();x.moveTo(24,456);x.lineTo(360,456);x.stroke();x.fillStyle='#242424';x.font='20px sans-serif';x.fillText(item.price,24,487,336);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[item.name,item.price,item.description,item.art,item.set,image]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={position}><planeGeometry args={size}/><meshBasicMaterial map={texture}/></mesh>
}
export default function CafeMenuBoard({menu,onOpen}){
 const [image,setImage]=useState(null);useEffect(()=>{let live=true;const img=new Image();img.onload=()=>{if(live)setImage(img)};img.src=artUrl;return()=>{live=false;img.onload=null}},[])
 const items=menuItems(menu).slice(0,12),rows=Math.max(1,Math.ceil(items.length/4)),height=2.68/rows;
 return <group onClick={e=>{e.stopPropagation();onOpen('cafe-menu')}} position={[-18.93,4.5,18.3]} rotation={[0,-Math.PI/2,0]}>
 {items.map((item,i)=><Card key={i} item={item} image={image} position={[-1.35+(i%4)*.9,-height*(Math.floor(i/4)+.5),.015]} size={[.83,height-.12]}/>)}
 {Array.from({length:rows},(_,i)=><B key={i} p={[0,-height*(i+1),.06]} s={[3.7,.055,.18]} c="#b2a48a"/>)}
 </group>
}
