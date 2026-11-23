// Shared ceiling dimensions keep pendant supports attached when rooms change height.
export const CORRIDOR_CEILING = {y:6.55, thickness:.16}
export const PASSAGE_CEILING = {y:5.96, thickness:.18}
export function underside(ceiling){return ceiling.y-ceiling.thickness/2}
export function suspension(lightY,mountY){
 if(!Number.isFinite(lightY)||!Number.isFinite(mountY)||mountY<=lightY)throw new RangeError('Pendant mount must be above the light')
 const length=mountY-lightY
 return {length,center:length/2,cap:length}
}
