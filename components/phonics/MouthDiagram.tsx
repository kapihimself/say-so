'use client'

import { ARTIC, type Artic } from '@/lib/phonics/articulation'

const INK = 'var(--color-ink)'

/**
 * Schematic side-view (sagittal) diagram of the mouth showing where the tongue
 * and lips go for a given sound, plus the airflow and (for voiced sounds)
 * vibration marks at the throat.
 */
export function MouthDiagram({ artic, voiced, className }: { artic: Artic; voiced?: boolean; className?: string }) {
  const s = ARTIC[artic]

  return (
    <svg viewBox="0 0 260 220" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="mouth diagram">
      {/* face / vocal tract outer wall */}
      <path d="M 120,30 Q 155,25 185,45 Q 215,65 215,110 L 215,210" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {/* palate roof / back of throat */}
      <path d="M 98,95 Q 120,85 150,85 Q 185,90 185,130 L 185,210" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />

      {/* upper lip */}
      <path d={s.upperLip} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {/* upper teeth */}
      <path d="M 92,100 L 92,108 L 88,108 L 88,100 Z" fill="white" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />

      {/* tongue (dynamic) */}
      <path
        d={s.tongue}
        fill="var(--color-peach-soft)"
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
        style={{ transition: 'd 0.35s cubic-bezier(0.4,0,0.2,1)' }}
      />

      {/* lower teeth */}
      <path d="M 92,138 L 92,146 L 88,146 L 88,138 Z" fill="white" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />

      {/* lower lip / jaw (dynamic) */}
      <path
        d={s.lip}
        fill="none"
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="round"
        style={{ transition: 'd 0.35s cubic-bezier(0.4,0,0.2,1)' }}
      />

      {/* voiced vibration at the throat */}
      {voiced && (
        <g stroke="var(--color-bubblegum)" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M 178,192 Q 183,195 188,192" className="animate-pulse" />
          <path d="M 175,199 Q 183,202 191,199" className="animate-pulse" style={{ animationDelay: '0.15s' }} />
          <path d="M 178,206 Q 183,209 188,206" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
        </g>
      )}

      {/* airflow */}
      <path
        d={s.air}
        fill="none"
        stroke="var(--color-mint)"
        strokeWidth={3}
        strokeDasharray="6 4"
        className="airflow-dash"
        style={{ transition: 'd 0.35s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}
