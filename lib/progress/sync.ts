'use client'

const LEARNER_KEY = 'lbeg-learner'

/** A stable anonymous learner id, stored locally. */
export function learnerId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.localStorage.getItem(LEARNER_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(LEARNER_KEY, id)
  }
  return id
}

/**
 * Best-effort progress sync. Fire-and-forget: uses sendBeacon when available
 * so it survives navigation, and never blocks or throws on the UI thread.
 */
export function syncEvent(kind: string, payload: unknown): void {
  if (typeof window === 'undefined') return
  try {
    const body = JSON.stringify({ learnerId: learnerId(), kind, payload })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/progress', new Blob([body], { type: 'application/json' }))
    } else {
      void fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* ignore — local persistence remains the source of truth */
  }
}
