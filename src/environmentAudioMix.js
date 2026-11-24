const clamp=v=>Math.max(0,Math.min(1,v))
const near=(distance,radius)=>{const t=clamp(1-distance/radius);return t*t*(3-2*t)}
export function environmentMix({x=0,z=0},zone,weather='sunny',time='afternoon'){
 const outside=['저택 정원','동쪽 잔디 들판','잔디 동산','숲 온천','별빛 테라스'].includes(zone)
 const forest=Math.max(near(Math.abs(x-35),30)*near(Math.abs(z-22),55),near(Math.abs(z-125),35),zone==='숲 온천'?.95:0)
 const coast=Math.max(near(Math.abs(z+34),55),near(Math.abs(x+39),45))
 const opening=zone==='개인 작업실'?.32:zone==='바다 마루'?.55:0
 const storm=weather==='rain'?1:weather==='snow'?.65:.25
 return {wind:outside?.012+storm*.035:.002,leaves:outside?(.006+forest*.055)*(1+storm*.4):zone==='실내 온실'?.006:0,
 surf:outside?coast*.065:opening*.065,water:outside?coast*.018:opening*.018,rocks:outside?coast*.024:opening*.024,
 birds:outside?(.1+forest*.9)*(weather==='sunny'?1:.2)*(time==='evening'?.25:1):0}
}
export function nextBirdDelay(random=Math.random){return 4+random()*12}
