// Small, bounded floor-only search. Every edge uses the avatar's navigation
// checks, so a nearby endpoint never permits cutting through a wall or rail.
export function findSeatExitPath(start,target,clear){
 if(Math.hypot(target.x-start.x,target.z-start.z)>1.05)return null
 if(clear(start,target))return [start,target]
 if(!clear(start,start)||!clear(target,target))return null
 const queue=[{point:start,parent:-1,length:0}],seen=new Set(['0,0'])
 for(let i=0;i<queue.length&&i<169;i++){
  const node=queue[i],p=node.point
  if(Math.hypot(target.x-p.x,target.z-p.z)<=.31&&clear(p,target)){
   const path=[target];let index=i
   while(index>=0){path.push(queue[index].point);index=queue[index].parent}
   return path.reverse()
  }
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const gx=Math.round((p.x-start.x)/.2)+dx,gz=Math.round((p.z-start.z)/.2)+dz
   const key=`${gx},${gz}`,q={x:start.x+gx*.2,z:start.z+gz*.2}
   if(seen.has(key)||Math.abs(gx)>6||Math.abs(gz)>6||node.length+.2>2.8)continue
   if(clear(p,q)){seen.add(key);queue.push({point:q,parent:i,length:node.length+.2})}
  }
 }
 return null
}
