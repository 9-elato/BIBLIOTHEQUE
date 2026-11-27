export const CAFE_SCALE=2.2
export const cafeX=x=>-16+(x+16)*CAFE_SCALE
export const cafeZ=z=>22.25+(z-22.25)*CAFE_SCALE
export const cafeLocal=(x,z)=>[(x+16)/CAFE_SCALE-16,(z-22.25)/CAFE_SCALE+22.25]
export const CAFE_UPPER_LEVEL=7.2
export const cinemaCurtain={open:false,clear:false}
export function cinemaCurtainBlocks(x,z){const [a,b]=cafeLocal(x,z);return !cinemaCurtain.clear&&a> -25.15&&a< -20.85&&b>38.5&&b<39.2}
export const CAFE_STAIR={id:'cafe',from:[cafeX(-33.2),0,cafeZ(29.4)],to:[cafeX(-33.2),7.2,cafeZ(17)],width:2,steps:40}
export const CINEMA_CHAIRS=[-28,-25.5,-23,-20.5,-18].map(x=>({x:cafeX(x),z:cafeZ(44),level:0}))
export const privateInside=(x,z)=>{const [a,b]=cafeLocal(x,z);return a>-33.8&&a< -16.35&&b>15.35&&b<30.65}
const oldCinemaSolids=[
 ...CINEMA_CHAIRS.map((s,i)=>({id:`cinema-recliner-${i}`,floor:7.2,rect:[s.x-.8,s.x+.8,s.z-37.4-1.05,s.z-37.4+1.05]})),
 ...[-29.35,-26.75,-24.25,-21.75,-19.25,-16.7].map(x=>({id:`cinema-privacy-${x}`,floor:7.2,rect:[cafeX(x)-.08,cafeX(x)+.08,cafeZ(25.8),cafeZ(28.3)]})),
 ...[[-34,-25,21.7,22],[-21,-16,21.7,22],[-30,-26,16,17]].map((r,i)=>({id:`cinema-lobby-${i}`,floor:7.2,rect:[cafeX(r[0]),cafeX(r[1]),cafeZ(r[2]),cafeZ(r[3])]})),
 // The stairwell has a real opening; guards keep the upstairs route off its sides.
 {id:'cinema-stair-guard',floor:7.2,rect:[cafeX(-31.7),cafeX(-31.55),cafeZ(17.8),cafeZ(30.8)]},
]
export function cinemaFloor(x,z){const [a,b]=cafeLocal(x,z);return privateInside(x,z)&&(a> -31.5||b<17.8)}

export const cinemaInside=(x,z)=>{const [a,b]=cafeLocal(x,z);return a>-33.65&&a<-16.35&&b>30.6&&b<47.65&&(b>32.35||(a>-30.77&&a<-29.23))}
export const PRIVATE_ROOMS=[-28.5,-24.5,-20.5].map((x,i)=>({id:'cafe-private-'+i,name:'Room '+(i+1),x,z:18.5,level:7.2}))
const worldRect=r=>[cafeX(r[0]),cafeX(r[1]),cafeZ(r[2]),cafeZ(r[3])]
export const privateSolids=[
 ...[-30.5,-26.5,-22.5,-18.5].map(x=>({id:'private-wall-'+x,floor:7.2,rect:worldRect([x-.07,x+.07,15,22])})),
 ...PRIVATE_ROOMS.flatMap(r=>[
 ...[[r.x-2,r.x-.7,21.92,22.08],[r.x+.7,r.x+2,21.92,22.08]].map((rect,i)=>({id:r.id+'-entry-'+i,floor:7.2,rect:worldRect(rect)})),
 {id:r.id,floor:7.2,rect:[cafeX(r.x)-.65,cafeX(r.x)+.65,cafeZ(r.z)-.65,cafeZ(r.z)+.65]},
 {id:r.id+'-table',floor:7.2,rect:[cafeX(r.x)+1.1,cafeX(r.x)+1.9,cafeZ(r.z)-.4,cafeZ(r.z)+.4]},
 {id:r.id+'-foot',floor:7.2,rect:[cafeX(r.x)-.5,cafeX(r.x)+.5,cafeZ(r.z)-1.65,cafeZ(r.z)-1.05]}
 ]),
 {id:'private-stair-guard',floor:7.2,rect:worldRect([-31.7,-31.55,17.8,30.8])},
]
export const cinemaSolids=[...oldCinemaSolids.filter(s=>s.id!=='cinema-stair-guard').map(s=>({...s,floor:0,rect:[s.rect[0],s.rect[1],s.rect[2]+37.4,s.rect[3]+37.4]})),
 ...[31,32].flatMap(z=>[[-34,-31,z-.12,z+.12],[-29,-16,z-.12,z+.12]].map((r,i)=>({id:'cinema-entry-'+z+'-'+i,floor:0,rect:worldRect(r)}))),...privateSolids]
