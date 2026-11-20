import React from 'react'
import {BookCoverMesh} from './BookCover'
import {TABLES,tableBookPosition} from './placements'

export default function PlacedBooks({books,placements,heldBook,onPick}){
 return <group>{books.map(book=>{
  const place=placements[book.id]
  if(place?.kind!=='table'||book.id===heldBook)return null
  const table=TABLES.find(t=>t.id===place.tableId)
  if(!table)return null
  return <group key={book.id} position={tableBookPosition(table,place.slot)} rotation={[0,(place.slot%3-1)*.08,0]}
   onClick={e=>{e.stopPropagation();onPick(book.id)}}
   onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='auto'}>
    {[-.035,.035].map(y=><mesh key={y} position={[0,y,0]} castShadow><boxGeometry args={[.35,.018,.46]}/><meshStandardMaterial color={book.color||'#72503a'} roughness={.75}/></mesh>)}
    <mesh><boxGeometry args={[.32,.055,.43]}/><meshStandardMaterial color="#ede0c7" roughness={.95}/></mesh>
    <mesh position={[-.17,0,0]}><boxGeometry args={[.035,.08,.46]}/><meshStandardMaterial color={book.color||'#72503a'}/></mesh>
    <mesh position={[0,.047,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.19,.29]}/><meshStandardMaterial color="#bc995b" roughness={.5} metalness={.35}/></mesh>
    <BookCoverMesh url={book.cover} position={[0,.052,0]} rotation={[-Math.PI/2,0,0]} size={[.33,.44]}/>
  </group>
 })}</group>
}
