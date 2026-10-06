'use client'

import { useEffect, useRef } from 'react'
import { talkLevel } from '@/lib/audio/talkLevel'

/**
 * Live 8-band voice meter driven by the shared talkLevel signal.
 * Reads the signal on an animation frame so it stays in lockstep with the
 * 3D mouth without re-rendering the page.
 */
export function LevelMeter({ label, className }: { label?: string; className?: string }) {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const bands = talkLevel.bands
      for (let i = 0; i < bands.length; i++) {
        const el = refs.current[i]
        if (!el) continue
        const h = 6 + bands[i] * 34
        el.style.height = `${h}px`
        el.style.opacity = talkLevel.active ? '1' : '0.35'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">
          <span className="inline-block size-1.5 rounded-full bg-[var(--color-bubblegum)] animate-pulse" />
          {label}
        </div>
      )}
      <div className="flex h-10 items-end gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            className="w-1.5 rounded-full bg-[var(--color-grape)] transition-[height] duration-75"
            style={{ height: 6 }}
          />
        ))}
      </div>
    </div>
  )
}
