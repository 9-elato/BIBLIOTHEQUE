export function makeLadders(layout){return layout.sections.map(({start,cases,genre})=>({id:genre.id,x:start-.8,z:-3.85,min:start-1,max:Math.max(...cases.map(c=>c.x))+1,target:start-.8,moving:false,climb:{enabled:true,maxHeight:6.3}}))}
export function toggleLadder(s){if(s.occupied)return;if(s.moving){s.target=s.x;s.moving=false}else{s.target=Math.abs(s.x-s.max)<.15?s.min:s.max;s.moving=true}}
export function advanceLadders(items,dt,player){
 for(const s of items){if(!s.moving)continue
  const dx=Math.sign(s.target-s.x)*Math.min(Math.abs(s.target-s.x),Math.min(dt,.1)*.8),nx=s.x+dx
  if(player.ladder?.item===s)continue
  if(player.level<.2&&Math.abs(player.x-nx)<.75&&Math.abs(player.z-s.z)<1.05){s.moving=false;s.target=s.x;continue}
  s.x=nx;if(Math.abs(s.target-s.x)<.001){s.x=s.target;s.moving=false}
 }
}
export const ladderBlocks=(s,x,z)=>Math.abs(x-s.x)<.65&&Math.abs(z-s.z)<.85

export function boardLadder(player,item,isClear,pathClear=()=>true){
 if(player.ladder||player.seated||Math.abs(player.level)>.1)return false
 const entry={x:item.x,z:item.z+1.2}
 if(Math.hypot(player.x-entry.x,player.z-entry.z)>1.5||!isClear(entry.x,entry.z)||!pathClear(player,entry))return false
 item.moving=false;item.target=item.x;item.occupied=true
 player.ladder={item,height:0,entry,phase:'boarding',progress:0,from:{x:player.x,z:player.z},blocked:false}
 return true
}
export function advanceRider(player,dt,vertical,horizontal,isClear){
 const ride=player.ladder;if(!ride)return
 const l=ride.item,step=Math.max(0,Math.min(dt,.05))
 // E during the floor approach cancels at the current safe position. It must
 // not teleport the visitor to the ladder's landing before releasing them.
 if(ride.phase==='descending'&&ride.progress<1){l.occupied=false;player.ladder=null;return}
 if(ride.phase==='boarding'){
  const progress=Math.min(1,ride.progress+step*2.5)
  const t=progress*progress*(3-2*progress)
  const x=ride.from.x+(ride.entry.x-ride.from.x)*t,z=ride.from.z+(ride.entry.z-ride.from.z)*t
  const steps=Math.max(1,Math.ceil(Math.hypot(x-player.x,z-player.z)/.055))
  for(let i=0;i<=steps;i++){
   if(!isClear(player.x+(x-player.x)*i/steps,player.z+(z-player.z)*i/steps)){ride.blocked=true;return}
  }
  ride.blocked=false;ride.progress=progress;player.x=x;player.z=z
  if(ride.progress===1)ride.phase='climbing'
  return
 }
 const exiting=ride.phase==='descending'
 if(!exiting){const nx=Math.max(l.min,Math.min(l.max,l.x+horizontal*step*.65));if(isClear(nx,l.z+1.2)){l.x=nx;l.target=nx}}
 const height=Math.max(0,Math.min(l.climb.maxHeight,ride.height+(exiting?-1.1:vertical)*step*1.15))
 if(height<ride.height&&!isClear(l.x,l.z+1.2)){ride.blocked=true;return}
 ride.blocked=false;ride.height=height
 player.x=l.x;player.z=l.z+1.2-Math.min(1,ride.height)*.7-ride.height*.12;player.level=ride.height;player.bodyYaw=Math.PI
 if(exiting&&ride.height===0){
  if(isClear(l.x,l.z+1.2)){player.z=l.z+1.2;player.level=0;l.occupied=false;player.ladder=null}
  else ride.blocked=true
 }
}
