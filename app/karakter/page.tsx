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
    <main className="relative h-dvh overflow-hidden px-5 py-5">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--color-grape-soft)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[var(--color-mint-soft)] blur-2xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col">
        <h2 className="shrink-0 text-center text-2xl font-black sm:text-3xl">{t.karTitle}</h2>
        <p className="mt-1 shrink-0 text-center text-sm font-semibold text-[var(--color-muted-warm)]">{t.karSub}</p>

        <div className="mt-3 grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
          {/* Stage */}
          <div className="relative grid min-h-0 place-items-center rounded-[2rem] bg-gradient-to-b from-[var(--color-grape-soft)] to-[var(--color-sky-soft)] p-4 doodle-outline doodle-shadow">
            <div className="absolute bottom-8 h-5 w-40 rounded-full bg-[var(--color-ink)]/15 blur-md" />
            <motion.div
              key={active.id}
              initial={{ scale: 0.85, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="h-[min(48vh,260px)] w-[min(48vh,260px)]"
            >
              <div className="h-full w-full animate-float">
                <Buddy look={active.look} expression="happy" />
              </div>
            </motion.div>
            <div className="absolute bottom-3 rounded-full bg-white px-5 py-1.5 text-lg font-black doodle-outline doodle-shadow-sm">
              {active.name}
            </div>
          </div>

          {/* Picker */}
          <div className="flex min-h-0 flex-col rounded-[2rem] bg-white p-4 doodle-outline doodle-shadow">
            <div className="flex shrink-0 items-center justify-between">
              <h3 className="text-base font-black">{t.karGallery}</h3>
              <button onClick={randomize} className="doodle-btn inline-flex items-center gap-1.5 bg-[var(--color-lemon)] px-3 py-1.5 text-xs">
                <Shuffle className="size-3.5" aria-hidden /> {t.karRandom}
              </button>
            </div>
            <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden">
              {CHARACTERS.map((c) => {
                const isOn = selected === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      'relative aspect-square rounded-2xl p-1.5 doodle-outline transition-all',
                      isOn ? 'translate-x-[1px] translate-y-[1px] bg-[var(--color-bubblegum-soft)] shadow-[2px_3px_0_0_var(--color-ink)]' : 'bg-[var(--color-cloud)] doodle-shadow-sm hover:-translate-y-0.5'
                    )}
                    style={{ background: isOn ? undefined : (c.look.outfit + '22') }}
                  >
                    {isOn && (
                      <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-[var(--color-mint)] doodle-outline">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                    <Buddy look={c.look} />
                  </button>
                )
              })}
            </div>

            <button onClick={confirm} className="doodle-btn mt-3 flex w-full shrink-0 items-center justify-center gap-2 bg-[var(--color-grape)] px-5 py-3 text-base text-white">
              {t.karEnter} <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
