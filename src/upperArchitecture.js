export const READING_CLEAR_HEIGHT=5.8
export const HALL_CEILING=16.2
export const readingCeilingY=level=>level+READING_CLEAR_HEIGHT
export function eastHallClosure(level){const bottom=readingCeilingY(level);return {bottom,height:HALL_CEILING-bottom,center:(HALL_CEILING+bottom)/2}}

// The first-floor stacks ceiling must start beyond the upstairs reading room.
export const STACKS_CEILING_START=15.5
export const THIRD_PERSON_ELEVATION=Math.PI/6
