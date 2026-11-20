// Prune whole hidden subtrees before raycasting (Three's recursive raycaster
// still visits invisible objects). Reuse the caller's array each check.
export function collectCameraObstacles(root, target = []) {
  target.length = 0
  function visit(node) {
    if (!node.visible || node.userData?.player) return
    if (node.isMesh && !node.material?.transparent) target.push(node)
    for (const child of node.children) visit(child)
  }
  visit(root)
  return target
}
