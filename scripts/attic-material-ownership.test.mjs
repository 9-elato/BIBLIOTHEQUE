import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import * as THREE from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {prepareAtticModel,disposeAtticModel} from '../src/atticModel.js'

async function atticScene(){
 const b=await readFile(new URL('../public/models/starlight_attic.glb',import.meta.url))
 return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene
}

test('real attic model owns each customized material once and releases every clone',async()=>{
 const source=await atticScene(),originals=new Map(),geometry=new Set()
 source.traverse(o=>{if(o.isMesh){originals.set(o.material,JSON.stringify(o.material.toJSON()));geometry.add(o.geometry)}})
 const textures=Object.fromEntries(['wood','fabric','wallpaper','roof','chalk'].map(n=>[n,new THREE.Texture()]))
 const created=[],originalClone=THREE.Material.prototype.clone
 THREE.Material.prototype.clone=function(){const copy=originalClone.call(this);created.push(copy);return copy}
 let model
 try{model=prepareAtticModel(source,textures)}finally{THREE.Material.prototype.clone=originalClone}
 const owned=new Set(),ownedGeometry=new Set()
 model.traverse(o=>{if(o.isMesh){if(o.userData.atticMaterial)owned.add(o.material);if(o.userData.atticGeometry)ownedGeometry.add(o.geometry)}})
 assert.equal(created.length,owned.size,'no intermediate material clone may be overwritten and lost')
 for(const m of created)assert.ok(owned.has(m))
 for(const [material,json] of originals)assert.equal(JSON.stringify(material.toJSON()),json,'cached source finish is not changed')
 let ownedDisposals=0,geometryDisposals=0,sharedDisposals=0
 for(const m of owned)m.addEventListener('dispose',()=>ownedDisposals++)
 for(const g of ownedGeometry)g.addEventListener('dispose',()=>geometryDisposals++)
 for(const m of originals.keys())m.addEventListener('dispose',()=>sharedDisposals++)
 for(const g of geometry)g.addEventListener('dispose',()=>sharedDisposals++)
 for(const t of Object.values(textures))t.addEventListener('dispose',()=>sharedDisposals++)
 disposeAtticModel(model)
 assert.equal(ownedDisposals,owned.size)
 assert.equal(geometryDisposals,ownedGeometry.size)
 assert.equal(sharedDisposals,0,'loader cache and separately owned textures stay alive')
})
