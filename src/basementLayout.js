export const BASEMENT_HEIGHT=-5.2
export const BASEMENT_STAIR={id:'basement',from:[3.5,0,-4.8],to:[12.7,BASEMENT_HEIGHT,-4.8],width:1.6,steps:32}
export const BASEMENT_OPENING=[3.48,12.75,-5.6,-4.0]
export const BASEMENT_BOUNDS=[7.4,26,-6.65,6.5]
export const BASEMENT_SOLIDS=[
 {id:'basement-sofa',rect:[9,15,3.55,5.25]},
 {id:'basement-table',rect:[10.35,13.65,1.9,3.1]},
 {id:'basement-fireplace',rect:[7.4,8.3,0,4.2]},
 {id:'basement-tub',rect:[20.05,24.15,2,4.2]},
 {id:'basement-vanity',rect:[24.8,26,-4.5,-1]},
 {id:'basement-towel-bench',rect:[21.7,24.4,-1.1,-.3]},
 {id:'basement-partition-south',rect:[17.8,18.05,1,6.5]},
 {id:'basement-partition-north',rect:[17.8,18.05,-6.65,-1.1]},
]
// Rectangular slabs around the same aperture used by the stair navigation.
export function cutFloor(bounds,hole=BASEMENT_OPENING){
 const [l,r,b,f]=bounds,[hl,hr,hb,hf]=hole
 const a=Math.max(l,hl),c=Math.min(r,hr),d=Math.max(b,hb),e=Math.min(f,hf)
 if(a>=c||d>=e)return [bounds]
 return [[l,a,b,f],[c,r,b,f],[a,c,b,d],[a,c,e,f]].filter(([l,r,b,f])=>r-l>.001&&f-b>.001)
}
