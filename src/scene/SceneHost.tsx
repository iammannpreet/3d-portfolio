import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { supportsWebGL } from '../lib/quality'
import { setSceneStatus, useSceneStatus } from '../scroll/store'

// three.js, drei and the scene itself load as a separate chunk so the page text paints first.
const Scene = lazy(() => import('./Scene'))

interface BoundaryProps {
  onError: () => void
  children: ReactNode
}

class SceneErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('The 3D scene failed; showing the static fallback instead.', error)
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The fixed, full-viewport layer behind the page. It holds the WebGL scene when the browser can
 * run it, and a static backdrop when it cannot (no WebGL, or the scene threw).
 */
export function SceneHost() {
  const status = useSceneStatus()
  const [supported] = useState(supportsWebGL)

  useEffect(() => {
    if (!supported) setSceneStatus('unsupported')
  }, [supported])

  const off = !supported || status === 'failed' || status === 'unsupported'

  return (
    <div className="scene-host" aria-hidden="true" data-off={off ? '' : undefined}>
      {!off && (
        <SceneErrorBoundary onError={() => setSceneStatus('failed')}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  )
}
