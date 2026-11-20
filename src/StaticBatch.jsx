import React,{useLayoutEffect,useRef} from 'react'
import {batchStaticMeshes} from './staticMeshBatch'
export default function StaticBatch({children,revision=''}){
 const ref=useRef()
 useLayoutEffect(()=>{const batch=batchStaticMeshes(ref.current);return()=>batch.dispose()},[revision])
 return <group ref={ref}>{children}</group>
}
