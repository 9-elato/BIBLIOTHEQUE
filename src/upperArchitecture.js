export const READING_CLEAR_HEIGHT=5.8
export const HALL_CEILING=16.2
export const readingCeilingY=level=>level+READING_CLEAR_HEIGHT
export function eastHallClosure(level){const bottom=readingCeilingY(level);return {bottom,height:HALL_CEILING-bottom,center:(HALL_CEILING+bottom)/2}}

// The first-floor stacks ceiling must start beyond the upstairs reading room.
export const STACKS_CEILING_START=15.5
export const THIRD_PERSON_ELEVATION=Math.PI/6

export const GALLERY_RAILS=[
 {axis:'z',constant:5.28,start:-4.42,end:4.6},
 {axis:'x',constant:-4.4,start:-5.2,end:5.2},
 {axis:'x',constant:4.58,start:-5.2,end:5.2},
 {axis:'x',constant:-6.65,start:-7.5,end:-1.5},
 {axis:'x',constant:-6.65,start:1.5,end:7.5},
 {axis:'x',constant:6.65,start:-7.5,end:7.5},
 {axis:'x',constant:5.28,start:-7.45,end:-5.35},
]
export const GALLERY_RAIL_SOLIDS=GALLERY_RAILS.map((r,i)=>({
 id:`gallery-rail-${i}`,
 rect:r.axis==='z'?[r.constant-.1,r.constant+.1,r.start-.1,r.end+.1]:[r.start-.1,r.end+.1,r.constant-.1,r.constant+.1],
}))
