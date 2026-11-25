export const READING_SOFA=[
 {id:'upper-0',rect:[9.4,12.2,-2.8,-1.7]},
 {id:'upper-1',rect:[9.4,12.2,1.7,2.8]},
 {id:'reading-sofa-back',rect:[12.2,13.25,-2.8,2.8]},
]
export const READING_LOUNGE_SOLIDS=[...READING_SOFA,
 {id:'reading-table',rect:[10,11.5,-.45,.45]},
 {id:'reading-shelves',rect:[14.25,14.95,-4.65,4.65]},
 ...[-1,1].map(a=>({id:'reading-wall-shelf-'+a,rect:[8.2,14.25,a<0?-4.9:4.3,a<0?-4.3:4.9]})),
]
export const READING_SOFA_SEATS=[
 {id:'upper-0',label:'열람실 쿠션 소파 · 북쪽',x:10.5,z:-2.15,turn:0},
 {id:'upper-1',label:'열람실 쿠션 소파 · 남쪽',x:10.5,z:2.15,turn:Math.PI},
 {id:'reading-sofa-east',label:'열람실 쿠션 소파 · 안쪽',x:12.65,z:.95,turn:-Math.PI/2},
]
