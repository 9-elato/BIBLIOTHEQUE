// Local-space support boxes. Existing lantern geometry and light budget stay unchanged.
export function gardenLampSupports(kind,height,side=1){
 const frame=[-1,1].flatMap(x=>[-1,1].map(z=>({p:[x*.09,0,z*.09],s:[.014,.30,.014]})))
 if(kind==='low')return [
  {p:[0,-height+.02,0],s:[.28,.04,.28]},
  {p:[0,(-height-.15)/2,0],s:[.045,height-.15,.045]},...frame,
 ]
 if(kind==='wall')return [
  // The wall column is x=±5.25,z=-11.1; the lantern is x=±5.1,z=-11.2.
  {p:[side*.15,.15,.1],s:[.12,.28,.10]},
  {p:[side*.075,.15,.05],s:[.15,.04,.14]},...frame,
 ]
 return frame
}
