import React from 'react'
import {SHORTCUT_HELP} from './shortcuts'
export default function ShortcutGuide(){return <section><h3>조작 안내</h3><p>가능한 동작만 현재 위치에 표시됩니다. 모바일에서는 오른쪽 동작 버튼을 누르세요.</p><dl className="shortcut-guide">{SHORTCUT_HELP.map(([key,text])=><React.Fragment key={key}><dt><kbd>{key}</kbd></dt><dd>{text}</dd></React.Fragment>)}</dl><p>바닥 클릭: 목적지까지 자동 이동 · 화면 드래그: 시점 회전 · 모바일 두 손가락: 확대·축소</p><small>문자 입력 중이나 Ctrl·Alt·⌘ 조합을 사용할 때에는 게임 단축키가 작동하지 않습니다.</small></section>}
