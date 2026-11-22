// Shared daylight, weather and depth palette for the manor and its views.
export function natureMood(time='afternoon',weather='sunny'){
 const evening=time==='evening'||time==='night',wet=weather==='rain',snow=weather==='snow',overcast=wet||snow
 return {evening,wet,snow,sky:evening?'#52677b':overcast?'#a4b7bc':'#a8cddd',horizon:evening?'#a19895':overcast?'#ccd5ce':'#e5e4c6',fog:evening?'#647782':overcast?'#b8c7c4':'#b5cbc4',far:evening?'#60777a':overcast?'#97b0a6':'#93b4a3',mid:evening?'#354e49':snow?'#8d9e89':'#527c59',near:evening?'#1f3630':snow?'#657b63':'#2c5339',sea:evening?'#315b77':wet?'#4f7c8b':'#258db3',sun:evening?'#f6bf86':overcast?'#dbe5e0':'#ffe4b4',wind:wet?.75:.28,fogNear:overcast?43:70,fogFar:overcast?145:185}
}
export function sceneLighting({time,weather,outside=false,greenhouse=false,cozy=false}){
 const m=natureMood(time,weather)
 return {...m,ambient:greenhouse?.25:m.evening?(outside?.23:.30):(cozy?.32:.44),hemisphere:m.evening?(outside?.40:.48):(cozy?.62:.90),direct:greenhouse?0:m.evening?(outside?.50:.38):(m.wet||m.snow?.65:outside?1.65:cozy?.65:1.10)}
}
