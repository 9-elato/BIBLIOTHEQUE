import React from 'react'

// Keep the reading UI usable when WebGL or a model fails.
export default class SceneBoundary extends React.Component {
  state = {error: null}

  static getDerivedStateFromError(error) {
    return {error}
  }

  componentDidCatch(error, info) {
    console.error('3D 서재를 불러오지 못했습니다.', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <section className="scene-error" role="alert">
      <h2>3D 서재를 불러오지 못했어요.</h2>
      <p>페이지를 새로고침해 주세요. 내 책장 메뉴에서 독서 기록은 계속 확인할 수 있습니다.</p>
      <button onClick={() => window.location.reload()}>새로고침</button>
    </section>
  }
}
