import {cafeLocal} from './cafeExpansion.js'
import {movePlayer,walkHeight} from './navigation.js'
export function clearClickSegment(a,b,world){
 const length=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(length/.12));let p={...a}
 for(let i=1;i<=steps;i++){const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps;const next=movePlayer(p,x-p.x,z-p.z,world);if(Math.hypot(next.x-x,next.z-z)>.015)return false;p=next}
 return Math.abs(p.level-b.level)<.15
}
// Bounded weighted A*: a modest goal bias keeps the enlarged cafe responsive.
// Every edge still checks collisions; the route need not be the shortest one.
function* clickPathSteps(start,goal,world,maxNodes=Math.abs(start.level-goal.level)>.2?12000:5000){
 if(Math.hypot(goal.x-start.x,goal.z-start.z)>220||walkHeight(goal.x,goal.z,goal.level,world)===null)return null
 if(clearClickSegment(start,goal,world))return [goal]
 const size=.45,heuristic=p=>Math.hypot(goal.x-p.x,goal.z-p.z),nodes=[{...start,g:0,f:heuristic(start),parent:-1,gx:0,gz:0}],open=[0],best=new Map([['0,0',0]])
 for(let count=0;open.length&&count<maxNodes;count++){
  if(count%24===23)yield
  let pick=0;for(let i=1;i<open.length;i++)if(nodes[open[i]].f<nodes[open[pick]].f)pick=i
  const index=open.splice(pick,1)[0],p=nodes[index]
  if(heuristic(p)<.7&&clearClickSegment(p,goal,world)){const path=[goal];let j=index;while(j>0){path.push(nodes[j]);j=nodes[j].parent}return path.reverse()}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const gx=p.gx+dx,gz=p.gz+dz,g=p.g+Math.hypot(dx,dz)*size,key=gx+','+gz+','+Math.round(p.level*4)
   if(g>300||(best.has(key)&&best.get(key)<=g))continue
   const q={x:start.x+gx*size,z:start.z+gz*size,level:p.level,g,gx,gz,parent:index};const next=movePlayer(p,q.x-p.x,q.z-p.z,world);if(Math.hypot(next.x-q.x,next.z-q.z)>.015)continue;q.level=next.level;if(!clearClickSegment(p,q,world))continue
   q.f=g+1.2*heuristic(q);best.set(key,g);open.push(nodes.length);nodes.push(q)
  }
 }
 return null
}
export function findClickPath(...args){const job=clickPathSteps(...args);let result;do{result=job.next()}while(!result.done);return result.value}
export async function findClickPathAsync(start,goal,world,active=()=>true){const job=clickPathSteps(start,goal,world);while(active()){const result=job.next();if(result.done)return result.value;await new Promise(resolve=>setTimeout(resolve,0))}return null}
export function enteringCafe(a,b){return a.x>=-16&&b.x< -16&&cafeLocal(b.x,b.z)[1]>21&&cafeLocal(b.x,b.z)[1]<23.5&&Math.abs(b.level)<.15}
