import * as THREE from 'three'
export function makeAtticTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256
 const c=canvas.getContext('2d')
 c.fillStyle=kind==='wood'?'#a17a54':kind==='fabric'?'#e6dcc3':'#e5dfcc';c.fillRect(0,0,256,256)
 if(kind==='wood'){
  for(let i=0;i<100;i++){c.strokeStyle=`rgba(60,34,21,${.04+(i%5)*.018})`;c.lineWidth=.4+i%3*.3;c.beginPath();for(let y=0;y<=256;y+=4){const x=i*2.67+Math.sin(y*.036+i)*1.6+Math.sin(y*.014+i*.3)*3;y?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
  for(let i=0;i<4;i++){c.strokeStyle='rgba(60,34,21,.16)';c.beginPath();c.ellipse(44+i*54,70+(i%2)*105,3+i,17+i*2,.08,0,Math.PI*2);c.stroke()}
 }else if(kind==='fabric'){
  for(let i=0;i<256;i+=3){c.strokeStyle=i%2?'#c9bfa9':'#f1e8d4';c.globalAlpha=.35;c.beginPath();c.moveTo(i,0);c.lineTo(i,256);c.moveTo(0,i);c.lineTo(256,i);c.stroke()}c.globalAlpha=1
 }else{
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=col*64+32,y=row*64+32;c.strokeStyle='#a2ad90';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y+22);c.quadraticCurveTo(x-15,y,x,y-22);c.stroke();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.fillStyle='#b99896';c.beginPath();c.ellipse(x+Math.cos(a)*5,y+Math.sin(a)*5,3,5,a,0,Math.PI*2);c.fill()}c.fillStyle='#bba779';c.fillRect(x-1,y-1,2,2);c.fillStyle='#94a184';c.beginPath();c.ellipse(x-5,y+11,6,2,-.5,0,Math.PI*2);c.fill()}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.repeat.set(kind==='wallpaper'?3:2,kind==='wallpaper'?2:3);texture.anisotropy=4;return texture
}

export function makeRoofPlanks(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')
 for(let board=0;board<8;board++){
  c.fillStyle=['#98724f','#8b674a','#a17d59','#947152'][board%4];c.fillRect(board*64,0,64,512)
  c.fillStyle='#4e3829';c.fillRect(board*64,0,2,512);c.fillStyle='rgba(226,196,151,.32)';c.fillRect(board*64+3,0,1,512)
  for(let k=0;k<28;k++){c.strokeStyle=`rgba(54,32,19,${.10+(k%4)*.035})`;c.lineWidth=.6;c.beginPath();for(let y=0;y<=512;y+=5){const x=board*64+5+k*2+Math.sin(y*.022+k)*1.3+Math.sin(y*.009+board)*2;y?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
  c.strokeStyle='#62472f';for(let r=1;r<5;r++){c.beginPath();c.ellipse(board*64+30,80+(board*79)%350,r*1.8,r*5,0,0,Math.PI*2);c.stroke()}
  const joint=board%2?160:370;c.fillStyle='#60452f';c.fillRect(board*64,joint,64,1.5)
  for(const y of [joint-8,joint+8])for(const x of [8,55]){c.fillStyle='#45372c';c.beginPath();c.arc(board*64+x,y,1.3,0,Math.PI*2);c.fill()}
 }
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=4;return t
}
export function makeChalkboard(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;const c=canvas.getContext('2d')
 c.fillStyle='#171a1c';c.fillRect(0,0,1024,768)
 for(let i=0;i<85;i++){c.fillStyle=`rgba(215,219,209,${.012+(i%4)*.004})`;c.fillRect((i*79)%1024,(i*47)%768,90+i%80,9)}
 const line=pts=>{for(let pass=0;pass<3;pass++){c.strokeStyle=pass?'rgba(240,238,220,.25)':'rgba(240,238,220,.84)';c.lineWidth=pass?1:2.6;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x+Math.sin(i+pass)*1.5,y):c.moveTo(x,y));c.stroke()}}
 c.font='italic 35px Georgia';c.fillStyle='#e2e2d6';c.fillText('A little closer to the stars...',48,65)
 const stars=[[90,180],[170,138],[240,212],[327,162],[395,262],[475,230]];line(stars)
 stars.forEach(([x,y],i)=>{line([[x-8,y],[x+8,y]]);line([[x,y-8],[x,y+8]]);c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill()})
 c.font='italic 21px Georgia';c.fillText('our evening constellation',87,309)
 // A hand-drawn telescope, tripod and observer peering into the eyepiece.
 line([[560,380],[708,290],[732,329],[583,416],[560,380]]);line([[632,389],[630,447],[572,565]]);line([[630,447],[700,563]]);line([[630,447],[628,580]])
 line([[554,401],[526,418],[535,434],[574,412]])
 c.strokeStyle='#e9e9dc';c.lineWidth=3;c.beginPath();c.arc(493,429,28,0,Math.PI*2);c.stroke();line([[487,458],[469,515],[438,572]]);line([[469,515],[500,570]]);line([[482,477],[526,436]])
 line([[755,278],[826,208],[874,155]]);line([[868,171],[874,155],[855,160]])
 c.beginPath();c.arc(869,117,40,.35,5.8);c.stroke();c.beginPath();c.arc(889,108,34,1.4,4.6);c.stroke()
 for(let i=0;i<24;i++){const x=62+(i*83)%880,y=350+(i*47)%300;if(x>400&&x<740)continue;line([[x-4,y],[x+4,y]]);line([[x,y-4],[x,y+4]])}
 c.font='italic 25px Georgia';c.fillText('look up!',754,355);c.fillText('moon + tea + one more chapter',73,701)
 for(let i=0;i<1600;i++){c.fillStyle='rgba(20,23,25,.24)';c.fillRect((i*179)%1024,(i*113)%768,1,2)}
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t
}
