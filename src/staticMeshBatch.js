import {Color,Float32BufferAttribute,Matrix4,Mesh,Vector3} from 'three'
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js'

// Explicitly static decoration only: animated objects and interactive props
// remain outside these groups. Small spatial cells preserve frustum culling.
export function batchStaticMeshes(root){
 root.updateWorldMatrix(true,true)
 const inverse=new Matrix4().copy(root.matrixWorld).invert(),matrix=new Matrix4(),center=new Vector3(),color=new Color(),groups=new Map(),hidden=[],created=[]
 const staticObjects=[]
 function collect(node){if(!node.visible||node.userData.noBatch)return;staticObjects.push(node);for(const child of node.children)collect(child)}
 collect(root)
 for(const object of staticObjects){
  const m=object.material,g=object.geometry
  if(!object.isMesh||object.isInstancedMesh||object.isSkinnedMesh||object.isTroikaText||!m?.isMeshStandardMaterial||m.isMeshPhysicalMaterial||m.transparent||m.normalMap||!g?.attributes.normal||g.morphAttributes.position?.length)continue
  matrix.multiplyMatrices(inverse,object.matrixWorld);center.setFromMatrixPosition(matrix)
  const key=[Math.floor(center.x/8),Math.floor(center.y/6),Math.floor(center.z/8),m.roughness,m.metalness,m.map?.uuid,m.bumpMap?.uuid,m.bumpScale,m.emissive.getHex(),m.emissiveIntensity,m.side,m.alphaTest,m.depthWrite,object.castShadow,object.receiveShadow].join('|')
  if(!groups.has(key))groups.set(key,{material:m,objects:[],geometries:[]})
  const entry=groups.get(key),copy=g.index?g.toNonIndexed():g.clone()
  copy.applyMatrix4(matrix)
  // These material types use position/normal/uv/color; normalize attributes.
  for(const name of Object.keys(copy.attributes))if(!['position','normal','uv','color'].includes(name))copy.deleteAttribute(name)
  if(!copy.attributes.uv)copy.setAttribute('uv',new Float32BufferAttribute(new Float32Array(copy.attributes.position.count*2),2))
  const old=copy.attributes.color,colors=new Float32Array(copy.attributes.position.count*3)
  for(let i=0;i<copy.attributes.position.count;i++){
   color.copy(m.color)
   if(m.vertexColors&&old)color.multiply(new Color(old.getX(i),old.getY(i),old.getZ(i)))
   color.toArray(colors,i*3)
  }
  copy.setAttribute('color',new Float32BufferAttribute(colors,3));copy.clearGroups()
  entry.objects.push(object);entry.geometries.push(copy)
 }
 for(const {material,objects,geometries} of groups.values()){
  if(objects.length<2){geometries.forEach(g=>g.dispose());continue}
  const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose())
  if(!merged)continue
  const mat=material.clone();mat.color.set('white');mat.vertexColors=true
  const mesh=new Mesh(merged,mat);mesh.castShadow=objects[0].castShadow;mesh.receiveShadow=objects[0].receiveShadow;mesh.name='Static decoration batch'
  merged.computeBoundingBox();merged.computeBoundingSphere();root.add(mesh);created.push(mesh)
  for(const object of objects){object.visible=false;hidden.push(object)}
 }
 return {sourceCount:hidden.length,batchCount:created.length,dispose(){for(const mesh of created){root.remove(mesh);mesh.geometry.dispose();mesh.material.dispose()}for(const object of hidden)object.visible=true}}
}
