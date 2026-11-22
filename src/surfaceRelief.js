import * as THREE from 'three'
export function surfaceRelief(kind='stone'){
 const size=128,data=new Uint8Array(size*size*4)
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1
  const value=kind==='fabric'?178+18*Math.sin(x*Math.PI/2)*Math.cos(y*Math.PI/2)+noise*5:kind==='wood'?170+22*Math.sin(x*.34+Math.sin(y*.08)*2)+noise*8:183+noise*22+8*Math.sin(x*.13)*Math.cos(y*.17)
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,Math.round(value)));data[i+3]=255
 }
 const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='fabric'?5:3,kind==='wood'?2:5);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t
}
