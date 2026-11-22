import {natureMood} from './natureMood'
import * as THREE from 'three'
export function paintOcean(time,weather){
 const mood=natureMood(time,weather)
 const c=document.createElement('canvas');c.width=1024;c.height=512
 const x=c.getContext('2d'),evening=['evening','night'].includes(time),rain=weather==='rain'
 const sky=x.createLinearGradient(0,0,0,252)
 sky.addColorStop(0,mood.sky);sky.addColorStop(1,mood.horizon)
 x.fillStyle=sky;x.fillRect(0,0,1024,252)
 // Layered soft cumulus: shaded undersides and sunlit rounded crowns.
 for(const [cx,cy,scale] of [[95,100,1],[380,67,.8],[790,110,1.4],[1030,55,.8]]){
  for(let j=0;j<8;j++){
   const px=cx+(j-3.5)*26*scale,py=cy-Math.sin(j/7*Math.PI)*25*scale,r=(23+(j%3)*7)*scale
   const g=x.createRadialGradient(px,py-r*.4,2,px,py,r);g.addColorStop(0,evening?'#ffe5d3':'#ffffff');g.addColorStop(.7,evening?'#e3c4c4':'#f7fcff');g.addColorStop(1,evening?'#a4a8c6':'#c0dfee')
   x.fillStyle=g;x.beginPath();x.ellipse(px,py,r,r*.7,0,0,7);x.fill()
  }
 }
 const sea=x.createLinearGradient(0,252,0,512);sea.addColorStop(0,evening?'#526f8a':rain?'#6b8c98':'#4c91b2');sea.addColorStop(.5,mood.sea);sea.addColorStop(1,evening?'#183e55':rain?'#3b666f':'#187e96');x.fillStyle=sea;x.fillRect(0,252,1024,260)
 // Far headlands lose contrast in sea haze; tiny sails establish distance.
 x.fillStyle=evening?'#6b849d':'#8ebace';x.beginPath();x.moveTo(0,252);x.bezierCurveTo(60,235,85,220,150,239);x.bezierCurveTo(190,230,225,248,270,252);x.fill()
 x.fillStyle=evening?'#c4d1d8':'#e7f5ff';x.globalAlpha=.35;x.fillRect(0,248,1024,5);x.globalAlpha=1
 for(const [a,b,r] of [[355,263,7],[815,270,10]]){x.fillStyle='#fff6df';x.beginPath();x.moveTo(a,b-r);x.lineTo(a-r*.7,b);x.lineTo(a,b);x.fill();x.fillStyle='#4c7186';x.fillRect(a-r*.8,b+1,r*1.5,1)}
 for(let i=0;i<560;i++){
  const a=(i*137.7)%1024,b=254+((i*31.3)%258/258)**1.8*258,depth=(b-252)/260
  x.globalAlpha=.14+(i%5)*.06;x.strokeStyle=i%3?'#b9f3ff':'#ffffff';x.lineWidth=.6+depth*1.3
  x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+2+depth*18,b-depth*3,a+4+depth*62,b);x.stroke()
 }
 x.globalAlpha=1
 // Near shore: larger, darker rocks and broad surf contrast with the horizon.
 for(const [a,b,w,h] of [[-30,486,145,86],[90,524,140,90],[960,520,160,70]]){
  const rock=x.createLinearGradient(a,b-h,a,b);rock.addColorStop(0,evening?'#4d5967':'#6a8586');rock.addColorStop(1,'#243e4e');x.fillStyle=rock
  x.beginPath();x.moveTo(a-w,b);x.bezierCurveTo(a-w*.8,b-h*.7,a-w*.2,b-h,a,b-h*.8);x.bezierCurveTo(a+w*.35,b-h*1.2,a+w*.7,b-h*.25,a+w,b);x.closePath();x.fill()
  x.strokeStyle='#daf5ef';x.lineWidth=3;x.globalAlpha=.7;x.beginPath();x.ellipse(a,b-4,w*1.04,12,0,Math.PI,Math.PI*2);x.stroke();x.globalAlpha=1
 }
 if(rain||weather==='snow'){x.strokeStyle='#e9f8ff';x.globalAlpha=.3;for(let i=0;i<100;i++){const a=i*113%1024,b=i*73%512;x.beginPath();x.moveTo(a,b);x.lineTo(a-2,b+(rain?12:2));x.stroke()}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t
}
