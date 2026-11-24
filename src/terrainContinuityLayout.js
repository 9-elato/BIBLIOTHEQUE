import {VERANDA_INLET} from './coastTerrainMath.js'
import {cutFloor,BASEMENT_OPENING} from './basementLayout.js'
// Keep the sunken forest garden and stair shaft open. All other patches sit
// below the finished floors, so adjoining slabs cannot expose the background.
export const SUNKEN_GARDEN=[6.64,28.2,-6.7,27.1]
export const GROUND_BACKING=cutFloor([-38,160,-34,34],SUNKEN_GARDEN)
 .flatMap(rect=>cutFloor(rect,BASEMENT_OPENING))
 .flatMap(rect=>cutFloor(rect,VERANDA_INLET))
export const SEABED_BACKING={position:[0,-7.22,0],size:[1600,1600]}
