// Prune whole hidden subtrees before raycasting (Three's recursive raycaster
// still visits invisible objects). Reuse the caller's array each check.
const cameraBounds=new WeakMap()
function prepareBounds(mesh){
  const g=mesh.geometry,p=g?.attributes?.position
  if(!p||mesh.isSkinnedMesh||mesh.isInstancedMesh||g.morphAttributes.position?.length)return
  const old=cameraBounds.get(g)
  // Respect bounds supplied by the loader or another geometry owner.
  if(!old&&g.boundingBox)return
  if(!old||old.position!==p||old.version!==p.version){
    g.computeBoundingBox()
    if(old&&g.boundingSphere)g.computeBoundingSphere()
    cameraBounds.set(g,{position:p,version:p.version})
  }
}
export function collectCameraObstacles(root, target = []) {
  target.length = 0
  function visit(node) {
    if (!node.visible || node.userData?.player || node.userData?.noCameraCollision) return
    if (node.isMesh && !node.material?.transparent) {prepareBounds(node);target.push(node)}
    for (const child of node.children) visit(child)
  }
  visit(root)
  return target
}
