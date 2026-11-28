import {TERRACE_MODEL_SOLIDS} from './terraceFurnitureBounds.js'
// Before atticX expansion; matches the terrace props at ATTIC_ORIGIN.x=-15.6.
export const TERRACE_FURNITURE=[
 ...[-19.67,-11.53].map(x=>({id:'terrace-portal-post-'+x,rect:[x-.34,x+.34,6.39,6.81]})),
 ...[-23.5,-7.7].map(x=>({id:'terrace-side-rail-'+x,rect:[x-.05,x+.05,6.7,10.9]})),
 {id:'terrace-front-rail',rect:[-23.55,-7.65,10.8,10.9]},
 ...[[-23.5,-19.5],[-11.7,-7.7]].map(([l,r])=>({id:'terrace-rear-rail-'+l,rect:[l,r,6.6,6.7]})),
 ...TERRACE_MODEL_SOLIDS,
 ...[-19.1,-12.1].map(x=>({id:'terrace-floor-light-'+x,rect:[x-.11,x+.11,10.19,10.41]})),
 {id:'terrace-planter',rect:[-19.45,-18.95,10.1,10.6]},
]
