'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { ArrowRight, Images, Sparkles } from 'lucide-react'

const HeroCast = dynamic(
  () => import('@/components/hero/HeroCast').then((m) => m.HeroCast),
  { ssr: false }
)

export default function SplashPage() {
  const { nativeLang } = useAppStore()
  const t = getLocale(nativeLang).ui

  return (
    <main className="relative h-dvh overflow-hidden bg-[#e9e5dc]">
      {/* studio backdrop — soft top light fading down */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_50%_-10%,#f6f3ec_0%,#e9e5dc_55%,#dcd7cb_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 [background:linear-gradient(to_top,rgba(43,34,56,0.10),transparent)]" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center gap-7 px-6 py-6 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12">
        {/* ---- Copy ---- */}
        <section className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="clay-btn-soft inline-flex items-center gap-2 px-4 py-2 text-xs"
          >
            <Sparkles className="size-3.5 text-[var(--color-grape)]" aria-hidden />
            {t.splashBadge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="mt-5 text-[clamp(3rem,9vw,5.5rem)] font-black leading-[0.92] tracking-tight"
          >
            Say So
            <span className="mt-1 block text-[clamp(1.3rem,3.4vw,2.1rem)] text-[var(--color-grape)]">(Speak out loud)</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-muted-warm)]"
          >
            {t.splashSubtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4 }}
            className="mt-4 max-w-md text-base font-semibold leading-relaxed text-[var(--color-warm-text)] sm:text-lg"
          >
            {t.splashBody}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link href="/onboarding" className="clay-btn inline-flex items-center gap-2 px-8 py-4 text-lg">
              {t.splashCta}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link href="/gallery" className="clay-btn-soft inline-flex items-center gap-2 px-5 py-4 text-sm">
              <Images className="size-4 text-[var(--color-grape)]" aria-hidden />
              Product tour
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="mt-5 text-sm font-bold text-[var(--color-muted-warm)]"
          >
            {t.splashNote}
          </motion.p>
        </section>

        {/* ---- Yellow poster panel + animated cast ---- */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative h-[42vh] min-h-[260px] w-full lg:h-[68vh] lg:max-h-[620px]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-[#f4ca51] clay-shadow-lg">
            <div className="pointer-events-none absolute inset-x-0 top-[16%] h-[38%] bg-[#e7b93e]/60" />
            <HeroCast />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-[3px] border-[var(--color-ink)] bg-[#f4ca51] px-5 py-3">
              <span className="text-sm font-black uppercase tracking-widest text-[var(--color-ink)]">GPT Live · realtime voice</span>
              <span className="text-sm font-black text-[var(--color-ink)]">🇮🇩 🇪🇸 🇧🇷</span>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}