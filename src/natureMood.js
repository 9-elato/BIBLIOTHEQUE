// All outdoor renderers use this world-space direction toward the sun.
export function solarProfile(time='afternoon'){
 const profiles={morning:{direction:[.85,.38,.3],color:'#ffe5c9',strength:.72,sky:'#72b6de',horizon:'#f1dfce'},noon:{direction:[.12,.96,.24],color:'#fff4dc',strength:1.25,sky:'#238cdd',horizon:'#b8dfea'},afternoon:{direction:[-.45,.65,.35],color:'#ffe4b4',strength:1,sky:'#4b9dd5',horizon:'#d8dfd0'},evening:{direction:[-.88,.23,.25],color:'#f6bf86',strength:.36,sky:'#354e77',horizon:'#c59c8c'}}
 const p=profiles[time==='night'?'evening':time]||profiles.afternoon,l=Math.hypot(...p.direction)
 return {...p,direction:p.direction.map(v=>v/l)}
}
// Shared daylight, weather and depth palette for the manor and its views.
export function natureMood(time='afternoon',weather='sunny'){
 const solar=solarProfile(time)
 const evening=time==='evening'||time==='night',wet=weather==='rain',snow=weather==='snow',overcast=wet||snow
 return {evening,wet,snow,sunDirection:solar.direction,sunStrength:overcast?.25:solar.strength,sky:overcast?'#a4b7bc':solar.sky,horizon:overcast?'#ccd5ce':solar.horizon,fog:evening?'#647782':overcast?'#b8c7c4':'#b5cbc4',far:evening?'#60777a':overcast?'#97b0a6':'#93b4a3',mid:evening?'#354e49':snow?'#8d9e89':'#527c59',near:evening?'#1f3630':snow?'#657b63':'#2c5339',sea:evening?'#315b77':wet?'#4f7c8b':'#258db3',sun:overcast?'#dbe5e0':solar.color,wind:wet?.75:.28,fogNear:overcast?43:70,fogFar:overcast?145:185}
}
export function sceneLighting({time,weather,outside=false,greenhouse=false,cozy=false}){
 const m=natureMood(time,weather)
 return {...m,ambient:greenhouse?.25:m.evening?(outside?.23:.30):(cozy?.32:.44),hemisphere:m.evening?(outside?.40:.48):(cozy?.62:.90),direct:greenhouse?0:m.evening?(outside?.50:.38):(m.wet||m.snow?.65:outside?1.65*m.sunStrength:cozy?.65*m.sunStrength:1.10*m.sunStrength)}
}
