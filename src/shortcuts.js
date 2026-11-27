export const SHORTCUTS={KeyE:'interact',KeyR:'posture',KeyQ:'read',KeyB:'blanket',KeyP:'popcorn',KeyC:'cola',KeyV:'sky',KeyF:'front',KeyM:'map',Escape:'close'}
export function shortcutAllowed(e){return !e.defaultPrevented&&!e.isComposing&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]')}
export function shortcutAction(e){return shortcutAllowed(e)&&!e.repeat?SHORTCUTS[e.code]||null:null}
export const SHORTCUT_HELP=[['W A S D / 방향키','이동 · 사다리에서는 오르내리기 / 좌우 이동'],['E','가까운 물건 사용 · 앉기 / 일어나기'],['R','리클라이너 젖히기 / 세우기 · 데이베드 눕기 / 앉기'],['Q','들고 있는 책 펼치기'],['B','좌석에서 담요 덮기 / 내려놓기'],['P / C','영화관에서 팝콘 먹기 / 콜라 마시기'],['V','잔디·테라스에서 하늘 보기'],['F','캐릭터 정면 보기'],['M','지도 열기 / 닫기'],['Esc','열린 창 닫기 · 자동 이동 취소']]
