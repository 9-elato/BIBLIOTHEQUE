import {readdir,readFile,writeFile} from 'node:fs/promises'
import {gzipSync,gunzipSync} from 'node:zlib'
import {resolve} from 'node:path'
const directory=resolve(import.meta.dirname,'../dist/models')
for(const name of await readdir(directory)){
 if(!name.endsWith('.glb'))continue
 const source=await readFile(resolve(directory,name)),compressed=gzipSync(source,{level:9})
 if(!gunzipSync(compressed).equals(source))throw new Error(`Lossless verification failed: ${name}`)
 await writeFile(resolve(directory,name+'.gz'),compressed)
 console.log(`${name}: ${source.length} -> ${compressed.length} bytes (${(source.length/compressed.length).toFixed(2)}x smaller)`)
}
