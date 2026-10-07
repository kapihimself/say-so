'use client'

import { motion } from 'framer-motion'
import type { NativeLang } from '@/lib/store/appStore'
import { ARTIC, ARTIC_ACTIVE, ARTIC_MARK, MOUTH_LABELS, type Artic } from '@/lib/phonics/articulation'

const INK = 'var(--color-ink)'

/**
 * Animated, labelled articulation diagram. It moves: the jaw opens/closes, the
 * tongue shifts, air flows and — for voiced sounds — the vocal cords vibrate.
 * The active articulator is highlighted so it's obvious where the sound is made.
 */
export function MouthDiagram({
  artic,
  voiced,
  lang = 'id',
  className,
}: {
  artic: Artic
  voiced?: boolean
  lang?: NativeLang
  className?: string
}) {
  const s = ARTIC[artic]
  const active = ARTIC_ACTIVE[artic]
  const mark = ARTIC_MARK[active]
  const label = MOUTH_LABELS[active][lang]

  // plosives get a clear open/close "burst"; others a gentle motion
  const jawKeys = artic === 'lips-closed' ? [0, -11, 0, -11, 0] : artic === 'jaw-open' ? [0, 7, 0] : [0, -3, 0]
  const tongueKeys = active === 'tongue' ? [0, -5, 0] : [0, -2, 0]

  return (
    <svg viewBox="0 0 340 250" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${label} — ${artic}`}>
      {/* ---- fixed anatomy ---- */}
      <path d="M 140,32 Q 175,26 205,48 Q 236,70 236,116 L 236,232" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d="M 118,97 Q 140,87 170,87 Q 205,92 205,132 L 205,232" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d={s.upperLip} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d="M 92,100 L 92,108 L 88,108 L 88,100 Z" fill="white" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />

      {/* ---- tongue (animated) ---- */}
      <motion.g animate={{ y: tongueKeys }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
        <path d={s.tongue} fill="var(--color-peach-soft)" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </motion.g>

      {/* ---- lower jaw: teeth + lip (animated) ---- */}
      <motion.g animate={{ y: jawKeys }} transition={{ duration: artic === 'lips-closed' ? 1.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M 92,138 L 92,146 L 88,146 L 88,138 Z" fill="white" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        <path d={s.lip} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      </motion.g>

      {/* ---- active articulator highlight ---- */}
      <motion.circle
        cx={mark.x}
        cy={mark.y}
        r={16}
        fill="none"
        stroke="var(--color-bubblegum)"
        strokeWidth={3}
        strokeDasharray="4 4"
        animate={{ scale: [1, 1.35, 1], opacity: [0.95, 0.35, 0.95] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: `${mark.x}px ${mark.y}px` }}
      />
      <text x={mark.x} y={mark.y - 22} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--color-bubblegum)">
        {label}
      </text>

      {/* ---- airflow ---- */}
      <path
        d={s.air}
        fill="none"
        stroke="var(--color-mint)"
        strokeWidth={3}
        strokeDasharray="6 5"
        className="airflow-dash"
      />

      {/* ---- vocal cord vibration ---- */}
      {voiced && (
        <motion.g
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          stroke="var(--color-bubblegum)"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        >
          <path d="M 212,196 Q 218,200 224,196" />
          <path d="M 209,203 Q 218,207 227,203" />
          <path d="M 212,210 Q 218,214 224,210" />
        </motion.g>
      )}

      {/* ---- reference labels ---- */}
      <g fontSize="11" fontWeight="700" fill="var(--color-muted-warm)">
        <text x="243" y="120">
          {MOUTH_LABELS.palate[lang]}
        </text>
        <text x="16" y="118">
          {MOUTH_LABELS.lips[lang]}
        </text>
        <text x="16" y="176">
          {MOUTH_LABELS.jaw[lang]}
        </text>
        <text x="243" y="205">
          {MOUTH_LABELS.throat[lang]}
        </text>
      </g>
    </svg>
  )
}
