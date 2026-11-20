// Expand westward while preserving the existing stair landing and door.
export const ATTIC_EXPANSION=1.12
export const atticX=x=>-11.45+(x+11.45)*ATTIC_EXPANSION
export const originalAtticX=x=>-11.45+(x+11.45)/ATTIC_EXPANSION
