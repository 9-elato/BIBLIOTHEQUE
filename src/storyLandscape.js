import {CanvasTexture,SRGBColorSpace} from 'three'
// One painted view per climate, shared across windows; no reflection render pass.
export function paintLandscape({time,weather,event,season,celestial,variant=0}){
 const c=document.createElement('canvas');c.width=768;c.height=1024
 const x=c.getContext('2d'),W=c.width,H=c.height,night=time==='night',dusk=time==='evening',dark=night||dusk,snow=weather==='snow',rain=weather==='rain'
 const rand=i=>{const n=Math.sin(i*127.1+31.7+variant*91.3)*43758.5453;return n-Math.floor(n)}
 const grad=x.createLinearGradient(0,0,0,H);grad.addColorStop(0,night?'#142a49':dusk?'#665d88':rain?'#738b9e':'#7eb9d5');grad.addColorStop(.6,night?'#6c7d99':dusk?'#efbd9f':'#f0e6c6');grad.addColorStop(1,'#8caa85');x.fillStyle=grad;x.fillRect(0,0,W,H)
 const ellipse=(a,b,rx,ry,color)=>{x.fillStyle=color;x.beginPath();x.ellipse(a,b,rx,ry,0,0,Math.PI*2);x.fill()}
 if(celestial){ellipse(560,180,48,48,dark?'#fff0cb':'#ffe8b3');if(night){ellipse(579,166,44,44,'#182e4c');for(let i=0;i<70;i++)ellipse(rand(i)*W,rand(i+80)*420,1+rand(i+90)*1.6,1.8,'#fff5d7')}}
 x.globalAlpha=rain?.45:.25
 for(let i=0;i<14;i++){const a=rand(i+150)*W,b=80+rand(i+180)*310;for(let j=0;j<4;j++)ellipse(a+j*28,b+Math.sin(j)*10,55,16,dark?'#c0c1d1':'#ffffff')}
 x.globalAlpha=1
 for(let layer=0;layer<4;layer++){
  const base=460+layer*115;x.fillStyle=(dark?['#65708b','#4f6679','#344f59','#233f40']:snow?['#a6bdc9','#bdccd0','#cbd8cd','#e0e6d7']:['#a4b6b4','#8ea8a0','#729486','#507966'])[layer]
  x.beginPath();x.moveTo(0,H);for(let a=0;a<=W;a+=8)x.lineTo(a,base+Math.sin(a*.007+layer*1.8)*55+Math.sin(a*.017+layer)*16);x.lineTo(W,H);x.fill()
 }
 // A winding stream catches the sky, with a little stone bridge.
 x.strokeStyle=dark?'#8799b2':'#bad7d6';x.lineWidth=19;x.beginPath();x.moveTo(450,630);x.bezierCurveTo(170,760,650,800,350,1024);x.stroke()
 x.strokeStyle=dark?'#64636c':'#d5c5a5';x.lineWidth=12;x.beginPath();x.moveTo(330,805);x.quadraticCurveTo(398,755,455,795);x.stroke()
 for(let i=0;i<10;i++){
  const a=100+rand(i+250)*560,b=650+rand(i+270)*95,w=23+rand(i+300)*17
  x.fillStyle=dark?'#746c69':'#e2c7a3';x.fillRect(a,b,w,36)
  x.fillStyle=snow?'#f4eadd':i%2?'#725762':'#596c77';x.beginPath();x.moveTo(a-5,b);x.lineTo(a+w/2,b-27);x.lineTo(a+w+5,b);x.fill()
  x.fillStyle=dark?'#ffda8c':'#647580';x.fillRect(a+5,b+11,7,11);x.fillRect(a+w-12,b+11,7,11)
  x.fillStyle='#75695c';x.fillRect(a+w-8,b-25,5,19)
 }
 for(let i=0;i<38;i++){
  const a=rand(i+350)*W,b=710+rand(i+390)*300,h=35+rand(i+430)*95
  x.fillStyle=dark?'#304b49':'#665d43';x.fillRect(a-2,b-h*.6,4,h*.6)
  const color=snow?'#dce5dc':dark?'#284d49':season==='autumn'?(i%2?'#b48c55':'#8d7751'):i%2?'#557c5b':'#789368'
  for(let j=0;j<3;j++)ellipse(a+(j-1)*h*.16,b-h*.65-(j%2)*h*.24,h*.26,h*.32,color)
 }
 // Foreground flowers, reeds, fireflies and holiday accents.
 for(let i=0;i<65;i++){
  const a=rand(i+500)*W,b=925+rand(i+580)*100;x.strokeStyle=dark?'#45614e':'#81916a';x.lineWidth=2;x.beginPath();x.moveTo(a,b);x.lineTo(a-3,b-15);x.stroke()
  ellipse(a-3,b-16,2.5,3,snow?'#f7f3e4':dark?'#f2d28b':i%2?'#e2c5d3':'#f0dfaa')
 }
 if(event==='halloween')for(let i=0;i<5;i++)ellipse(85+i*145,960,14,11,'#dc9147')
 if(event==='christmas')for(let i=0;i<24;i++)ellipse(rand(i+680)*W,750+rand(i+710)*210,3,3,i%2?'#f5d495':'#dca18d')
 if(rain||snow){x.globalAlpha=.65;for(let i=0;i<110;i++){const a=rand(i+800)*W,b=rand(i+950)*H;if(snow)ellipse(a,b,2+rand(i)*2,3,'#fffaf1');else{x.strokeStyle='#d7e6e9';x.lineWidth=1;x.beginPath();x.moveTo(a,b);x.lineTo(a-5,b+20);x.stroke()}}x.globalAlpha=1}
 const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t
}
