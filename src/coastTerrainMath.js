export const VERANDA_INLET=[-24,-7.8,-45,-14.15]
export const inVerandaInlet=x=>x>=VERANDA_INLET[0]&&x<=VERANDA_INLET[1]
export const northShoreZ=x=>inVerandaInlet(x)?VERANDA_INLET[3]:-34
// Terrain joins the grassy north/west rim to the sea below it.
export function coastPoint(along,t,west=false){
 const u=Math.max(0,Math.min(1,t)),s=u*u*(3-2*u)
 const bend=Math.sin(along*.11)*1.1+Math.sin(along*.29)*.35
 return west?[-38-11*u+bend*u,-7.35*s,along]:[along,-7.35*s,northShoreZ(along)-(inVerandaInlet(along)?2.8:11)*u+bend*u*.25]
}
export function northBankHeight(x,z){
 const bend=Math.sin(x*.11)*1.1+Math.sin(x*.29)*.35
 const t=Math.max(0,Math.min(1,(northShoreZ(x)-z)/((inVerandaInlet(x)?2.8:11)-bend*.25)))
 return -7.35*t*t*(3-2*t)
}
