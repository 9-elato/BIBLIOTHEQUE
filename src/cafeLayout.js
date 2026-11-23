export const CAFE_BOUNDS=[-30,-16,15,31]
export const CAFE_SEATS=[[-28,20],[-28,23],[-28,27],[-25,27],[-22,27]]
export const CAFE_SOLIDS=[
 {id:'cafe-counter',rect:[-19.25,-16.55,16,20.5]},
 {id:'cafe-curation',rect:[-29.6,-25.5,15.4,16.3]},
 {id:'cafe-goods',rect:[-24.8,-20.5,15.4,16.3]},
 ...CAFE_SEATS.map(([x,z],i)=>({id:`cafe-seat-${i}`,rect:[x-.6,x+.6,z-.48,z+.48]})),
 {id:'cafe-table',rect:[-26.7,-25.3,20,21.1]},
 {id:'cafe-divider',rect:[-30,-22,24,24.47]},
]
export function inCafe(x,z){return x>-30&&x<-16&&z>15&&z<31}
export function cafeWalk(x,z){
 if(x<=-30||x>=-12.75||z<=14.7||z>=31.3)return null
 // Keep the full avatar inside the garden path and clear of both doorway jambs.
 if(x>-16.4)return z>21+.23&&z<23.5-.23
 if(x<-29.65||z<15.35||z>30.65)return false
 return !CAFE_SOLIDS.some(({rect:[l,r,b,f]})=>x>l-.23&&x<r+.23&&z>b-.23&&z<f+.23)
}
