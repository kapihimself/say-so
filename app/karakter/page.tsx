'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Buddy } from '@/components/character/Buddy'
import { useAppStore, CHARACTERS } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { ArrowRight, Check, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function KarakterPage() {
  const router = useRouter()
  const { characterId, setCharacter, nativeLang, level } = useAppStore()
  const t = getLocale(nativeLang).ui
  const [selected, setSelected] = useState(characterId ?? CHARACTERS[0].id)
  const active = CHARACTERS.find((c) => c.id === selected) ?? CHARACTERS[0]

  function confirm() {
    setCharacter(selected)
    router.push(level === 'A1' ? '/mulai' : '/room')
  }

  function randomize() {
    const pick = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
    setSelected(pick.id)
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--color-grape-soft)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[var(--color-mint-soft)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-black sm:text-4xl">{t.karTitle}</h2>
        <p className="mt-2 text-center text-lg font-semibold text-[var(--color-muted-warm)]">
          {t.karSub}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Stage */}
          <div className="relative grid place-items-center rounded-[2rem] bg-gradient-to-b from-[var(--color-grape-soft)] to-[var(--color-sky-soft)] p-8 doodle-outline doodle-shadow">
            <div className="absolute bottom-10 h-6 w-44 rounded-full bg-[var(--color-ink)]/15 blur-md" />
            <motion.div
              key={active.id}
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="h-72 w-72"
            >
              <div className="h-full w-full animate-float">
                <Buddy look={active.look} expression="happy" />
              </div>
            </motion.div>
            <div className="mt-2 rounded-full bg-white px-6 py-2 text-xl font-black doodle-outline doodle-shadow-sm">
              {active.name}
            </div>
          </div>

          {/* Picker */}
          <div className="rounded-[2rem] bg-white p-6 doodle-outline doodle-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{t.karGallery}</h3>
              <button onClick={randomize} className="doodle-btn inline-flex items-center gap-1.5 bg-[var(--color-lemon)] px-4 py-2 text-sm">
                <Shuffle className="size-4" /> {t.karRandom}
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {CHARACTERS.map((c) => {
                const isOn = selected === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      'relative aspect-square rounded-2xl p-2 doodle-outline transition-all',
                      isOn ? 'translate-x-[1px] translate-y-[1px] bg-[var(--color-bubblegum-soft)] shadow-[2px_3px_0_0_var(--color-ink)]' : 'bg-[var(--color-cloud)] doodle-shadow-sm hover:-translate-y-0.5'
                    )}
                    style={{ background: isOn ? undefined : (c.look.outfit + '22') }}
                  >
                    {isOn && (
                      <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-[var(--color-mint)] doodle-outline">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                    )}
                    <Buddy look={c.look} />
                  </button>
                )
              })}
            </div>

            <button onClick={confirm} className="doodle-btn mt-6 flex w-full items-center justify-center gap-2 bg-[var(--color-grape)] px-6 py-4 text-lg text-white">
              {t.karEnter} <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
