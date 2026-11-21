import React,{lazy} from 'react'
import GhostGLB from './GhostGLB'
const FoxAvatar=lazy(()=>import('./FoxAvatar'))
const LabradorAvatar=lazy(()=>import('./LabradorAvatar'))
export default function AvatarModels(props){return props.character==='labrador'?<LabradorAvatar {...props}/>:props.character==='fox'?<FoxAvatar {...props}/>:<GhostGLB {...props}/>}
