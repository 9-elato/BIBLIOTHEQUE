// The long gallery is the stem; the last bay opens into a transverse reading hall.
export const stacksWing=end=>({left:end-1,right:end+12,back:-16,front:16,doorZ:0,doorHalf:2.3})
export function wingWalk(x,z,end){
 const w=stacksWing(end)
 if(x<w.left-.3)return null
 if(x>w.right+.35)return null
 if(wingFurnitureBlocks(x,z,end))return false
 if(x>w.right-.3)return Math.abs(z)<w.doorHalf-.3
 if(x<w.left+.3&&Math.abs(z)>5.5)return false
 if(x>w.right-1.1&&Math.abs(z)>4)return false
 return z>w.back+.3&&z<w.front-.3
}

// Furniture dimensions are shared by rendering, seat anchors and collision.
export const WING_FURNITURE=[
 {id:'wing-sofa',label:'서가 긴 소파',kind:'sofa',x:3,z:11,w:3.4,d:1.5,height:.68,turn:Math.PI},
 {id:'wing-beanbag',label:'서가 빈백',kind:'beanbag',x:7,z:9,w:1.6,d:1.6,height:.42,turn:Math.PI},
 {id:'wing-floor',label:'서가 바닥 방석',kind:'floor',x:3,z:-10,w:1.3,d:1.3,height:.17,turn:0},
 {id:'wing-window',label:'서가 창가 좌석',kind:'window',x:7,z:-14.6,w:3.6,d:1.1,height:.62,turn:0},
]
export function wingFurnitureBlocks(x,z,end){return WING_FURNITURE.some(s=>Math.abs(x-end-s.x)<s.w/2+.23&&Math.abs(z-s.z)<s.d/2+.23)}
