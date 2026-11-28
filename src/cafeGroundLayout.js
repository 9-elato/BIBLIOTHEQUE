// All cafe floors meet edge-to-edge at y=0; no coplanar slabs at the doorway.
export const CAFE_FLOOR_TILES=[
 {id:'interior',rect:[-34,-16,15,31],color:'#9a7955'},
 {id:'terrace',rect:[-16,-12.8,15,31],color:'#a28a6b'},
 {id:'threshold',rect:[-12.8,-12,21,23.5],color:'#bca887'},
]
export const CAFE_GARDEN_BOUNDS=[-38,-35.1,13.5,32]
export function cafeGardenHeight(x,z){
 // Flush at the coast and at the meadow, gently raised within the planting strip.
 const u=Math.max(0,Math.min(1,(x+38)/2.9)),v=Math.max(0,Math.min(1,(z-13.5)/18.5))
 return -.035+.13*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)
}
export const CAFE_GARDEN_TREES=Array.from({length:7},(_,i)=>{
 const x=-36.8+Math.sin(i*2.1)*.45,z=14.6+i*2.55
 return [x,cafeGardenHeight(x,z),z]
})
