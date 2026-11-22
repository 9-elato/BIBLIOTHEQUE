export const winningLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
export function boardResult(b){for(const line of winningLines)if(b[line[0]]&&line.every(i=>b[i]===b[line[0]]))return b[line[0]];return b.every(Boolean)?'draw':null}
function score(board,side,depth=0){
 const result=boardResult(board);if(result)return result==='moon'?10-depth:result==='star'?depth-10:0
 const values=[];for(let i=0;i<9;i++)if(!board[i]){const next=[...board];next[i]=side;values.push(score(next,side==='moon'?'star':'moon',depth+1))}
 return side==='moon'?Math.max(...values):Math.min(...values)
}
export function playBoard(board,index){
 if(!Number.isInteger(index)||index<0||index>8||board[index]||boardResult(board))return board
 const b=[...board];b[index]='star';if(boardResult(b))return b
 let pick,best=-Infinity
 for(const i of [4,0,2,6,8,1,3,5,7])if(!b[i]){const next=[...b];next[i]='moon';const value=score(next,'star');if(value>best){best=value;pick=i}}
 if(pick!==undefined)b[pick]='moon';return b
}
