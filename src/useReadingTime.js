import {recordStorage} from './recordStorage'
import {useEffect,useState} from 'react'
const KEY='mll-reading-seconds-v1'
export default function useReadingTime(bookId,active){
 const [totals,setTotals]=useState(()=>{try{return JSON.parse(recordStorage.getItem(KEY))||{}}catch{return {}}})
 useEffect(()=>{const refresh=()=>{try{setTotals(JSON.parse(recordStorage.getItem(KEY)||'{}'))}catch{}};window.addEventListener('library-records-updated',refresh);return()=>window.removeEventListener('library-records-updated',refresh)},[])
 useEffect(()=>{
  if(!bookId||!active)return
  let previous=Date.now()
  const timer=setInterval(()=>{
   const now=Date.now(),seconds=Math.min(2,(now-previous)/1000);previous=now
   if(document.visibilityState!=='visible')return
   setTotals(old=>{const next={...old,[bookId]:(Number(old[bookId])||0)+seconds};recordStorage.setItem(KEY,JSON.stringify(next));return next})
  },1000)
  return()=>clearInterval(timer)
 },[bookId,active])
 return totals
}
