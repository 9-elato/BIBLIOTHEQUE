// Input for render_greenhouse_shell_audit.py; before is the d07bb03 east bay.
import {mkdirSync,writeFileSync} from 'node:fs'
import {GREENHOUSE_ALCOVE_PANELS,GREENHOUSE_ALCOVE_BACK,GREENHOUSE_ALCOVE_FRONT,GREENHOUSE_HEIGHT_SCALE} from '../src/greenhouseLayout.js'
mkdirSync('outputs',{recursive:true})
writeFileSync('outputs/greenhouse-shell-audit.json',JSON.stringify({after:GREENHOUSE_ALCOVE_PANELS,before:[{z:-12,w:2},{z:-14,w:2}],back:GREENHOUSE_ALCOVE_BACK,front:GREENHOUSE_ALCOVE_FRONT,heightScale:GREENHOUSE_HEIGHT_SCALE},null,2))
