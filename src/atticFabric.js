import * as THREE from 'three'
// Closed padded cloth: separate top/bottom surfaces and a stitched-looking rim.
export function paddedCloth(width,length,thickness=.16,chair=false){
 const nx=32,nz=28,positions=[],uvs=[],indices=[]
 for(let layer=0;layer<2;layer++)for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const u=i/nx,v=j/nz,x=(u-.5)*width
  let y,z
  if(chair){z=-.33+Math.min(v/.7,1)*.9;y=v<.4?1.7-v/.4*.85:v<.7?.85-(v-.4)/.3*.14:.71-(v-.7)/.3*.45}
  else {z=(v-.5)*length;y=.09*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)-.17*Math.pow(Math.abs(2*u-1),8)}
  const folds=Math.sin(u*28+v*4)*.018+Math.sin(v*19+u*5)*.015
  const quilting=chair?0:.025*Math.sin(u*Math.PI*6)**2*Math.sin(v*Math.PI*7)**2
  positions.push(x,y+folds+quilting-layer*thickness,z);uvs.push(u,v)
 }
 const count=(nx+1)*(nz+1)
 for(let layer=0;layer<2;layer++)for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const a=layer*count+j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1
  indices.push(...(layer?[a,b,c,b,d,c]:[a,c,b,b,c,d]))
 }
 const edge=[];for(let i=0;i<=nx;i++)edge.push(i);for(let j=1;j<=nz;j++)edge.push(j*(nx+1)+nx);for(let i=nx-1;i>=0;i--)edge.push(nz*(nx+1)+i);for(let j=nz-1;j>0;j--)edge.push(j*(nx+1))
 edge.forEach((a,i)=>{const b=edge[(i+1)%edge.length];indices.push(a,b,a+count,b,b+count,a+count)})
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g
}
export function pillowGeometry(){
 const g=new THREE.SphereGeometry(1,40,24),p=g.attributes.position
 const shape=x=>Math.sign(x)*Math.pow(Math.abs(x),.48)
 for(let i=0;i<p.count;i++){let x=shape(p.getX(i))*.46,y=shape(p.getY(i))*.17,z=shape(p.getZ(i))*.34;y-=Math.max(0,p.getY(i))*.045*Math.exp(-(x*x+z*z)*22);y+=.009*Math.sin(x*38+z*6)*Math.abs(z)/.34;p.setXYZ(i,x,y,z)}
 g.computeVertexNormals();return g
}
