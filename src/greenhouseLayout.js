// One source of truth for planting, seating and walking footprints.
export const GARDEN_LEVEL=7.2
export const GREENHOUSE_REGIONS=[[-5.25,5.25,-24,-6.3],[-8.4,-4.95,-17.1,-11],[4.95,8.4,-17.1,-11]]
export const FOUNTAIN={x:0,z:-14,radius:1.32}
export const POND={x:-6.65,z:-14.6,radius:1.22}
export const GARDEN_SEATING=[
 {id:'conservatory-sofa-left',label:'온실 라탄 소파 왼쪽',x:7.15,z:-13,turn:-Math.PI/2,height:.64,side:-.48,style:'sofa'},
 {id:'conservatory-sofa-right',label:'온실 라탄 소파 오른쪽',x:7.15,z:-13,turn:-Math.PI/2,height:.64,side:.48,style:'sofa'},
 {id:'conservatory-pond',label:'연못 옆 철제 벤치',x:-6.7,z:-11.85,turn:Math.PI,height:.62,style:'bench'},
 {id:'conservatory-flowers',label:'허브 정원 라탄 의자',x:3.65,z:-9.1,turn:Math.PI,height:.62,style:'chair'},
 {id:'conservatory-reading',label:'분수 옆 독서 의자',x:3.6,z:-18,turn:-Math.PI/2,height:.62,style:'chair'},
]
export const HERBS=[{name:'로즈마리',x:-2.9,z:-9.4,type:'rosemary'},{name:'라벤더',x:2.9,z:-10.4,type:'lavender'},{name:'타임',x:-2.9,z:-11.2,type:'thyme'},{name:'민트',x:2.9,z:-12.1,type:'mint'},{name:'바질',x:-2.9,z:-12.8,type:'basil'}]
export const TROPICALS=[
 {name:'야자수',type:'palm',x:-3.5,z:-22.7,scale:1.2},
 {name:'바나나',type:'banana',x:3.3,z:-22.5,scale:1.2},
 {name:'알로카시아',type:'alocasia',x:1.5,z:-21.2,scale:.85},
 {name:'몬스테라',type:'monstera',x:-1.6,z:-21.5,scale:1},
 {name:'필로덴드론',type:'philodendron',x:-3.6,z:-20.3,scale:.9},
 {name:'고사리',type:'fern',x:3.7,z:-20.2,scale:.85},
]
export const FLOWERS=[[-4.45,-8.5,'rose'],[-4.45,-10.4,'hydrangea'],[4.45,-10.6,'fuchsia'],[-4.4,-18.6,'begonia'],[4.5,-16.1,'geranium'],[-4.3,-16.8,'daisy']]
export const GARDEN_SOLIDS=[
 {id:'conservatory-sofa',rect:[6.65,7.68,-14.25,-11.75]},
 {id:'conservatory-bench',rect:[-7.85,-5.55,-12.35,-11.35]},
 {id:'conservatory-flower-chair',rect:[3.05,4.25,-9.62,-8.58]},
 {id:'conservatory-reading-chair',rect:[3.08,4.12,-18.6,-17.4]},
 {id:'conservatory-tea',rect:[5.2,6.3,-16.25,-15.15]},
 ...HERBS.map((p,i)=>({id:'conservatory-herb-'+i,rect:[p.x-.30,p.x+.30,p.z-.30,p.z+.30]})),
 ...FLOWERS.map(([x,z],i)=>({id:'conservatory-flower-'+i,rect:[x-.45,x+.45,z-.55,z+.55]})),
 ...TROPICALS.map((p,i)=>({id:'conservatory-tropical-'+i,rect:[p.x-.58,p.x+.58,p.z-.58,p.z+.58]})),
]
export function gardenWaterBlocks(x,z,r=.23){return [FOUNTAIN,POND].some(p=>Math.hypot(x-p.x,z-p.z)<p.radius+r)}
export function glassDoorBlocks(x,z,door,r=.23){
 if(!door)return false
 const a=door.amount*Math.PI/2
 return [-1,1].some(side=>{const ax=side*1.4,az=-6.95,dx=-side*1.4*Math.cos(a),dz=-1.4*Math.sin(a);const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-ax-t*dx,z-az-t*dz)<r+.05})
}
export function toggleGlassDoor(door,player){
 if(Math.abs(player.x)<1.7&&player.z<-6.5&&player.z>-8.8)return false
 door.open=!door.open;return true
}

// Side glazing exactly meets the side alcove returns and the rear gable.
export const GREENHOUSE_SIDE_PANELS=[{z:-8.9,w:4.2},{z:-20.8,w:7.2}]
export const GREENHOUSE_GABLE={halfWidth:5.4,eave:4.35,ridge:6.46,front:-6.8,back:-24.4}

export const GREENHOUSE_HEIGHT_SCALE=1.4
export const GREENHOUSE_DOOR_HEIGHT=3.4
export const GREENHOUSE_CEILING_LAMP_Y=5.7
export const greenhouseCeilingAt=x=>(6.44-Math.abs(x)*.389)*GREENHOUSE_HEIGHT_SCALE
