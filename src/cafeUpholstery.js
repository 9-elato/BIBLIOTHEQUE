import * as THREE from 'three'
// Small shared weave maps: no per-cushion canvas, downloads or animation work.
function weaveTexture(velvet){
 const size=64,pixels=new Uint8Array(size*size*4)
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const warp=Math.sin(x*Math.PI/2),weft=Math.cos(y*Math.PI/2)
  const value=Math.round(velvet?128+7*warp+3*weft:128+22*warp+17*weft+8*warp*weft)
  pixels.set([value,value,value,255],(y*size+x)*4)
 }
 const map=new THREE.DataTexture(pixels,size,size);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(7,7);map.needsUpdate=true;return map
}
const linen=weaveTexture(false),velvet=weaveTexture(true),materials=new Map()
export function upholstery(color,type='linen'){
 const key=type+color
 if(!materials.has(key))materials.set(key,new THREE.MeshPhysicalMaterial({color,roughness:type==='velvet'?.88:.98,sheen:1,sheenColor:new THREE.Color(color).lerp(new THREE.Color('#ece2cf'),.22),sheenRoughness:.86,bumpMap:type==='velvet'?velvet:linen,bumpScale:type==='velvet'?.0025:.004}))
 return materials.get(key)
}
