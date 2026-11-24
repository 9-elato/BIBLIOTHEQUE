// Expand westward while preserving the existing stair landing and door.
export const ATTIC_EXPANSION=1.12
export const atticX=x=>-11.45+(x+11.45)*ATTIC_EXPANSION
export const originalAtticX=x=>-11.45+(x+11.45)/ATTIC_EXPANSION
export const ATTIC_TERRACE_BOUNDS=[atticX(-23.5),atticX(-7.7),6.35,10.8]

// Shared architectural elevations after the attic headroom extension.
export const ATTIC_SHELL_SCALE=1.25
export const ATTIC_MODEL_SCALE=1.5
export const ATTIC_HALF_WIDTH=4.36
export const ATTIC_EAVE=4.26*ATTIC_SHELL_SCALE
export const ATTIC_RIDGE=7.62*ATTIC_SHELL_SCALE
export const atticRoofY=x=>ATTIC_RIDGE-Math.abs(x)*(ATTIC_RIDGE-ATTIC_EAVE)/ATTIC_HALF_WIDTH
export const ATTIC_SCREEN=[2.2,6.4,-.4]
export const ATTIC_SCREEN_SLOPE=(ATTIC_RIDGE-ATTIC_EAVE)/ATTIC_HALF_WIDTH
export const ATTIC_SCREEN_TARGET=[atticX(-15.6+ATTIC_SCREEN[0]),10.6+ATTIC_SCREEN[1],ATTIC_SCREEN[2]]
export function replaceAtticEndWall(name,z){
 return (/^WALL.*end/.test(name)&&z>6)||/^WINDOW · (rear|vertical mullion)/.test(name)||/^GABLE.*-6\.64$/.test(name)
}
export function atticArchitecture(name){return /^(ROOF|RAFTER|WALL|WINDOW|SKYLIGHT)/.test(name)}

export const ATTIC_MOBILE=[0,6.7,3.8]
