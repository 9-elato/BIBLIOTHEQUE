export const PLAYLIST_ID='PLwnFC5mkHgK0SKn9B9ZhIhWMaeQYExn9H'
export const PLAYLIST_URL=`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`
export function recordIndex(value){return Math.max(0,Math.min(9,Math.trunc(Number(value)||0)))}
export function playlistRequest(index){return {listType:'playlist',list:PLAYLIST_ID,index:recordIndex(index),startSeconds:0}}
let pending
export function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT)
 if(pending)return pending
 pending=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady
  const timer=setTimeout(()=>{pending=null;reject(new Error('YouTube 연결이 지연되고 있습니다. 다시 시도해 주세요.'))},15000)
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);previous?.();resolve(window.YT)}
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true
  script.onerror=()=>{clearTimeout(timer);pending=null;script.remove();reject(new Error('YouTube에 연결할 수 없습니다.'))};document.head.appendChild(script)
 })
 return pending
}
