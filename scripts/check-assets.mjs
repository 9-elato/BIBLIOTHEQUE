import {readdir, readFile} from 'node:fs/promises'
import {resolve} from 'node:path'

const root = resolve(import.meta.dirname, '..')
const assets = new Set()
for (const name of await readdir(resolve(root, 'src'))) {
  if (!/\.(jsx?|tsx?)$/.test(name)) continue
  const source = await readFile(resolve(root, 'src', name), 'utf8')
  for (const match of source.matchAll(/models\/[\w./-]+\.glb/g)) assets.add(match[0])
}
for (const asset of assets) {
  const bytes = await readFile(resolve(root, 'public', asset))
  if (bytes.length < 12 || bytes.toString('ascii', 0, 4) !== 'glTF' ||
      bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) {
    throw new Error(`Invalid GLB: ${asset}`)
  }
  if(asset.endsWith('manor_estate.glb')){
    const json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)))
    for(const zone of ['Main Manor','West Tower','East Tower','West Wing','East Wing','Rear Manor']){
      if(!json.nodes?.some(n=>n.name?.startsWith(zone)&&Number.isInteger(n.mesh)))throw new Error(`Missing estate region: ${zone}`)
    }
  }
  if(asset.endsWith('ghost_avatar.glb')){
    const json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)))
    for(const name of ['GHOST_OnePiece_Sheet','GHOST_Eye_L','GHOST_Eye_R']){
      if(!json.nodes?.some(node=>node.name===name&&Number.isInteger(node.mesh)))throw new Error(`Missing ghost mesh: ${name}`)
    }
  }
  console.log(`OK ${asset}`)
}
console.log(`Verified ${assets.size} referenced GLB assets.`)
