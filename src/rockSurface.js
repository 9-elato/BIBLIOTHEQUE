import * as THREE from 'three'
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js'
export function rockGeometry({position=[0,0,0],scale=[1,1,1],seed=1,waterLevel=-100,moss=false}){
 const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position,colors=[],wet=[],c=new THREE.Color(),base=new THREE.Color().setHSL(.10+(Math.sin(seed)*.5+.5)*.06,.07+.04*Math.cos(seed),.29+.08*Math.sin(seed*2.3))
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i)
  // Coordinate noise keeps shared triangle edges welded; no random vertex cracks.
  const erosion=Math.sin(x*5+seed)*Math.cos(z*4-seed)*.09+Math.sin(y*7+x*3+seed)*.04
  const r=1+erosion,wear=.82+.12*(.5+.5*Math.sin(seed))
  const yy=Math.max(-wear,y*r),xx=x*r*(1+.09*Math.sin(y*3+seed)),zz=z*r
  p.setXYZ(i,position[0]+xx*scale[0],position[1]+yy*scale[1],position[2]+zz*scale[2])
  const damp=THREE.MathUtils.clamp((waterLevel+.28-p.getY(i))/.45,0,1)
  wet.push(damp);c.copy(base).multiplyScalar((.91+.13*Math.sin(x*12+z*8+seed))*(1-.34*damp))
  if(moss&&y>.32&&Math.sin(x*8+z*6+seed)>.05)c.lerp(new THREE.Color('#536b38'),.72)
  colors.push(c.r,c.g,c.b)
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('stoneWet',new THREE.Float32BufferAttribute(wet,1))
 g.deleteAttribute('normal');g.deleteAttribute('uv');const smooth=mergeVertices(g);g.dispose();smooth.computeVertexNormals();return smooth
}
export function rockFieldGeometry(rocks){const pieces=rocks.map(rockGeometry),g=mergeGeometries(pieces);pieces.forEach(p=>p.dispose());g.computeBoundingSphere();return g}
export function rockMaterial(){
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94})
 m.onBeforeCompile=s=>{
  s.vertexShader='attribute float stoneWet;varying float vStoneWet;varying vec3 vStonePosition;\n'+s.vertexShader
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStoneWet=stoneWet;vStonePosition=position;')
  s.fragmentShader='varying float vStoneWet;varying vec3 vStonePosition;\n'+s.fragmentShader
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float grain=sin(vStonePosition.x*137.)*sin(vStonePosition.y*121.+vStonePosition.z*93.);
   float seam=abs(sin(vStonePosition.x*6.+sin(vStonePosition.z*9.)+vStonePosition.y*4.));
   float crack=1.-smoothstep(.015,.065,seam);
   diffuseColor.rgb*=1.-crack*.16+grain*.035;`)
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 groove=vec3(cos(vStonePosition.x*137.)*sin(vStonePosition.z*93.),sin(vStonePosition.y*121.),cos(vStonePosition.z*93.)*sin(vStonePosition.x*137.));
   vec3 grooveView=mat3(viewMatrix)*groove;
   normal=normalize(normal+(grooveView-normal*dot(normal,grooveView))*.055*(1.-vStoneWet*.6));`)
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.94,.24,vStoneWet);')
 }
 m.customProgramCacheKey=()=> 'eroded-wet-stone-v1';return m
}
