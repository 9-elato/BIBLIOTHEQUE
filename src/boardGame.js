export const winningLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
export function boardResult(b){for(const line of winningLines)if(b[line[0]]&&line.every(i=>b[i]===b[line[0]]))return b[line[0]];return b.every(Boolean)?'draw':null}
export function playBoard(board,index){
 if(board[index]||boardResult(board))return board
 const b=[...board];b[index]='star';if(boardResult(b))return b
 let pick
 for(const side of ['moon','star']){for(let i=0;i<9;i++){if(b[i])continue;const trial=[...b];trial[i]=side;if(boardResult(trial)===side){pick=i;break}}if(pick!==undefined)break}
 if(pick===undefined)pick=[4,0,2,6,8,1,3,5,7].find(i=>!b[i])
 if(pick!==undefined)b[pick]='moon';return b
}
