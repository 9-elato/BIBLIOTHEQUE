export const CAFE_SCALE=2.2/1.5/Math.sqrt(2)
export const cafeX=x=>-16+(x+16)*CAFE_SCALE
export const cafeZ=z=>22.25+(z-22.25)*CAFE_SCALE
export const cafeLocal=(x,z)=>[(x+16)/CAFE_SCALE-16,(z-22.25)/CAFE_SCALE+22.25]
export const CAFE_UPPER_LEVEL=7.2
export const cinemaCurtain={open:false,clear:false}
export function cinemaCurtainBlocks(x,z){const [a,b]=cafeLocal(x,z);return !cinemaCurtain.clear&&a> -25.15&&a< -20.85&&b>cinemaZ(38.5)&&b<cinemaZ(39.2)}
export const CAFE_STAIR={id:'cafe',from:[cafeX(-33.2),0,cafeZ(29.4)],to:[cafeX(-33.2),7.2,cafeZ(17)],width:2,steps:40}
// Annex depth is compressed independently; all physics and props use this mapping.
export const cinemaZ=z=>32+(z-32)*.65
export const CINEMA_LOCAL_CHAIRS=[[-25.2,27.9,0],[-20.8,27.9,0],[-28,24.1,.36],[-23,24.1,.36],[-18,24.1,.36]]
export const CINEMA_CHAIRS=CINEMA_LOCAL_CHAIRS.map(([x,z,level])=>({x:cafeX(x),z:cafeZ(cinemaZ(z+17)),level}))
export function cinemaGround(x,z){const [a,b]=cafeLocal(x,z),v=(b-32)/.65+15;return a>-33.65&&a<-16.35?.36*Math.max(0,Math.min(1,(v-22.2)/.8,(27.8-v)/.8)):0}
export const privateInside=(x,z)=>{const [a,b]=cafeLocal(x,z);return a>-33.8&&a< -16.35&&b>15.35&&b<30.65}
export function cinemaFloor(x,z){const [a,b]=cafeLocal(x,z);return privateInside(x,z)&&(a> -31.5||b<17.8)}

export const cinemaInside=(x,z)=>{const [a,b]=cafeLocal(x,z);return a>-33.65&&a<-16.35&&b>30.6&&b<cinemaZ(47.65)&&(b>32.35||(a>-30.77&&a<-29.23))}
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
export const cinemaSolids=[
 ...CINEMA_CHAIRS.map((s,i)=>({id:`cinema-recliner-${i}`,floor:s.level,rect:[s.x-.8,s.x+.8,s.z-1.13,s.z+1.32]})),
 ...[[-34,-25,38.7,39],[-21,-16,38.7,39],[-21.5,-17.5,33,34]].map((r,i)=>({id:'cinema-lobby-'+i,floor:0,rect:worldRect([r[0],r[1],cinemaZ(r[2]),cinemaZ(r[3])])})),
 ...[31,32].flatMap(z=>[[-34,-31,z-.12,z+.12],[-29,-16,z-.12,z+.12]].map((r,i)=>({id:'cinema-entry-'+z+'-'+i,floor:0,rect:worldRect(r)}))),...privateSolids]
