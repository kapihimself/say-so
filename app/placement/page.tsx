'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, LEVELS } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { CEFR_LEVELS, CEFR_ORDER } from '@/lib/cefr'
import { itemsForLevel, scorePlacement, ITEMS_PER_LEVEL, type Answer, type PlacementOutcome } from '@/lib/placement/engine'
import { syncEvent } from '@/lib/progress/sync'
import { ResultCard } from '@/components/placement/ResultCard'
import { ArrowRight, ArrowLeft, Check, X, GraduationCap, RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Phase = 'intro' | 'question' | 'result'

export default function PlacementPage() {
  const router = useRouter()
  const { nativeLang, setLevel } = useAppStore()
  const t = getLocale(nativeLang).ui

  const [phase, setPhase] = useState<Phase>('intro')
  const [levelIdx, setLevelIdx] = useState(0)
  const [itemIdx, setItemIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [outcome, setOutcome] = useState<PlacementOutcome | null>(null)

  const level = CEFR_ORDER[levelIdx]
  const items = itemsForLevel(level)
  const current = items[Math.min(itemIdx, items.length - 1)]
  const totalQuestions = CEFR_ORDER.length * ITEMS_PER_LEVEL
  const done = answers.length

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    setAnswers((prev) => [...prev, { item: current, correct: i === current.answer }])
  }

  function next() {
    const lastTwoCorrect = answers.filter((a) => a.item.level === level).filter((a) => a.correct).length

    if (itemIdx < ITEMS_PER_LEVEL - 1) {
      setItemIdx(itemIdx + 1)
      setSelected(null)
      return
    }

    if (lastTwoCorrect === 0 || levelIdx === CEFR_ORDER.length - 1) {
      const result = scorePlacement(answers)
      setOutcome(result)
      syncEvent('placement', result)
      setPhase('result')
      return
    }

    setLevelIdx(levelIdx + 1)
    setItemIdx(0)
    setSelected(null)
  }

  function useLevel() {
    if (!outcome) return
    setLevel(outcome.level)
    router.push('/karakter')
  }

  function retake() {
    setPhase('intro')
    setLevelIdx(0)
    setItemIdx(0)
    setSelected(null)
    setAnswers([])
    setOutcome(null)
  }

  return (
    <main className="relative mx-auto flex h-dvh max-w-3xl flex-col overflow-hidden px-5 py-5">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-sky-soft)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[var(--color-lemon-soft)] blur-2xl" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {/* ---- INTRO ---- */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
              <div className="grid size-14 place-items-center rounded-3xl bg-[var(--color-grape)] text-white doodle-outline doodle-shadow">
                <GraduationCap className="size-7" aria-hidden />
              </div>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">{t.plTitle}</h2>
              <p className="mt-2 max-w-md text-sm font-semibold text-[var(--color-muted-warm)]">{t.plIntro}</p>
              <div className="mt-4 max-w-md rounded-2xl bg-white p-4 doodle-outline doodle-shadow-sm">
                <p className="text-xs font-bold text-[var(--color-warm-text)]">{t.plMethod}</p>
                <p className="mt-1 text-[10px] font-semibold text-[var(--color-muted-warm)]">{t.plDisclaimer}</p>
              </div>
              <button onClick={() => setPhase('question')} className="doodle-btn mt-5 inline-flex items-center justify-center gap-2 bg-[var(--color-grape)] px-6 py-3 text-base text-white">
                {t.plStart} <ArrowRight className="size-4" aria-hidden />
              </button>
            </motion.div>
          )}

          {/* ---- QUESTION ---- */}
          {phase === 'question' && current && (
            <motion.div key={`q-${level}-${itemIdx}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full px-3 py-0.5 text-sm font-black text-white doodle-outline" style={{ background: LEVELS[level].color }}>
                  {level}
                </span>
                <span className="text-xs font-black text-[var(--color-muted-warm)]">
                  {t.plQuestion} {done + (selected === null ? 1 : 0)} {t.plOf} {totalQuestions}
                </span>
              </div>

              <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-white doodle-outline">
                <div className="h-full rounded-full bg-[var(--color-grape)] transition-all" style={{ width: `${(done / totalQuestions) * 100}%` }} />
              </div>

              <h3 className="text-xl font-black leading-snug sm:text-2xl">{current.prompt}</h3>

              <div className="mt-4 space-y-2">
                {current.options.map((opt, i) => {
                  const isChosen = selected === i
                  const isAnswer = i === current.answer
                  const revealed = selected !== null
                  return (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      disabled={revealed}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2.5 text-left text-base font-bold doodle-outline transition-all',
                        !revealed && 'doodle-shadow hover:translate-x-[1px] hover:translate-y-[1px]',
                        revealed && isAnswer && 'bg-[var(--color-mint-soft)] shadow-[3px_4px_0_0_var(--color-ink)]',
                        revealed && isChosen && !isAnswer && 'bg-[var(--color-bubblegum-soft)] shadow-[3px_4px_0_0_var(--color-ink)]'
                      )}
                    >
                      <span>{opt}</span>
                      {revealed && isAnswer && <Check className="size-4 text-[var(--color-mint)]" strokeWidth={3} aria-hidden />}
                      {revealed && isChosen && !isAnswer && <X className="size-4 text-[var(--color-bubblegum)]" strokeWidth={3} aria-hidden />}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence>
                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-white p-3 doodle-outline doodle-shadow-sm">
                    <p className={cn('text-xs font-black', selected === current.answer ? 'text-[var(--color-mint)]' : 'text-[var(--color-bubblegum)]')}>
                      {selected === current.answer ? t.plCorrect : t.plWrong}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[var(--color-warm-text)]">{current.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto pt-4">
                <button
                  onClick={next}
                  disabled={selected === null}
                  className="doodle-btn flex w-full items-center justify-center gap-2 bg-[var(--color-grape)] px-6 py-3 text-base text-white disabled:opacity-40"
                >
                  {levelIdx === CEFR_ORDER.length - 1 && itemIdx === ITEMS_PER_LEVEL - 1 ? t.plFinish : t.plNext}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          )}

          {/* ---- RESULT ---- */}
          {phase === 'result' && outcome && (
            <motion.div key="result" initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_auto]">
              {/* left: level info */}
              <div className="flex min-h-0 flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-warm)]">{t.plResult}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="grid size-16 shrink-0 place-items-center rounded-full text-2xl font-black text-white doodle-outline doodle-shadow" style={{ background: LEVELS[outcome.level].color }}>
                    {outcome.level}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{LEVELS[outcome.level].name}</h2>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-warm)]">
                      <Sparkles className="size-3.5 text-[var(--color-grape)]" aria-hidden />
                      {t.plConfidence}: {outcome.confidence === 'high' ? t.plHigh : outcome.confidence === 'medium' ? t.plMedium : t.plLow}
                      <span className="opacity-60">· {outcome.totalCorrect}/{outcome.totalAsked}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-white p-3 doodle-outline doodle-shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{t.plCanDo}</h3>
                  <ul className="mt-1.5 space-y-1">
                    {CEFR_LEVELS[outcome.level].canDo.slice(0, 2).map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-semibold text-[var(--color-warm-text)]">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--color-grape)]" />
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* right: card + actions */}
              <div className="flex min-h-0 flex-col items-center justify-center gap-2">
                <div className="w-full max-w-[200px]">
                  <ResultCard outcome={outcome} />
                </div>
                <button onClick={useLevel} className="doodle-btn inline-flex w-full max-w-[240px] items-center justify-center gap-2 bg-[var(--color-grape)] px-5 py-3 text-base text-white">
                  {t.plUseThis} <ArrowRight className="size-4" aria-hidden />
                </button>
                <button onClick={retake} className="doodle-btn inline-flex w-full max-w-[240px] items-center justify-center gap-2 bg-white px-5 py-2.5 text-sm font-extrabold">
                  <RotateCcw className="size-4" aria-hidden /> {t.plRetake}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 shrink-0">
          <Link href="/onboarding" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-muted-warm)] hover:text-[var(--color-grape)]">
            <ArrowLeft className="size-3.5" aria-hidden /> {t.obBack}
          </Link>
        </div>
      </div>
    </main>
  )
}
