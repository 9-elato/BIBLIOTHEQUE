import * as THREE from 'three'
// Small deterministic, tileable maps keep the existing soft geometry and colour palette.
export function makeStudyFinish(kind){
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size
 const c=canvas.getContext('2d'),pixels=c.createImageData(size,size)
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size*Math.PI*2,v=y/size*Math.PI*2
  const grain=Math.sin(v*32+Math.sin(u*2)*1.5+Math.sin(u*5)*.3)
  const pores=Math.sin(u*83)*Math.sin(v*79),wear=Math.sin(u*3+Math.sin(v*2))*Math.cos(v*5)
  const value=kind==='walnut'?216+grain*19+pores*3:kind==='leather'?222+pores*9+Math.pow(Math.max(0,Math.sin(v*5+Math.sin(u*3))),18)*-25:kind==='velvet'?230+pores*8+Math.sin(v*61)*5:220+wear*23+pores*4
  const n=(y*size+x)*4;pixels.data[n]=pixels.data[n+1]=pixels.data[n+2]=value;pixels.data[n+3]=255
 }
 c.putImageData(pixels,0,0)
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4
 const bumpMap=map.clone();bumpMap.colorSpace=THREE.NoColorSpace;bumpMap.needsUpdate=true
 const roughnessMap=map.clone();roughnessMap.colorSpace=THREE.NoColorSpace;roughnessMap.needsUpdate=true
 return {map,bumpMap,roughnessMap,bumpScale:kind==='walnut'?.008:kind==='leather'?.006:kind==='velvet'?.002:.0015,roughness:kind==='brass'?.5:kind==='leather'?.62:kind==='velvet'?.88:.7,...(kind==='velvet'?{sheen:.6,sheenColor:new THREE.Color('#c4b2a0'),sheenRoughness:.75}:{})}
}
export function disposeStudyFinishes(finishes){for(const f of Object.values(finishes))for(const v of Object.values(f))if(v?.isTexture)v.dispose()}
