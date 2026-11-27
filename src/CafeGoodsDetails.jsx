import React from 'react'
import * as THREE from 'three'
import {Box as B} from './GroundFloor'
import StaticBatch from './StaticBatch'
export default function CafeGoodsDetails({onSelect}){
 return <group position={[0,.10,0]}>
 {[
  [-24.3,2.42,.29,.8,'티백 모양 책갈피'],[-23.54,2.31,.94,.4,'과일 모양 투명 책갈피'],
  [-22.53,2.46,.5,.83,'영화유령단 에코백'],[-21.95,2.37,.29,.58,'북커버'],
  [-21.6,2.37,.29,.58,'노트'],[-21.18,2.3,.33,.43,'달력'],[-20.78,2.37,.29,.58,'큐앤에이다이어리'],
  [-23.2,1.47,.62,.39,'눈사람 실내화'],[-22.75,1.35,.43,.22,'녹은 눈사람 모양 냉장고 마그넷'],
  [-22.4,1.62,.37,.65,'독서하는 유령 소형 조각상'],[-21.3,1.47,.6,.3,'여우의 삐뚤어진 안경 키링']
 ].map(([x,y,w,h,name])=><mesh key={name} position={[x,y,16.18]} userData={{noCameraCollision:true}} onClick={e=>{e.stopPropagation();onSelect?.(name)}}><planeGeometry args={[w,h]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide}/></mesh>)}
 <StaticBatch>
 <B p={[-22.65,2.53,15.76]} s={[4.3,1.05,.06]} c="#e6dcc8"/>
 <B p={[-24.3,2.86,15.91]} s={[.025,.025,.30]} c="#72634d"/>
 <B p={[-22.65,2.05,15.85]} s={[4.3,.07,.85]} c="#947149"/>
 {/* Hanging tea-bag bookmark with string and paper tag. */}
 <mesh position={[-24.3,2.34,16.02]}><boxGeometry args={[.23,.34,.025]}/><meshStandardMaterial color="#e8d8b7" transparent opacity={.65}/></mesh>
 {[0,1,2,3,4,5].map(i=><B key={i} p={[-24.37+(i%3)*.07,2.23+Math.floor(i/3)*.07,16.04]} s={[.035,.025,.01]} c="#6c7351"/>)}
 <B p={[-24.3,2.62,16.02]} s={[.008,.23,.008]} c="#e5d9bf"/><B p={[-24.3,2.77,16.02]} s={[.15,.12,.02]} c="#45665a"/>
 {/* Translucent fruit slices and radial segments. */}
 {['#dc9a4c','#dccd70','#91ad66'].map((color,i)=><group key={color} position={[-23.85+i*.31,2.31,16.03]}>
 <mesh><circleGeometry args={[.14,24]}/><meshStandardMaterial color={color} transparent opacity={.55} side={THREE.DoubleSide}/></mesh>
 <mesh><ringGeometry args={[.125,.14,24]}/><meshStandardMaterial color={color} side={THREE.DoubleSide}/></mesh>
 {Array.from({length:8},(_,n)=><group key={n} rotation={[0,0,n*Math.PI/4]}><B p={[0,.064,.005]} s={[.009,.11,.01]} c="#f4e9c9"/></group>)}
 </group>)}
 {/* Canvas tote and two rounded handles. */}
 <B p={[-22.53,2.39,15.92]} s={[.48,.61,.13]} c="#e9ddbf"/>
 {[-.055,.055].map(z=><mesh key={z} position={[-22.53,2.75,15.92+z]}><torusGeometry args={[.15,.017,6,20,Math.PI]}/><meshStandardMaterial color="#d4c29c"/></mesh>)}
 <mesh position={[-22.53,2.43,16.0]} scale={[.10,.13,.025]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#faf4e7"/></mesh>
 {[-.035,.035].map(x=><mesh key={x} position={[-22.53+x,2.47,16.03]}><sphereGeometry args={[.012,6,4]}/><meshBasicMaterial color="#34483d"/></mesh>)}
 <B p={[-22.53,2.30,16.03]} s={[.18,.085,.015]} c="#567364"/>
 {/* Cloth book cover, notebook, tent calendar and diary. */}
 {[-21.95,-21.6,-20.78].map((x,i)=><group key={x}><B p={[x,2.37,15.93]} s={[.28,.54,.10]} c={['#476858','#b3a080','#7b5862'][i]}/><B p={[x+.015,2.37,15.99]} s={[.22,.48,.015]} c={i===0?'#52745f':'#f0e5ce'}/>{[0,1,2,3].map(n=><B key={n} p={[x,2.27+n*.07,16.01]} s={[.17,.008,.008]} c="#b7a98f"/>)}</group>)}
 <group position={[-21.18,2.28,15.96]} rotation={[-.18,0,0]}><B p={[0,0,0]} s={[.30,.38,.04]} c="#eee4ce"/>{Array.from({length:12},(_,i)=><B key={i} p={[-.09+(i%3)*.09,-.1+Math.floor(i/3)*.065,.025]} s={[.028,.025,.008]} c="#5c7667"/>)}</group>
 </StaticBatch></group>
}
