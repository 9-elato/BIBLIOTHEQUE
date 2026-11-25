import React,{useMemo,useEffect} from 'react'
import {surfaceRelief} from './surfaceRelief'
import {Box as B} from './GroundFloor'
import {READING_SOFA} from './readingLoungeLayout.js'
function Soft({p,s,cloth,c='#a95230',rot=[0,0,0]}){return <mesh position={p} scale={s} rotation={rot} castShadow receiveShadow><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color={c} roughness={.96} bumpMap={cloth} bumpScale={.012}/></mesh>}
function Shelf({p,turn=0,w=6}){return <group position={p} rotation={[0,turn,0]}>
 <B p={[0,1.6,-.24]} s={[w,3.2,.12]} c="#694c36"/>
 {Array.from({length:5},(_,i)=><B key={i} p={[-w/2+i*w/4,1.6,0]} s={[.09,3.2,.6]} c="#866444"/>)}
 {[.18,.9,1.62,2.34,3.08].map((y,row)=><group key={y}><B p={[0,y,0]} s={[w,.10,.62]} c="#aa8258"/>{row<4&&Array.from({length:Math.floor(w/.24)},(_,i)=><B key={i} p={[-w/2+.15+i*.24,y+.28,.02]} s={[.13+(i%3)*.025,.44+(i%3)*.06,.28]} c={['#82765e','#79604d','#506b60','#b4946c','#79534a'][i%5]}/>)}</group>)}
 </group>}
export default function ReadingLounge(){const fabric=useMemo(()=>surfaceRelief('fabric'),[]);useEffect(()=>()=>fabric.dispose(),[fabric]);return <group position={[0,7.2,0]}>
 <B p={[11.3,.02,0]} s={[4.7,.035,6.2]} c="#bd9b79"/>
 {READING_SOFA.map(({id,rect:[l,r,b,f]})=><group key={id}>
  <B p={[(l+r)/2,.23,(b+f)/2]} s={[r-l,.44,f-b]} c="#82442d"/>
  {Array.from({length:id==='reading-sofa-back'?5:3},(_,i)=>{const east=id==='reading-sofa-back',n=east?5:3;return <Soft cloth={fabric} key={i} p={[east?(l+r)/2:l+(i+.5)*(r-l)/n,.56,east?b+(i+.5)*(f-b)/n:(b+f)/2]} s={east?[.53,.22,.57]:[(r-l)/n*.54,.22,.56]}/>})}
 </group>)}
 <Soft cloth={fabric} p={[13.05,.91,0]} s={[.26,.5,2.83]} c="#984a2c"/>
 {[-1,1].map(a=><group key={a}>
  <Soft cloth={fabric} p={[11.15,.91,a*2.62]} s={[1.85,.5,.26]} c="#984a2c"/>
  {[9.95,10.9,11.85].map((x,i)=><Soft cloth={fabric} key={x} p={[x,.94,a*2.35]} s={[.43,.42,.18]} rot={[-a*.18,0,(i-1)*.1]} c={i%2?'#b36740':'#9a472c'}/>)}
 </group>)}
 <B p={[10.75,.5,0]} s={[1.5,.12,.9]} c="#cfb491"/><B p={[10.75,.24,0]} s={[.7,.48,.55]} c="#ab9070"/>
 <Shelf p={[11.2,0,-4.6]}/><Shelf p={[11.2,0,4.6]} turn={Math.PI}/><Shelf p={[14.6,0,0]} turn={-Math.PI/2} w={9.2}/>
 </group>}
