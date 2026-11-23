import * as THREE from 'three'
import {seeded,windMaterial} from './vegetationWind.js'

// Weather changes select a precomputed palette; seeded geometry stays immutable.
export function createForestTreeAssets(trees,seed,uniforms){
  const random=seeded(seed),b=[],l=[],rootsB=[],rootsL=[],colors=[],snowColors=[],o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),c=new THREE.Color()
  const segment=(a,end,r,root)=>{const d=end.clone().sub(a);o.position.copy(a).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(up,d.clone().normalize());o.scale.set(r,d.length(),r);o.updateMatrix();b.push(o.matrix.clone());rootsB.push(...root)}
  for(const [x,y,z] of trees){
   const height=4+random()*6,radius=.12+random()*.24,root=[x,y,z,height],lean=(random()-.5)*.7
   segment(new THREE.Vector3(x,y,z),new THREE.Vector3(x+lean,y+height,z),radius,root)
   const branchCount=5+Math.floor(random()*4)
   for(let j=0;j<branchCount;j++){
    const a=j*2.4+random(),level=.36+j/branchCount*.5,length=(.8+random()*1.2)*(1-level*.45)
    const base=new THREE.Vector3(x+lean*level,y+height*level,z),tip=base.clone().add(new THREE.Vector3(Math.cos(a)*length,height*.15,Math.sin(a)*length))
    segment(base,tip,radius*(.25+random()*.2),root)
    const amount=28+Math.floor(random()*28)
    for(let k=0;k<amount;k++){
     const angle=random()*Math.PI*2,r=Math.sqrt(random())*1.25
     o.position.copy(tip).add(new THREE.Vector3(Math.cos(angle)*r,(random()-.4)*1.5,Math.sin(angle)*r))
     o.rotation.set((random()-.5)*1.4,random()*Math.PI*2,(random()-.5)*.8)
     o.scale.set(.16+random()*.22,.23+random()*.28,.7+random()*.6);o.updateMatrix();l.push(o.matrix.clone());rootsL.push(...root)
     const hue=.24+random()*.09,saturation=.30+random()*.30,lightness=random()*.17,shade=.72+.28*Math.min(1,r)
     c.setHSL(hue,saturation,.21+lightness).multiplyScalar(shade);colors.push(c.clone())
     c.setHSL(hue,saturation,.65+lightness).multiplyScalar(shade);snowColors.push(c.clone())
    }
   }
  }
  // Interleave trees so reducing the draw count never erases an entire tree.
  for(let i=l.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[l[i],l[j]]=[l[j],l[i]];[colors[i],colors[j]]=[colors[j],colors[i]];[snowColors[i],snowColors[j]]=[snowColors[j],snowColors[i]];for(let k=0;k<4;k++){const a=i*4+k,b=j*4+k;[rootsL[a],rootsL[b]]=[rootsL[b],rootsL[a]]}}
  const bg=new THREE.CylinderGeometry(.55,1,1,6);bg.setAttribute('plantRoot',new THREE.InstancedBufferAttribute(new Float32Array(rootsB),4))
  // Cupped individual leaf: a raised center vein gives front/back lighting variation.
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute([0,-1,0,-.62,-.2,0,-.48,.45,0,0,1,0,.48,.45,0,.62,-.2,0,0,0,.19],3));lg.setIndex([0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6]);lg.computeVertexNormals();lg.setAttribute('plantRoot',new THREE.InstancedBufferAttribute(new Float32Array(rootsL),4))
  const bm=windMaterial('branch',uniforms),lm=windMaterial('leaf',uniforms),bd=windMaterial('branch',uniforms,true),ld=windMaterial('leaf',uniforms,true)
  const pack=list=>{const array=new Float32Array(list.length*3);list.forEach((color,i)=>color.toArray(array,i*3));return array}
  return {b,l,colors:pack(colors),snowColors:pack(snowColors),bg,lg,bm,lm,bd,ld}
}
