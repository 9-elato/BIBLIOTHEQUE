import * as THREE from 'three'
export function paintOcean(time,weather){
 const c=document.createElement('canvas');c.width=1024;c.height=512
 const x=c.getContext('2d'),evening=['evening','night'].includes(time),rain=weather==='rain'
 const sky=x.createLinearGradient(0,0,0,252)
 sky.addColorStop(0,evening?'#254f86':rain?'#718fa9':'#178fe5');sky.addColorStop(1,evening?'#efc2ac':'#bcecff')
 x.fillStyle=sky;x.fillRect(0,0,1024,252)
 // Layered soft cumulus: shaded undersides and sunlit rounded crowns.
 for(const [cx,cy,scale] of [[95,100,1],[380,67,.8],[790,110,1.4],[1030,55,.8]]){
  for(let j=0;j<8;j++){
   const px=cx+(j-3.5)*26*scale,py=cy-Math.sin(j/7*Math.PI)*25*scale,r=(23+(j%3)*7)*scale
   const g=x.createRadialGradient(px,py-r*.4,2,px,py,r);g.addColorStop(0,evening?'#ffe5d3':'#ffffff');g.addColorStop(.7,evening?'#e3c4c4':'#f7fcff');g.addColorStop(1,evening?'#a4a8c6':'#c0dfee')
   x.fillStyle=g;x.beginPath();x.ellipse(px,py,r,r*.7,0,0,7);x.fill()
  }
 }
 const sea=x.createLinearGradient(0,252,0,512);sea.addColorStop(0,evening?'#336ba5':'#126bd3');sea.addColorStop(.5,evening?'#175780':'#128ee1');sea.addColorStop(1,evening?'#123b68':'#13a7d2');x.fillStyle=sea;x.fillRect(0,252,1024,260)
 for(let i=0;i<560;i++){
  const a=(i*137.7)%1024,b=254+(i*31.3)%258,depth=(b-252)/260
  x.globalAlpha=.14+(i%5)*.06;x.strokeStyle=i%3?'#b9f3ff':'#ffffff';x.lineWidth=.6+depth*1.3
  x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+10,b-2,a+10+depth*32,b);x.stroke()
 }
 x.globalAlpha=1
 if(rain||weather==='snow'){x.strokeStyle='#e9f8ff';x.globalAlpha=.3;for(let i=0;i<100;i++){const a=i*113%1024,b=i*73%512;x.beginPath();x.moveTo(a,b);x.lineTo(a-2,b+(rain?12:2));x.stroke()}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t
}
