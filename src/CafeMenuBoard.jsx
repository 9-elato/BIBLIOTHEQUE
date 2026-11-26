import React,{useEffect,useMemo,useState} from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import {menuItems,MENU_ART_PATH} from './cafeMenu'
const artUrl=import.meta.env.BASE_URL+MENU_ART_PATH
export function IllustratedMenu({menu}){
 const [expanded,setExpanded]=useState(null)
 return <div className="illustrated-menu">{menuItems(menu).map((item,i)=><article key={i} role="button" tabIndex={0} aria-expanded={expanded===i} className={expanded===i?'menu-expanded':''} onClick={()=>setExpanded(expanded===i?null:i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setExpanded(expanded===i?null:i)}}}><h4>{item.name}</h4>{item.description&&<small>{item.description}</small>}{item.art>=0?<div role="img" aria-label={item.name+' 일러스트'} className="menu-watercolor" style={{backgroundImage:`url(${artUrl})`,backgroundPosition:`${item.art%3*50}% ${Math.floor(item.art/3)*50}%`}}/>:<div className="menu-watercolor menu-custom">유령단의 선택</div>}<p>{item.price}</p></article>)}</div>
}
function Card({item,image,position,size}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=384;c.height=512;const x=c.getContext('2d');x.fillStyle='#f7f1e5';x.fillRect(0,0,384,512);
 if(image&&item.art>=0){const w=image.width/3,h=image.height/3;x.drawImage(image,(item.art%3)*w,Math.floor(item.art/3)*h,w,h,12,105,360,330)}
 x.fillStyle='#43372c';x.textAlign='center';x.font='26px Georgia, serif';x.fillText(item.name,192,48,350);if(item.description){x.font='18px Georgia, serif';x.fillText(item.description,192,83,350)}x.font='23px Georgia, serif';x.fillText(item.price,192,475,350);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[item.name,item.price,item.description,item.art,image]);useEffect(()=>()=>texture.dispose(),[texture]);
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
