import React,{lazy} from 'react'
import GhostGLB from './GhostGLB'
const FoxAvatar=lazy(()=>import('./FoxAvatar'))
export default function AvatarModels(props){return props.character==='fox'?<FoxAvatar {...props}/>:<GhostGLB {...props}/>}
