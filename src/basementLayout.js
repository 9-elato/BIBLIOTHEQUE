export const BASEMENT_HEIGHT=-5.2
export const BASEMENT_STAIR={id:'basement',from:[3.5,0,-4.8],to:[12.7,BASEMENT_HEIGHT,-4.8],width:1.6,steps:32}
export const BASEMENT_OPENING=[3.48,12.75,-5.6,-4.0]
// Upper-floor guardrails around the basement stairwell, shared by rendering and collision.
export const BASEMENT_GROUND_GUARDS=[-1,1].map(side=>({
 id:`basement-ground-guard-${side}`,
 rect:[3.495,12.745,-4.8+side*.85-.035,-4.8+side*.85+.035],
}))
export const BASEMENT_BOUNDS=[7.4,26,-6.65,6.5]
export const SPRING_WALK_REGION=[18.1,26,6.2,18.3]
export const SPRING_POOL={x:22.1,z:8.6,rx:2.45,rz:7.2,barrier:[19.3,24.9,1.05,16.15]}
export const SPRING_BATH={id:'spring-bath',label:'숲 온천',level:BASEMENT_HEIGHT,height:-.72,turn:Math.PI/2,entry:{x:25.27,z:8.6},anchor:{x:23.85,z:8.6},bathing:true}
export const SPRING_LANTERNS=[[18.35,1],[25.85,1],[18.35,17.65],[25.85,17.65],[25.85,5],[25.85,13]]
export const BASEMENT_CEILING=-.30
export const BASEMENT_PORTAL={x:17.92,z:-.05,width:2.1,clearHeight:4.65}
export const SPRING_CURBS=[
 {id:'spring-rear-curb',rect:[18.2,26,18.12,18.38]},
 {id:'spring-west-curb',rect:[18.105,18.335,6.75,18.25]},
 {id:'spring-east-curb',rect:[25.735,25.965,6.75,18.25]},
]
export const BASEMENT_SOLIDS=[
 ...SPRING_CURBS,
 ...[2.6,16.8].map(z=>({id:'spring-canopy-post-'+z,rect:[25.78,25.92,z-.07,z+.07]})),
 {id:'basement-stairwell-north',rect:[3.5,12.75,-5.83,-5.65]},
 {id:'basement-stairwell-south',rect:[3.5,12.75,-3.95,-3.77]},
 ...SPRING_LANTERNS.map(([x,z],i)=>({id:'spring-lantern-'+i,rect:[x-.09,x+.09,z-.09,z+.09]})),
 {id:'basement-sofa',rect:[9,15,3.55,5.25]},
 {id:'basement-table',rect:[10.35,13.65,1.9,3.1]},
 {id:'basement-fireplace',rect:[7.4,8.3,0,4.2]},
 {id:'forest-spring-pool',rect:SPRING_POOL.barrier},
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
