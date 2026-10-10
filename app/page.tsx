'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Buddy, type BuddyLook } from '@/components/character/Buddy'
import { useAppStore } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { ArrowRight, Sparkles } from 'lucide-react'

const FLOATERS: { look: BuddyLook; top: string; left: string; size: number; delay: number }[] = [
  { look: { skin: '#E8B88A', hair: '#7BC8A4', hairStyle: 'puff', outfit: '#7BB8E8', cheeks: '#F4A8C0' }, top: '12%', left: '8%', size: 110, delay: 0 },
  { look: { skin: '#F1C9A5', hair: '#F4A8C0', hairStyle: 'bun', outfit: '#C8B0E8', cheeks: '#F4A8C0' }, top: '60%', left: '4%', size: 130, delay: 0.6 },
  { look: { skin: '#B07D56', hair: '#9FB0F0', hairStyle: 'swoop', outfit: '#F4C06A' }, top: '16%', left: '82%', size: 120, delay: 1.1 },
  { look: { skin: '#8C5A3C', hair: '#C8B0E8', hairStyle: 'curly', outfit: '#9BD89B', cheeks: '#E89B9B' }, top: '64%', left: '80%', size: 140, delay: 0.3 },
]

export default function SplashPage() {
  const { nativeLang } = useAppStore()
  const t = getLocale(nativeLang).ui
  return (
    <main className="relative h-dvh overflow-hidden">
      {/* pastel blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[var(--color-bubblegum-soft)] blur-2xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-96 w-96 rounded-full bg-[var(--color-sky-soft)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[var(--color-lemon-soft)] blur-2xl" />

      {/* floating buddies (hidden on small screens) */}
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          className="pointer-events-none absolute hidden md:block animate-float"
          style={{ top: f.top, left: f.left, width: f.size, height: f.size, animationDelay: `${f.delay}s` }}
        >
          <Buddy look={f.look} />
        </div>
      ))}

      <section className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 doodle-outline doodle-shadow-sm text-sm font-extrabold"
        >
          <Sparkles className="size-4 text-[var(--color-grape)]" />
          {t.splashBadge}
        </motion.div>

        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', bounce: 0.4 }}
          className="text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl"
        >
          Say So
          <br />
          <span className="text-[var(--color-grape)] text-4xl sm:text-5xl">(Speak out loud)</span>
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm font-bold uppercase tracking-widest text-[var(--color-bubblegum)]"
        >
          {t.splashSubtitle}
        </motion.p>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 max-w-xl text-lg font-semibold text-[var(--color-muted-warm)]"
        >
          {t.splashBody}
        </motion.p>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <Link
            href="/onboarding"
            className="doodle-btn inline-flex items-center gap-2 bg-[var(--color-grape)] px-8 py-4 text-lg text-white"
          >
            {t.splashCta}
            <ArrowRight className="size-5" />
          </Link>
          <p className="mt-4 text-sm font-semibold text-[var(--color-muted-warm)]">
            {t.splashNote}
          </p>
        </motion.div>
      </section>
    </main>
  )
}
