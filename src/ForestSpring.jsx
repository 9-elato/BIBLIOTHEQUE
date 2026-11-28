import NaturalRocks from './NaturalRocks'
import ForestTrees from './ForestTrees'
import React,{useMemo,useEffect,useRef,useLayoutEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import StaticBatch from './StaticBatch'
import {ambientUpdateDue} from './ambientUpdates'
import {BASEMENT_HEIGHT as H,SPRING_POOL as P,SPRING_WALK_REGION,BASEMENT_BOUNDS,SPRING_OUTDOOR_REGION,SPRING_CURBS,SPRING_CANOPY_HEIGHT,SPRING_LANTERNS,SPRING_WATER_HEIGHT,SPRING_BENCH_TOP,cutFloor} from './basementLayout'
const rockCount=18,tileColumns=16,tileRows=40
function LandscapeInstances(){
 const rocks=useMemo(()=>Array.from({length:rockCount},(_,i)=>{return {position:[13.4-(i%3)*.35,H+.12,7.3+i*.52],scale:[.3+(i%3)*.07,.18+(i%4)*.03,.35],seed:i+31,waterLevel:H+.13,moss:true}}),[]),leaves=useRef(),tiles=useRef()
 useLayoutEffect(()=>{const o=new THREE.Object3D(),c=new THREE.Color()

  for(let i=0;i<180;i++){const plant=Math.floor(i/12),j=i%12,side=plant%2?-1:1,baseX=side<0?13.3:28.5,baseZ=7.4+Math.floor(plant/2)*1.2,a=j*2.4;o.position.set(baseX+Math.cos(a)*.4,H+.6+Math.sin(j*.7)*.28,baseZ+Math.sin(a)*.4);o.scale.set(.11,.52,.045);o.rotation.set(.7,a,.65);o.updateMatrix();leaves.current.setMatrixAt(i,o.matrix);c.set(['#365a3a','#567448','#77935a'][j%3]);leaves.current.setColorAt(i,c)}
  for(let i=0;i<tileColumns*tileRows;i++){o.position.set(18.25+(i%tileColumns)*.48,H+.025,-6.35+Math.floor(i/tileColumns)*.62);o.rotation.set(0,0,0);const inPool=Math.abs(o.position.x-P.x)<P.rx+.24&&Math.abs(o.position.z-P.z)<P.rz+.31;o.scale.set(inPool?0:.46,inPool?0:.06,inPool?0:.60);o.updateMatrix();tiles.current.setMatrixAt(i,o.matrix);c.set(['#48564e','#56625a','#606a5e','#414e49'][i%4]);tiles.current.setColorAt(i,c)}
  for(const ref of [leaves,tiles]){ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere()}
 },[])
 return <group><NaturalRocks rocks={rocks}/><instancedMesh ref={leaves} args={[null,null,180]}><sphereGeometry args={[1,6,4]}/><meshStandardMaterial roughness={.95}/></instancedMesh><instancedMesh ref={tiles} args={[null,null,tileColumns*tileRows]} receiveShadow><boxGeometry args={[1,1,1]}/><meshStandardMaterial metalness={.12} roughness={.38}/></instancedMesh></group>
}
function SpringWater(){
 const water=useRef(),steam=useRef(),last=useRef(null)
 const uniforms=useMemo(()=>({clock:{value:0}}),[])
 const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-P.rx,-P.rz);s.lineTo(P.rx,-P.rz);s.lineTo(P.rx,P.rz);s.lineTo(-P.rx,P.rz);s.closePath();return s},[])
 const mist=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const x=canvas.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(225,240,220,.23)');g.addColorStop(1,'rgba(225,240,220,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas)},[])
 useEffect(()=>()=>mist.dispose(),[mist])
 const pos=useMemo(()=>new Float32Array(18*3),[])
 useFrame(({clock})=>{if(!ambientUpdateDue(water.current,clock.elapsedTime,null))return;uniforms.clock.value=clock.elapsedTime;if(ambientUpdateDue(steam.current,clock.elapsedTime,last.current)){last.current=clock.elapsedTime;const a=steam.current.geometry.attributes.position;for(let i=0;i<18;i++){const t=(clock.elapsedTime*.12+i*.37)%1;a.setXYZ(i,Math.sin(i*2.4)*1.8+Math.sin(t*3+i)*.12,.25+t*1.15,Math.cos(i*2.4)*P.rz*.8)}a.needsUpdate=true}})
 return <group position={[P.x,H+SPRING_WATER_HEIGHT,P.z]}><mesh ref={water} rotation={[-Math.PI/2,0,0]}><shapeGeometry args={[shape]}/><shaderMaterial uniforms={uniforms} vertexShader="varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader="varying vec2 p;uniform float clock;void main(){float r=sin(length(p)*12.-clock*.65)*sin(p.x*5.+p.y*3.+clock*.3);float glint=pow(max(0.,r),9.);vec3 c=mix(vec3(.06,.19,.16),vec3(.23,.39,.30),.5+.5*sin(p.y*2.+p.x));gl_FragColor=vec4(c+vec3(.60,.43,.19)*glint*.28,1.);}" side={THREE.DoubleSide}/></mesh><mesh position={[6.2,2.58,22-P.z]}><planeGeometry args={[.55,5.8]}/><shaderMaterial uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} vertexShader="varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader="varying vec2 uvv;uniform float clock;void main(){float edge=sin(uvv.x*3.14159);float flow=.55+.25*sin(uvv.y*75.+clock*4.);gl_FragColor=vec4(.70,.82,.75,edge*flow);}"/></mesh><points ref={steam} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[pos,3]}/></bufferGeometry><pointsMaterial map={mist} size={1.35} transparent opacity={.30} depthWrite={false} color="#dce8d5"/></points></group>
}
function Fireflies({time,active}){
 const positions=useMemo(()=>Float32Array.from(Array.from({length:44},(_,i)=>[
  17+(i*.61803%1)*12,H+.55+(i*.41421%1)*2.8,5+(i*.73205%1)*18,
 ]).flat()),[])
 const uniforms=useMemo(()=>({clock:{value:0},brightness:{value:1}}),[])
 useFrame(({clock})=>{if(active){uniforms.clock.value=clock.elapsedTime;uniforms.brightness.value=time==='evening'?.65:.30}})
 if(!active)return null
 return <points>
  <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry>
  <shaderMaterial uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
   vertexShader={`uniform float clock;varying float glow;
   void main(){
    float phase=position.x*3.1+position.z*1.7;
    vec3 p=position+vec3(sin(clock*.7+phase)*.42,cos(clock*.6+phase)*.29,sin(clock*.43-phase)*.39);
    glow=pow(.5+.5*sin(clock*1.6+phase),3.0);
    vec4 view=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*view;
    gl_PointSize=clamp(84.0/max(1.0,-view.z),2.0,12.0);
   }`}
   fragmentShader={`uniform float brightness;varying float glow;
   void main(){
    float r=length(gl_PointCoord-.5)*2.0;
    float halo=(1.0-smoothstep(.0,1.0,r))*.42;
    float core=1.0-smoothstep(.08,.31,r);
    gl_FragColor=vec4(.88,1.0,.61,(halo+core*.58)*brightness*glow);
   }`}/>
 </points>
}
export default function ForestSpring({time,weather,active=true}){
 const trees=useMemo(()=>[[28,H,11],[12,H,16],[29.3,H,21]],[])
 return <group><StaticBatch revision={time}>
 {cutFloor(SPRING_WALK_REGION,BASEMENT_BOUNDS).flatMap(bounds=>cutFloor(bounds,[P.x-P.rx,P.x+P.rx,P.z-P.rz,P.z+P.rz])).map(([l,r,b,f],i)=><B key={'slab'+i} p={[(l+r)/2,H-.11,(b+f)/2]} s={[r-l,.22,f-b]} c="#465449"/>)}
 {[SPRING_OUTDOOR_REGION].map(([l,r,b,f])=><B key="outside-deck" p={[(l+r)/2,H-.11,(b+f)/2]} s={[r-l,.22,f-b]} c="#70664e"/>)}
 <B p={[P.x,H-1.04,P.z]} s={[P.rx*2,.16,P.rz*2]} c="#344c43"/>
 {[-1,1].map(side=><group key={'rim'+side}>
 <B p={[P.x+side*(P.rx+.08),H-.38,P.z]} s={[.16,1.24,P.rz*2+.32]} c="#56645b"/>
 <B p={[P.x+side*(P.rx+.08),H+.24,P.z]} s={[.28,.12,P.rz*2+.4]} c="#899083"/>
 <B p={[P.x,H-.38,P.z+side*(P.rz+.08)]} s={[P.rx*2,1.24,.16]} c="#56645b"/>
 <B p={[P.x,H+.24,P.z+side*(P.rz+.08)]} s={[P.rx*2,.12,.28]} c="#899083"/>
 </group>)}
 <B p={[P.x+P.rx-.42,H+SPRING_BENCH_TOP-.12,P.z]} s={[.78,.24,P.rz*2-.6]} c="#65776a"/>
 <B p={[25.35,H+SPRING_CANOPY_HEIGHT,12]} s={[1.6,.18,10]} c="#493d2e"/>
 {[7.1,16.8].map(z=><B key={'post'+z} p={[25.85,H+SPRING_CANOPY_HEIGHT/2,z]} s={[.14,SPRING_CANOPY_HEIGHT,.14]} c="#493d2e"/>)}
 {/* Dry edge deck and quiet timber lintel frame the existing open garden. */}
 {Array.from({length:40},(_,i)=><B key={'deck'+i} p={[25.35,H+.07,1.6+i*.39]} s={[.9,.04,.37]} c={i%3?'#705d45':'#806b50'}/>)}

 <B p={[24.68,H+.53,4.8]} s={[.65,.14,.19]} c="#887148"/>
 <mesh position={[24.39,H+.32,4.8]}><cylinderGeometry args={[.025,.04,.33,8]}/><meshStandardMaterial color="#b3cbb4" transparent opacity={.4}/></mesh>
 <B p={[26,H+2.43,0]} s={[.13,4.86,13.3]} c="#35453b"/>
 {Array.from({length:25},(_,i)=><B key={i} p={[25.92,H+.12+i*.19,0]} s={[.07,.025,13.25]} c="#637063"/>)}

 {SPRING_CURBS.map(({id,rect:[l,r,b,f]})=><B key={id} p={[(l+r)/2,H+.14,(b+f)/2]} s={[r-l,.28,f-b]} c="#59644f"/>)}
 {SPRING_LANTERNS.map(([x,z])=><group key={x+':'+z} position={[x,H+.20,z]}><B p={[0,0,0]} s={[.18,.4,.18]} c="#d8b77b" glow="#e3ab59"/><B p={[0,.24,0]} s={[.28,.06,.28]} c="#374339"/></group>)}
 <mesh position={[29,H+3.4,26]} scale={[3.4,4,1.4]}><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color="#596b56" roughness={1}/></mesh>

 </StaticBatch>{[[25.1,5],[25.1,13],[15.1,16],[21,25.5]].map(([x,z])=><pointLight key={x+':'+z} position={[x,H+.65,z]} color="#ffd393" intensity={active?(time==='evening'?1.6:.65):0} distance={4.5} decay={2}/>)}<ForestTrees positions={trees} weather={weather}/><LandscapeInstances/><SpringWater/><Fireflies time={time} active={active}/>
 </group>
}
