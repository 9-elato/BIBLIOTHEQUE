export function gardenClimate(time='afternoon',weather='sunny'){
 const night=time==='night',late=time==='evening',clear=weather==='sunny'
 return {night,lamps:night||late||weather!=='sunny',sun:clear?(night?.6:late?1.3:3.2):(night?.22:.65),color:night?'#a6c3f4':time==='morning'?'#fff4d6':late?'#f4b475':'#ffd09a',position:time==='morning'?[4,14,-12]:night?[9,12,-22]:[-10,8,-12],dust:clear&&!night&&!late,butterflies:clear&&!night&&!late}
}
// Local coordinates above the conservatory floor. Precipitation never enters the roof envelope.
export const gardenRoofY=x=>6.44-Math.abs(x)*.389
export function roofDrop(i,t){const side=i%2?1:-1;const x=side*(.25+((i*.618+t*.11)%1)*4.85);return [x,gardenRoofY(x)+.09,-7.2+((i*.381)%1)*-16.5]}
export function skyFlake(i,t){return [Math.sin(i*7.2)*5,8.1+((i*.317-t*.13)%1+1)%1*4,-7.2-((i*.618)%1)*16.5]}
