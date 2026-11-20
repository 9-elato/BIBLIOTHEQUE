export function makeLadders(layout){return layout.sections.map(({start,cases,genre})=>({id:genre.id,x:start-.8,z:-3.85,min:start-1,max:Math.max(...cases.map(c=>c.x))+1,target:start-.8,moving:false,climb:{enabled:false}}))}
export function toggleLadder(s){if(s.moving){s.target=s.x;s.moving=false}else{s.target=Math.abs(s.x-s.max)<.15?s.min:s.max;s.moving=true}}
export function advanceLadders(items,dt,player){
 for(const s of items){if(!s.moving)continue
  const dx=Math.sign(s.target-s.x)*Math.min(Math.abs(s.target-s.x),Math.min(dt,.1)*.8),nx=s.x+dx
  if(player.level<.2&&Math.abs(player.x-nx)<.75&&Math.abs(player.z-s.z)<1.05){s.moving=false;s.target=s.x;continue}
  s.x=nx;if(Math.abs(s.target-s.x)<.001){s.x=s.target;s.moving=false}
 }
}
export const ladderBlocks=(s,x,z)=>Math.abs(x-s.x)<.65&&Math.abs(z-s.z)<.85
