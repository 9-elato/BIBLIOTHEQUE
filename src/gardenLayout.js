// Shared by the garden meshes and walking collision bounds.
export const GARDEN_BENCHES=[[-5.6,19],[5.6,25]]
export const GARDEN_BEDS=[[-6,25],[6,19]]
export const GARDEN_TREES=[[-10,16],[10,16],[-10,28],[10,28]]
export const GARDEN_LAMPS=[[-2.65,18],[2.65,18],[-2.65,27],[2.65,27]]
export const GARDEN_SOLIDS=[
 {id:'vestibule-console',rect:[-2.65,-2.01,8.70,10.40]},
 {id:'vestibule-coat-stand',rect:[2.10,2.30,9.90,10.10]},
 ...GARDEN_BENCHES.map(([x,z])=>({id:'garden-bench',rect:[x-1.5,x+1.5,z-.55,z+.55]})),
 ...GARDEN_BEDS.map(([x,z])=>({id:'garden-flowerbed',rect:[x-1.6,x+1.6,z-1,z+1]})),
 ...GARDEN_TREES.map(([x,z])=>({id:'garden-tree',rect:[x-.45,x+.45,z-.45,z+.45]})),
 ...GARDEN_LAMPS.map(([x,z])=>({id:'garden-lantern',rect:[x-.22,x+.22,z-.22,z+.22]})),
 {id:'mailbox',rect:[-5.95,-4.95,13.15,13.85]},
 {id:'umbrella-stand',rect:[2.1,2.48,8.85,9.55]},
]
