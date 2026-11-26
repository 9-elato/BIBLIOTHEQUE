export const CAFE_BOUNDS=[-34,-16,15,31]
export const CAFE_SEATS=[[-32,20],[-32,23],[-28,27],[-25,27],[-22,27],[-24,18.2],[-24,21.8],[-21.4,19.4]]
export const CAFE_SEAT_TURNS=[Math.PI/2,Math.PI/2,Math.PI,Math.PI,Math.PI,0,Math.PI,Math.PI]
export const CAFE_NOOKS=[
 {id:'north-return',p:[-25.05,.46,18.45],s:[.9,.34,1.25],c:'#d6c7b0'},
 {id:'south-return',p:[-25.05,.46,21.55],s:[.9,.34,1.25],c:'#d6c7b0'},
 {id:'north-screen',p:[-24.5,.82,17.51],s:[2.9,1.64,.12],c:'#87735c'},
 {id:'south-screen',p:[-24.5,.82,22.49],s:[2.9,1.64,.12],c:'#87735c'},
 {id:'hearth',p:[-21.4,.65,17.2],s:[1.35,1.3,.7],c:'#6a6358'},
 {id:'north-side-table',p:[-22.95,.35,18.8],s:[.55,.7,.7],c:'#947354'},
 {id:'south-side-table',p:[-22.95,.35,21.2],s:[.55,.7,.7],c:'#947354'},
 {id:'floor-table',p:[-20.3,.24,19.5],s:[.55,.48,.7],c:'#947354'},
]
export const CAFE_DISPLAY_Z=[17.5,19.4,21.3,23.2]
export const CAFE_SOLIDS=[
 {id:'goods-zone-divider',rect:[-25.06,-24.94,15.38,16.38]},
 ...CAFE_DISPLAY_Z.map(z=>({id:`cafe-genre-${z}`,rect:[-29.75,-28.25,z-.35,z+.35]})),
 {id:'cafe-wing-divider',rect:[-34,-30,24,24.47]},
 {id:'cafe-mailbox',rect:[-18.225,-17.375,23.725,23.975]},
 {id:'cinema-snack-console',rect:[-28.65,-23.35,29.97,30.73]},
 ...[20.7,23.8].map(z=>({id:`cafe-folded-door-${z}`,rect:[-17.075,-16.025,z-.05,z+.05]})),
 ...CAFE_NOOKS.map(({id,p:[x,y,z],s:[w,h,d]})=>({id,rect:[x-w/2,x+w/2,z-d/2,z+d/2]})),
 {id:'cafe-counter',rect:[-19.25,-16.55,16,20.5]},
 {id:'cafe-curation',rect:[-29.6,-25.5,15.4,16.3]},
 {id:'cafe-goods',rect:[-24.8,-20.5,15.4,16.3]},
 ...CAFE_SEATS.map(([x,z],i)=>({id:`cafe-seat-${i}`,rect:i<2?[x-.59,x+.59,z-.70,z+.70]:[x-.6,x+.6,z-.48,z+.48]})),
 {id:'cafe-window-counter',rect:[-33.7,-33.05,17.2,23.5]},
 {id:'cafe-divider-right',rect:[-19.6,-16,24,24.47]},
 {id:'cafe-divider',rect:[-30,-22,24,24.47]},
]
export function inCafe(x,z){return x>-34&&x<-16&&z>15&&z<31&&(x>-30||z<24.3)}
export function cafeWalk(x,z){
 if(x<=-34||x>=-12.75||z<=14.7||z>=31.3)return null
 // Keep the full avatar inside the garden path and clear of both doorway jambs.
 if(x>-16.4)return z>21+.23&&z<23.5-.23
 if(x<-33.65||z<15.35||z>30.65||(x<-29.65&&z>23.77))return false
 return !CAFE_SOLIDS.some(({rect:[l,r,b,f]})=>x>l-.23&&x<r+.23&&z>b-.23&&z<f+.23)
}
