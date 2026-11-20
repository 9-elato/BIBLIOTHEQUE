import {useEffect,useMemo,useState} from 'react'
import {loadPlacements,normalizePlacements,placeBook,savePlacements} from './placements'

export default function useBookPlacements(books,{scope,ready,owner}){
  const key=`mll-book-placements-v1:${scope}`
  const [initial]=useState(()=>loadPlacements(localStorage,key))
  const [saved,setSaved]=useState(initial.placements)
  const [error,setError]=useState(initial.error)
  const placements=useMemo(()=>normalizePlacements(books,saved),[books,saved])
  useEffect(()=>{
    if(!ready||!owner||initial.error)return
    if(JSON.stringify(saved)!==JSON.stringify(placements))setSaved(placements)
    const message=savePlacements(localStorage,key,placements)
    setError(message)
  },[placements,key,ready,owner,initial,saved])
  function move(bookId,target){
    if(!ready||!owner)return {error:'배치는 소유자만 변경할 수 있습니다.'}
    try{
      const next=placeBook(placements,bookId,target)
      setSaved(next)
      return {error:''}
    }catch(e){return {error:e.message}}
  }
  return {placements,move,error}
}
