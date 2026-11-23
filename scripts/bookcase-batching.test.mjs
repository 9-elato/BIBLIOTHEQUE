import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {GENRES} from '../src/layout.js'
import {bookcaseComponents,mountBookcase,visibleMeshes,batches,clickables,pick,surfaceVertices,exportScene} from './bookcase-harness.mjs'

const components=await bookcaseComponents()
after(()=>components.dispose())
function sameSurfaces(actual,expected,label){
 assert.equal(actual.length,expected.length,label+' vertex count')
 const cells=new Map(),key=p=>p.map(v=>Math.floor(v/.01)).join(',')
 for(const vertex of expected){const k=key(vertex.slice(0,3));if(!cells.has(k))cells.set(k,[]);cells.get(k).push(vertex)}
 for(const vertex of actual){
  const cell=vertex.slice(0,3).map(v=>Math.floor(v/.01));let found=false
  search:for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
   const candidates=cells.get([cell[0]+x,cell[1]+y,cell[2]+z].join(','))
   if(!candidates)continue
   const index=candidates.findIndex(v=>v.every((value,i)=>Math.abs(value-vertex[i])<1e-5))
   if(index!==-1){candidates.splice(index,1);found=true;break search}
  }
  assert.ok(found,label+' missing equivalent surface vertex '+vertex.slice(0,3))
 }
}
const book=(id)=>({id,title:'Test '+id,pages:240,color:'#496654'})
const props=(genre,z=-4.9,books=[])=>({item:{x:15.1,z,number:1,books},genre,onPick(){},onGenre(){}})

test('production bookcases preserve colored surfaces and reduce visible meshes for every genre and orientation',async()=>{
 const stats=[]
 for(const genre of GENRES)for(const z of [-4.9,4.9]){
  const p=props(genre,z,[book('one')]),before=await mountBookcase(components.before,p),after=await mountBookcase(components.after,p)
  try{
   sameSurfaces(surfaceVertices(after.scene),surfaceVertices(before.scene),`${genre.id}/${z}: surfaces`)
   const old=visibleMeshes(before.scene).length,next=visibleMeshes(after.scene).length
   assert.ok(next<old*.65,`${genre.id}: ${old} -> ${next}`)
   assert.equal(clickables(after.scene).length,2)
   stats.push({genre:genre.id,z,beforeMeshes:old,afterMeshes:next,batches:batches(after.scene).length})
   if(genre.id==='literature'&&z===-4.9){await exportScene(before.scene,'outputs/bookcase-before.scene.json');await exportScene(after.scene,'outputs/bookcase-after.scene.json')}
  }finally{await after.dispose();await before.dispose()}
 }
 await writeFile('outputs/bookcase-batching-stats.json',JSON.stringify({note:'Visible Three mesh counts from production JSX; not measured GPU draw calls or FPS',stats},null,2))
})

test('taking, returning and registering books keeps frame batches stable and picking alive',async()=>{
 const selected=[],genres=[],first=book('one'),p=props(GENRES[0],-4.9,[first])
 p.onPick=id=>selected.push(id);p.onGenre=id=>genres.push(id)
 const mounted=await mountBookcase(components.after,p)
 try{
  const original=batches(mounted.scene),geometry=original.map(n=>n.geometry)
  const books=()=>clickables(mounted.scene).filter(n=>n.userData.noBatch)
  const plate=()=>clickables(mounted.scene).find(n=>!n.userData.noBatch)
  assert.equal(books().length,1)
  assert.ok(pick(mounted.scene,books()[0]));assert.deepEqual(selected,['one'])
  assert.ok(pick(mounted.scene,plate()));assert.deepEqual(genres,['literature'])
  await mounted.render({...p,heldBook:'one'})
  assert.equal(books().length,0)
  assert.deepEqual(batches(mounted.scene),original)
  await mounted.render({...p,heldBook:null})
  assert.equal(books().length,1);assert.ok(pick(mounted.scene,books()[0]));assert.equal(selected.at(-1),'one')
  const full=Array.from({length:24},(_,i)=>book('new-'+i))
  await mounted.render({...p,item:{...p.item,books:full}})
  assert.equal(books().length,24)
  assert.ok(pick(mounted.scene,books()[23]));assert.equal(selected.at(-1),'new-23')
  assert.deepEqual(batches(mounted.scene),original)
  assert.deepEqual(batches(mounted.scene).map(n=>n.geometry),geometry)
  await mounted.render({...p,item:{...p.item,books:[]}})
  assert.equal(books().length,0);assert.deepEqual(batches(mounted.scene),original)
  assert.ok(pick(mounted.scene,plate()));assert.equal(genres.at(-1),'literature')
 }finally{await mounted.dispose()}
})

test('changing a frame finish rebuilds its batches while retaining the live book',async()=>{
 const selected=[],p=props(GENRES[0],-4.9,[book('same')]);p.onPick=id=>selected.push(id)
 const mounted=await mountBookcase(components.after,p)
 try{
  const original=batches(mounted.scene)
  const changed={...p,genre:{...p.genre,wood:'#59392c',trim:'#ba945b'}}
  await mounted.render(changed)
  assert.ok(batches(mounted.scene).every(n=>!original.includes(n)))
  const baseline=await mountBookcase(components.before,changed)
  try{sameSurfaces(surfaceVertices(mounted.scene),surfaceVertices(baseline.scene),'updated finish')}
  finally{await baseline.dispose()}
  const target=clickables(mounted.scene).find(n=>n.userData.noBatch)
  assert.ok(pick(mounted.scene,target));assert.equal(selected.at(-1),'same')
 }finally{await mounted.dispose()}
})
