/** The debug handle the app exposes with `?debug` (see src/debug.ts), as the tools use it. */
interface RideDebugHandle {
  bridge: { ready: { helmet: boolean; bike: boolean }; sceneStatus: string }
  scroll: { active: string; chapters: { id: string }[] }
  chapterScrollY(id: string, at?: number): number | null
}

interface Window {
  __ride?: RideDebugHandle
}
