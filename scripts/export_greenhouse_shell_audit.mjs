import {MEADOW_STAIRS} from '../src/eastMeadowLayout.js'
// Production east-bay coordinates; compare the sealed wall with its stair portal.
import {mkdirSync,writeFileSync} from 'node:fs'
import {GREENHOUSE_ALCOVE_PANELS,GREENHOUSE_EAST_ALCOVE_PANELS,GREENHOUSE_MEADOW_PORTAL,GARDEN_LEVEL,GREENHOUSE_ALCOVE_BACK,GREENHOUSE_ALCOVE_FRONT,GREENHOUSE_HEIGHT_SCALE} from '../src/greenhouseLayout.js'
mkdirSync('outputs',{recursive:true})
writeFileSync('outputs/greenhouse-shell-audit.json',JSON.stringify({after:GREENHOUSE_EAST_ALCOVE_PANELS,before:GREENHOUSE_ALCOVE_PANELS,beforeRectangular:true,portal:GREENHOUSE_MEADOW_PORTAL,stair:MEADOW_STAIRS,level:GARDEN_LEVEL,back:GREENHOUSE_ALCOVE_BACK,front:GREENHOUSE_ALCOVE_FRONT,heightScale:GREENHOUSE_HEIGHT_SCALE},null,2))
