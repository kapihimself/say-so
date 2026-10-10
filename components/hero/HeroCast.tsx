'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Buddy, type BuddyLook } from '@/components/character/Buddy'

const GREETINGS = ['Hello!', '¡Hola!', 'Olá!', 'Hai!']

const GLYPHS = [
  { text: '/θ/', style: { top: '12%', left: '9%', fontSize: '1.5rem' } },
  { text: '/ʃ/', style: { top: '22%', right: '10%', fontSize: '1.8rem' } },
  { text: '/æ/', style: { top: '48%', left: '6%', fontSize: '1.2rem' } },
  { text: '/ɪ/', style: { top: '40%', right: '7%', fontSize: '1.3rem' } },
]

type Member = {
  look: BuddyLook
  height: string
  x: string
  floatDuration: number
  floatDelay: number
  popDelay: number
}

const CAST: Member[] = [
  { look: { skin: '#F1C9A5', hair: '#F4A8C0', hairStyle: 'bun', outfit: '#C8B0E8', cheeks: '#F4A8C0' }, height: '33%', x: '2%', floatDuration: 3.8, floatDelay: 0.4, popDelay: 0.35 },
  { look: { skin: '#F1C9A5', hair: '#9FB0F0', hairStyle: 'bun', outfit: '#E8856A', cheeks: '#F4A8C0' }, height: '46%', x: '0%', floatDuration: 3.2, floatDelay: 0, popDelay: 0.15 },
  { look: { skin: '#E8B88A', hair: '#F4C06A', hairStyle: 'buzz', outfit: '#7BC8A4' }, height: '35%', x: '-2%', floatDuration: 4.2, floatDelay: 0.8, popDelay: 0.55 },
]

export function HeroCast() {
  const reduced = useReducedMotion()
  const [greetingIdx, setGreetingIdx] = useState(0)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 55, damping: 16 })
  const sy = useSpring(my, { stiffness: 55, damping: 16 })
  const backX = useTransform(sx, (v) => v * 12)
  const backY = useTransform(sy, (v) => v * 7)
  const castX = useTransform(sx, (v) => v * -20)
  const castY = useTransform(sy, (v) => v * -12)

  useEffect(() => {
    const t = setInterval(() => setGreetingIdx((i) => (i + 1) % GREETINGS.length), 2200)
    return () => clearInterval(t)
  }, [])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  function onLeave() {
    mx.set(0)
    my.set(0)
  }

  const float = (duration: number, delay = 0) =>
    reduced
      ? {}
      : {
          y: [0, -12, 0],
          rotate: [-1.5, 1.5, -1.5],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay },
        }

  const squash = (duration: number, delay = 0) =>
    reduced
      ? {}
      : {
          scaleX: [1, 0.88, 1],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay },
        }

  return (
    <div className="absolute inset-0" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div
        className="pointer-events-none absolute left-1/2 top-[54%] h-[62%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-2xl"
        aria-hidden
      />

      <motion.div className="absolute inset-0" style={{ x: backX, y: backY }}>
        {GLYPHS.map((g, i) => (
          <motion.span
            key={g.text}
            className="absolute font-black"
            style={{ ...g.style, color: 'rgba(32,29,51,0.20)' }}
            animate={float(4.6, i * 0.7)}
          >
            {g.text}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-[13%] flex items-end justify-center gap-[5%] px-[8%]"
        style={{ x: castX, y: castY }}
      >
        {CAST.map((member, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.45, delay: member.popDelay, duration: 0.6 }}
            className="relative flex flex-col items-center"
            style={{ marginLeft: member.x, marginRight: member.x }}
          >
            <motion.div animate={float(member.floatDuration, member.floatDelay)} style={{ height: member.height, aspectRatio: '200 / 230' }}>
              <Buddy look={member.look} expression={i === 1 ? 'wow' : 'happy'} />
            </motion.div>
            <motion.div
              className="mt-1 h-2.5 w-3/5 rounded-full bg-black/20 blur-[3px]"
              animate={squash(member.floatDuration, member.floatDelay)}
              aria-hidden
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="absolute inset-x-0 top-[13%] flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={greetingIdx}
            initial={{ y: 10, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="doodle-outline doodle-shadow-sm rounded-2xl bg-white px-4 py-2 text-lg font-black text-[var(--color-ink)]"
          >
            {GREETINGS[greetingIdx]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}