import React from 'react'
import GhostGLB from './GhostGLB'
import FoxAvatar from './FoxAvatar'
export default function AvatarModels(props){return props.character==='fox'?<FoxAvatar {...props}/>:<GhostGLB {...props}/>}
