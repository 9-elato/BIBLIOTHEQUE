import * as THREE from 'three'
import {natureMood} from './natureMood'
const SIZE=768
function layer(){const c=document.createElement('canvas');c.width=SIZE;c.height=SIZE;return [c,c.getContext('2d')]}
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function tree(ctx,rand,x,base,h,color,detail){
 const trunk=h*.035;ctx.strokeStyle=detail?'#4c4e39':color;ctx.lineWidth=trunk;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,base);ctx.bezierCurveTo(x-9,base-h*.35,x+8,base-h*.7,x,base-h);ctx.stroke()
 for(let j=0;j<6;j++){const side=j%2?1:-1,y=base-h*(.35+j*.09),end=x+side*h*(.12+rand()*.12);ctx.lineWidth=trunk*(.45-j*.045);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(end,y-h*.03,end,y-h*.16);ctx.stroke();for(let k=0;k<(detail?26:12);k++){const a=rand()*6.28,r=rand()*h*.15,px=end+Math.cos(a)*r,py=y-h*.16+Math.sin(a)*r*.6;ctx.fillStyle=color;ctx.globalAlpha=.65+rand()*.35;ctx.beginPath();ctx.ellipse(px,py,detail?4+rand()*10:10+rand()*13,detail?2+rand()*5:7+rand()*8,rand()*3,0,Math.PI*2);ctx.fill();if(detail&&k%5===0){ctx.fillStyle='#b4b979';ctx.globalAlpha=.22;ctx.fill()}}}ctx.globalAlpha=1
}
export function createForestLayers(time,weather){
 const m=natureMood(time,weather),[far,f]=layer(),[mid,g]=layer(),[near,n]=layer(),r=random(62419)
 const sky=f.createLinearGradient(0,0,0,SIZE);sky.addColorStop(0,m.sky);sky.addColorStop(.64,m.horizon);sky.addColorStop(1,m.far);f.fillStyle=sky;f.fillRect(0,0,SIZE,SIZE)
 for(let l=0;l<4;l++){f.fillStyle=[m.fog,m.far,m.mid,m.near][l];f.globalAlpha=.28+l*.10;f.beginPath();f.moveTo(0,SIZE);for(let x=0;x<=SIZE;x+=12)f.lineTo(x,300+l*92+Math.sin(x*.006+l*1.9)*65+Math.sin(x*.021+l)*15);f.lineTo(SIZE,SIZE);f.fill()}f.globalAlpha=1
 // A distant stream and a receding path provide scale between the forest layers.
 f.strokeStyle=m.evening?'#9aabaa':'#d6dfcb';f.lineWidth=3;f.beginPath();f.moveTo(410,454);f.bezierCurveTo(470,530,330,580,510,768);f.stroke()
 for(let i=0;i<24;i++)tree(f,r,i*36-40,600+r()*110,150+r()*130,m.far,false)
 for(let i=0;i<15;i++)tree(g,r,i*61-40,760+r()*80,360+r()*250,i%3?m.mid:m.near,false)
 const haze=g.createLinearGradient(0,420,0,768);haze.addColorStop(0,'rgba(180,204,179,0)');haze.addColorStop(1,m.evening?'rgba(36,56,48,.18)':'rgba(199,211,169,.18)');g.fillStyle=haze;g.fillRect(0,420,768,348)
 for(const [x,b,h] of [[-18,840,850],[745,890,940],[640,930,680]])tree(n,r,x,b,h,m.near,true)
 for(let i=0;i<110;i++){const x=r()*768,y=700+r()*68;n.strokeStyle=i%3?m.near:m.mid;n.lineWidth=1.5;n.beginPath();n.moveTo(x,780);n.quadraticCurveTo(x-14,y,x-25,y-15);n.stroke()}
 if(m.snow){for(let i=0;i<90;i++){const x=r()*768,y=r()*768;n.fillStyle='rgba(230,237,224,.60)';n.beginPath();n.ellipse(x,y,3+r()*8,1.8,0,0,7);n.fill()}}
 return [far,mid,near].map(c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=true;return t})
}
