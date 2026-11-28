import {canReachEvent} from './interactionReach.js'
import React from 'react'
import {Box as B} from './GroundFloor'

export default function CafeBarDetails({onOpen}){
 const inspect=(text)=>e=>{e.stopPropagation();if(!canReachEvent(e))return;onOpen({type:'cafe-sign',text})}
 return <group>
 <group position={[-17.3,1.43,17.3]} onClick={inspect('COFFEE GRINDER\n원두를 담는 호퍼, 분쇄도 조절 다이얼과 토출구로 구성된 그라인더입니다. 커피는 손님 쪽 작은 메뉴판에서 살펴보세요.')}>
  <B p={[0,.02,0]} s={[.52,.04,.48]} c="#242625"/>
  <mesh position={[0,.63,0]}><cylinderGeometry args={[.17,.11,.30,20,1,true]}/><meshStandardMaterial color="#d8e6df" transparent opacity={.3} roughness={.12} depthWrite={false} side={2}/></mesh>
  <mesh position={[0,.79,0]}><cylinderGeometry args={[.18,.18,.035,20]}/><meshStandardMaterial color="#282b28"/></mesh>
  <mesh position={[0,.39,.16]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.055,.055,.04,16]}/><meshStandardMaterial color="#b7a37e" metalness={.5} roughness={.4}/></mesh>
  {[0,1,2,3,4,5,6,7].map(i=><mesh key={i} position={[Math.cos(i*2.4)*.08,.55+(i%3)*.035,Math.sin(i*2.4)*.08]} rotation={[0,i,0]} scale={[1,.5,.7]}><sphereGeometry args={[.035,6,4]}/><meshStandardMaterial color="#503628"/></mesh>)}
 </group>
 <group onClick={inspect('POUR OVER\n서버 위의 드리퍼와 종이 필터, 저울을 함께 사용하는 핸드드립 도구입니다. 가느다란 주전자의 물줄기로 천천히 추출합니다.')}>
 {[-17.3,-17.8].map(x=><group key={x} position={[x,1.43,18.3]}>
  <B p={[0,.032,.14]} s={[.18,.008,.09]} c="#202a26"/>
  <B p={[0,.038,.14]} s={[.10,.006,.02]} c="#c3cbb7"/>
  <mesh position={[.13,.16,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.085,.013,6,16]}/><meshStandardMaterial color="#c6d4cd" roughness={.2}/></mesh>
  <mesh position={[0,.38,0]}><coneGeometry args={[.155,.20,18,1,true]}/><meshStandardMaterial color="#eee4ce" side={2} roughness={1}/></mesh>
 </group>)}
 </group>
 <group position={[-18.2,1.6,19.85]} onClick={inspect('GOOSENECK KETTLE\n고리 손잡이와 긴 주둥이가 있는 드립 주전자입니다. 작은 물줄기로 커피 가루를 고르게 적시는 데 사용합니다.')}>
  <mesh position={[-.21,.07,0]}><torusGeometry args={[.13,.027,8,20]}/><meshStandardMaterial color="#303330" roughness={.35}/></mesh>
  <mesh position={[0,.18,0]}><cylinderGeometry args={[.13,.14,.025,20]}/><meshStandardMaterial color="#575b55" metalness={.65} roughness={.35}/></mesh>
  <mesh position={[0,.21,0]}><sphereGeometry args={[.035,10,6]}/><meshStandardMaterial color="#252824"/></mesh>
 </group>
 <group position={[-18.9,1.405,19.85]} onClick={inspect('CUP & SAUCER\n크림색 잔과 받침입니다. 메뉴판을 클릭하면 책과 영화에서 이름을 가져온 음료와 세트를 볼 수 있습니다.')}>
  <mesh position={[0,.018,0]}><cylinderGeometry args={[.18,.17,.035,20]}/><meshStandardMaterial color="#e8dfcc" roughness={.35}/></mesh>
  <mesh position={[0,.12,0]}><cylinderGeometry args={[.11,.075,.18,20,1,true]}/><meshStandardMaterial color="#f3ebda" roughness={.3} side={2}/></mesh>
  <mesh position={[.115,.12,0]}><torusGeometry args={[.055,.014,6,16]}/><meshStandardMaterial color="#eee4d0" roughness={.3}/></mesh>
 </group>
 </group>
}
