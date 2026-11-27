import {CAFE_SCALE,cafeX,cafeZ,cafeLocal,cinemaInside} from './cafeExpansion.js'
export const CAFE_BOUNDS=[cafeX(-34),-16,cafeZ(15),cafeZ(31)]
export const CAFE_LOCAL_SEATS=[[-32,20],[-32,23],[-24,18.2],[-24,21.8],[-21.4,19.4]]
export const CAFE_SEATS=CAFE_LOCAL_SEATS.map(([x,z])=>[cafeX(x),cafeZ(z)])
export const CAFE_SEAT_TURNS=[-Math.PI/2,-Math.PI/2,0,Math.PI,Math.PI]
export const CAFE_NOOKS=[
 {id:'north-return',p:[-25.05,.46,18.45],s:[.9,.34,1.25],c:'#e4dac9'},
 {id:'south-return',p:[-25.05,.46,21.55],s:[.9,.34,1.25],c:'#e4dac9'},
 {id:'north-screen',p:[-24.5,.82,17.51],s:[2.9,1.64,.12],c:'#292b29'},
 {id:'south-screen',p:[-24.5,.82,22.49],s:[2.9,1.64,.12],c:'#292b29'},
 {id:'hearth',p:[-21.4,.65,17.2],s:[1.35,1.3,.7],c:'#6a6358'},
 {id:'north-side-table',p:[-22.95,.35,18.8],s:[.55,.7,.7],c:'#947354'},
 {id:'south-side-table',p:[-22.95,.35,21.2],s:[.55,.7,.7],c:'#947354'},
 {id:'floor-table',p:[-20.3,.24,19.5],s:[.55,.48,.7],c:'#947354'},
]
export const CAFE_DISPLAY_Z=[17.5,19.4,21.3,23.2]
const LOCAL_SOLIDS=[
 ...[17.2,28.1].map(z=>({id:`cafe-terrace-bench-${z}`,rect:[-15.31,-14.54,z-1.25,z+1.25]})),
 ...[25.1,29.2].map(z=>({id:`cafe-window-books-${z}`,rect:[-17.05,-16.35,z-.6,z+.6]})),
 {id:'goods-zone-divider',rect:[-25.06,-24.94,15.38,16.38]},
 ...CAFE_DISPLAY_Z.map(z=>({id:`cafe-genre-${z}`,rect:[-29.75,-28.25,z-.35,z+.35]})),
 {id:'cafe-mailbox',rect:[-18.225,-17.375,23.725,23.975]},
 ...[20.7,23.8].map(z=>({id:`cafe-folded-door-${z}`,rect:[-17.075,-16.025,z-.05,z+.05]})),
 ...CAFE_NOOKS.map(({id,p:[x,y,z],s:[w,h,d]})=>({id,rect:[x-w/2,x+w/2,z-d/2,z+d/2]})),
 {id:'cafe-counter',rect:[-17.95,-16.55,16,20.5]},
 {id:'cafe-counter-return',rect:[-20.05,-16.55,19.2,20.5]},
 ...[18,22.6].map(z=>({id:'cafe-display-screen-'+z,rect:[-27.06,-26.94,z-.9,z+.9]})),
 {id:'cafe-curation',rect:[-29.6,-25.5,15.4,16.3]},
 {id:'cafe-goods',rect:[-24.8,-20.5,15.4,16.3]},
 ...CAFE_LOCAL_SEATS.map(([x,z],i)=>({id:`cafe-seat-${i}`,rect:i<2?[x-.59,x+.59,z-.70,z+.70]:[x-.6,x+.6,z-.48,z+.48]})),

]
export const CAFE_SOLIDS=LOCAL_SOLIDS.map(s=>({...s,rect:[cafeX(s.rect[0]),cafeX(s.rect[1]),cafeZ(s.rect[2]),cafeZ(s.rect[3])]}))
export function inCafe(x,z){[x,z]=cafeLocal(x,z);return x>-34&&x<-16&&z>15&&z<31}
export function cafeWalk(x,z){
 if(cinemaInside(x,z))return true;
 [x,z]=cafeLocal(x,z)
 if(x>-34.35&&x<-15.65&&z>30.6&&z<48.35)return false
 if(x<=-34||x>=-12.75||z<=14.7||z>=31.3)return null
 // Keep the full avatar inside the garden path and clear of both doorway jambs.
 if(x>-16.4){if(z<15.35||z>30.65)return false;if(x< -15.5&&!(z>21+.23&&z<23.5-.23))return false;return !LOCAL_SOLIDS.some(({rect:[l,r,b,f]})=>x>l-.23&&x<r+.23&&z>b-.23&&z<f+.23)}
 if(x<-33.65||z<15.35||z>30.65)return false
 return !LOCAL_SOLIDS.some(({rect:[l,r,b,f]})=>x>l-.23&&x<r+.23&&z>b-.23&&z<f+.23)
}
