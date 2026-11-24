// Terrain joins the grassy north/west rim to the sea below it.
export function coastPoint(along,t,west=false){
 const u=Math.max(0,Math.min(1,t)),s=u*u*(3-2*u)
 const bend=Math.sin(along*.11)*1.1+Math.sin(along*.29)*.35
 return west?[-38-11*u+bend*u,-7.35*s,along]:[along,-7.35*s,-34-11*u+bend*u]
}
export function northBankHeight(x,z){
 const bend=Math.sin(x*.11)*1.1+Math.sin(x*.29)*.35
 const t=Math.max(0,Math.min(1,(-34-z)/(11-bend)))
 return -7.35*t*t*(3-2*t)
}
