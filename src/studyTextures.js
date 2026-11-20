import * as THREE from 'three'
export function studyTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')
 if(kind==='wall'){
  c.fillStyle='#244237';c.fillRect(0,0,512,512)
  for(let y=0;y<512;y+=64)for(let x=0;x<512;x+=64){c.strokeStyle='#566b4c';c.lineWidth=1.2;c.beginPath();c.moveTo(x+32,y);c.bezierCurveTo(x+10,y+24,x+50,y+40,x+32,y+64);c.stroke();for(let i=0;i<3;i++){c.fillStyle=i%2?'#657650':'#4d674e';c.beginPath();c.ellipse(x+26+i%2*12,y+13+i*17,7,2,i%2?.6:-.6,0,Math.PI*2);c.fill()}}
 }else{
  c.fillStyle='#4b3023';c.fillRect(0,0,512,512);c.save();c.translate(256,256);c.rotate(Math.PI/4)
  const plank=(x,y,vertical,seed)=>{c.save();c.translate(x,y);if(vertical)c.rotate(Math.PI/2);c.fillStyle=['#694834','#77543b','#5c3d2c','#826044'][Math.abs(seed)%4];c.fillRect(0,0,95,23);c.strokeStyle='rgba(38,23,17,.24)';for(let k=0;k<4;k++){c.beginPath();c.moveTo(0,4+k*5);c.bezierCurveTo(30,k*5+1,60,k*5+8,95,k*5+3);c.stroke()}c.restore()}
  for(let a=-9;a<9;a++)for(let b=-35;b<35;b++){const x=(4*a+b)*24,y=(4*a-b)*24;plank(x,y,false,a+b);plank(x+120,y,true,a+b+1)}
  c.restore()
 }
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wall'?4:3,kind==='wall'?3:3);t.anisotropy=4;return t
}
