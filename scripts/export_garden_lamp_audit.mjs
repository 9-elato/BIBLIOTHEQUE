import React from 'react'
import {build} from 'esbuild'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import {mountBookcase,exportScene} from './bookcase-harness.mjs'
for(const before of [true,false]){
 const file=path.resolve('outputs/garden-lamp-'+(before?'before':'after')+'.mjs')
 await build({entryPoints:['src/GreenhouseAtmosphere.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,logLevel:'silent',plugins:before?[{name:'before-mounts',setup(b){b.onLoad({filter:/gardenLampSupports\.js$/},()=>({contents:'export const gardenLampSupports=()=>[]',loader:'js'}))}}]:[]})
 const {Lamp}=await import(pathToFileURL(file).href)
 function Fixture(){return React.createElement('group',null,React.createElement(Lamp,{position:[0,.42,0],kind:'low',on:true}),React.createElement('mesh',{position:[0,-.025,0]},React.createElement('boxGeometry',{args:[.8,.05,.8]}),React.createElement('meshStandardMaterial',{color:'#69735c'})))}
 const mounted=await mountBookcase(Fixture,{})
 await exportScene(mounted.scene,'outputs/garden-lamp-'+(before?'before':'after')+'.scene.json')
 await mounted.dispose()
}
