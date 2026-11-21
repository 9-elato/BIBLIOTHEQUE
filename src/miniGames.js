export const GAME_SPOTS=[
 {id:'herbs',title:'온실 식물 짝맞추기',x:5.75,z:-15.7,y:7.97,level:7.2},
 {id:'shelves',title:'열람실 책 순서 퍼즐',x:10.25,z:0,y:8.07,level:7.2},
 {id:'cipher',title:'작업실 암호 자물쇠',x:.65,z:-28.72,y:1.12,level:0},
]
export const HERBS=['민트','라벤더','로즈마리','타임']
export function shuffled(items,random=Math.random){
 const result=[...items]
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return result
}
export const ordered=items=>items.every((n,i)=>n===i+1)
export function swapBooks(items,a,b){const next=[...items];[next[a],next[b]]=[next[b],next[a]];return next}
export function cipherFeedback(guess,answer){
 if(!/^\d{3}$/.test(guess))return {error:'숫자 세 자리를 입력해 주세요.'}
 let exact=0;const remaining=[],misplaced=[]
 for(let i=0;i<3;i++){if(guess[i]===answer[i])exact++;else{remaining.push(answer[i]);misplaced.push(guess[i])}}
 let near=0
 for(const digit of misplaced){const i=remaining.indexOf(digit);if(i!==-1){near++;remaining.splice(i,1)}}
 return {exact,near,won:exact===3}
}
