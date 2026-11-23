import React from 'react'
function Tree({x,y,s=1}){return <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0v2" stroke="#8a7948" strokeWidth=".5"/><path d="M-2 0C-4-1-3-4-1-4C0-6 3-5 3-3C6-2 4 1 2 1Z" fill="#9eb761"/><circle cx="-.7" cy="-1.7" r="1.9" fill="#b5c977"/></g>}
export default function MapIllustration({room,schematic}){
 const [l,r,t,b]=room.space,w=r-l,h=b-t,[x,y]=room.label
 const size=schematic?1:Math.min(w/18,h/12)
 if(room.kind==='outdoor')return <g className="map-art">
  <Tree x={l+w*.16} y={t+h*.22} s={Math.min(w,h)/20}/><Tree x={r-w*.13} y={b-h*.15} s={Math.min(w,h)/22}/>
  {room.id==='estate'&&<path d={`M${l+w*.3} ${b-1} Q${l+w*.1} ${b-h*.28} ${l+w*.45} ${t+h*.45} T${l+w*.55} ${t+1}`} fill="none" stroke="#f6f0c7" strokeWidth={w*.06}/>}
  {room.id==='meadow'&&<path d={`M${l+.5} ${b-1}Q${l+w*.25} ${t} ${l+w*.5} ${b-2}T${r-.5} ${b-1}`} fill="#c0d083"/>}
  {[.24,.72].map((v,i)=><g key={v} transform={`translate(${l+w*v} ${t+h*(i?.4:.75)}) scale(${Math.min(w,h)/32})`}><path d="M0 1l-.4-1M1 1l.5-1" stroke="#849d4e" strokeWidth=".3"/><path d="M0-2v2M-1-1h2" stroke="#fffbe6" strokeWidth=".8"/><circle cy="-1" r=".25" fill="#e4b95d"/></g>)}
 </g>
 const icon=room.kind==='water'||room.id==='bathroom'?'water':room.id==='lounge'?'fire':room.id==='cafe'?'cup':room.id==='terrace'?'star':room.id==='greenhouse'?'plant':room.id==='attic'?'moon':room.id==='stacks'||room.id==='reading'?'books':room.name==='개인 작업실'?'desk':null
 if(!icon)return null
 return <g className="map-art" transform={`translate(${x} ${Math.min(b-h*.18,y+h*.28)}) scale(${size})`} stroke="#97784c" strokeWidth=".28" strokeLinejoin="round">
  {icon==='fire'&&<><path d="M-2.7 1V-1a2.7 2.7 0 015.4 0v2Z" fill="#ceb58a"/><path d="M-1.6 1v-2a1.6 1.6 0 013.2 0v2" fill="#73573b"/><path d="M0 1C-2 0-1-1 0-2C0-1 2 0 0 1" fill="#efb44b"/><path d="M-3 1h6v.6h-6Z" fill="#eddbb7"/></>}
  {icon==='books'&&<><path d="M-5 1H5"/><path d="M-4 1v-3h1v3M-2.5 1v-3.5H-1v3.5M0 1v-3h1.2v3M2 1l-.5-3 1-.2L3 1" fill="#8da27c"/><path d="M3.5 1v-3h1v3" fill="#be8a70"/></>}
  {icon==='water'&&<g fill="none" stroke="#f5ffff" strokeWidth=".4">{[-1,0,1].map(d=><path key={d} d={`M-3 ${d}q1 .8 2 0t2 0t2 0`}/>)}</g>}
  {icon==='cup'&&<><path d="M-1.8-1h3v2h-3ZM1.2-.7c2-.4 2 1.5 0 1.4M-2.5 1.5h5" fill="#f6edd5"/><path d="M-.6-1.5q-1-1 0-2" fill="none"/></>}
  {icon==='desk'&&<><path d="M-3 0h6v.7h-6ZM-2.5.7v1M2.5.7v1" fill="#b89462"/><path d="M-1.5 0v-1.6h2V0M1.5-2v2M.5-2h2l-.5-1h-1Z" fill="#7f9b75"/></>}
  {icon==='plant'&&<><path d="M-1 0h2L.7 1.5H-.7Z" fill="#bb8c66"/><path d="M0 0v-2M0-1C-3-3-1-4 0-2C2-4 3-2 0-1" fill="#8ea96c"/></>}
  {icon==='moon'&&<path d="M1-3C-3-4-3 2 1 2C-1 1-1-2 1-3Z" fill="#e8c66c"/>}
  {icon==='star'&&<path d="M0-3l.7 1.8 2 .2-1.5 1.3.5 2L0 .3l-1.7 1 .5-2-1.5-1.3 2-.2Z" fill="#e8c66c"/>}
 </g>
}
