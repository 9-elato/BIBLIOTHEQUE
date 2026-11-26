import {recordStorage} from './recordStorage'
import {useEffect,useMemo,useState} from 'react'
import {loadPlacements,normalizePlacements,placeBook,savePlacements} from './placements'

export default function useBookPlacements(books,{scope,ready,owner}){
  const key=`mll-book-placements-v1:${scope}`
  const [initial]=useState(()=>loadPlacements(recordStorage,key))
  const [saved,setSaved]=useState(initial.placements)
  const [error,setError]=useState(initial.error)
 useEffect(()=>{const refresh=()=>{const loaded=loadPlacements(recordStorage,key);setError(loaded.error);if(!loaded.error)setSaved(loaded.placements)};window.addEventListener('library-records-updated',refresh);return()=>window.removeEventListener('library-records-updated',refresh)},[])
  const placements=useMemo(()=>normalizePlacements(books,saved),[books,saved])
  function move(bookId,target){
    if(!ready||!owner)return {error:'배치는 소유자만 변경할 수 있습니다.'}
    if(error)return {error}
    try{
      const next=placeBook(placements,bookId,target)
      const message=savePlacements(recordStorage,key,next)
      setError(message)
      if(message)return {error:message}
      setSaved(next)
      return {error:''}
    }catch(e){return {error:e.message}}
  }
  return {placements,move,error}
}
