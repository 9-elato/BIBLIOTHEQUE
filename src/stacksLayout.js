// The long gallery is the stem; the last bay opens into a transverse reading hall.
export const stacksWing=end=>({left:end-1,right:end+8,back:-12,front:12,doorZ:0,doorHalf:2.3})
export function wingWalk(x,z,end){
 const w=stacksWing(end)
 if(x<w.left-.3)return null
 if(x>w.right+.35)return null
 if(x>w.right-.3)return Math.abs(z)<w.doorHalf-.3
 if(x<w.left+.3&&Math.abs(z)>5.5)return false
 if(x>w.right-1.1&&Math.abs(z)>4)return false
 return z>w.back+.3&&z<w.front-.3
}
