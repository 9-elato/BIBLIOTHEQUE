// Before atticX expansion; matches the terrace props at ATTIC_ORIGIN.x=-15.6.
export const TERRACE_FURNITURE=[
 ...[-23.5,-7.7].map(x=>({id:'terrace-side-rail-'+x,rect:[x-.05,x+.05,6.7,10.9]})),
 {id:'terrace-front-rail',rect:[-23.55,-7.65,10.8,10.9]},
 ...[[-23.5,-19.5],[-11.7,-7.7]].map(([l,r])=>({id:'terrace-rear-rail-'+l,rect:[l,r,6.6,6.7]})),
 {id:'terrace-sofa',rect:[-19.35,-17.65,6.95,8.65]},
 {id:'terrace-tea-table',rect:[-18.65,-17.55,9.25,10.05]},
 {id:'terrace-console',rect:[-8.85,-8.25,7.35,9.45]},
 {id:'terrace-pouf',rect:[-15.8,-14.7,10,10.65]},
 {id:'terrace-planter',rect:[-19.45,-18.95,10.1,10.6]},
]
