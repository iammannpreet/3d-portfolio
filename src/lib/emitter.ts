export type Listener = () => void

export interface Emitter<E extends string> {
  /** Subscribes to an event. Returns the unsubscribe function. */
  on(event: E, cb: Listener): () => void
  emit(event: E): void
}

/** A minimal event emitter for the handful of discrete changes React needs to hear about. */
export function createEmitter<E extends string>(): Emitter<E> {
  const listeners = new Map<E, Set<Listener>>()
  return {
    on(event, cb) {
      let set = listeners.get(event)
      if (!set) {
        set = new Set()
        listeners.set(event, set)
      }
      set.add(cb)
      return () => {
        set.delete(cb)
      }
    },
    emit(event) {
      const set = listeners.get(event)
      if (!set) return
      for (const cb of [...set]) cb()
    },
  }
}
