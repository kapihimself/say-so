'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { CEFR_LEVELS, CEFR_ORDER } from '@/lib/cefr'
import { LEVELS } from '@/lib/store/appStore'
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
    const lastTwoCorrect = answers
      .filter((a) => a.item.level === level)
      .filter((a) => a.correct).length

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
    <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--color-sky-soft)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[var(--color-lemon-soft)] blur-2xl" />

      <div className="relative z-10 flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {/* ---- INTRO ---- */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-1 flex-col justify-center">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[var(--color-grape)] text-white doodle-outline doodle-shadow">
                <GraduationCap className="size-8" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-black sm:text-4xl">{t.plTitle}</h2>
              <p className="mt-3 text-center text-lg font-semibold text-[var(--color-muted-warm)]">{t.plIntro}</p>
              <div className="mt-6 rounded-3xl bg-white p-5 doodle-outline doodle-shadow-sm">
                <p className="text-sm font-bold text-[var(--color-warm-text)]">{t.plMethod}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--color-muted-warm)]">{t.plDisclaimer}</p>
              </div>
              <button onClick={() => setPhase('question')} className="doodle-btn mt-8 inline-flex items-center justify-center gap-2 bg-[var(--color-grape)] px-7 py-4 text-lg text-white">
                {t.plStart} <ArrowRight className="size-5" />
              </button>
            </motion.div>
          )}

          {/* ---- QUESTION ---- */}
          {phase === 'question' && current && (
            <motion.div key={`q-${level}-${itemIdx}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex flex-1 flex-col">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full px-3 py-1 text-sm font-black text-white doodle-outline" style={{ background: LEVELS[level].color }}>
                  {level}
                </span>
                <span className="text-sm font-black text-[var(--color-muted-warm)]">
                  {t.plQuestion} {done + (selected === null ? 1 : 0)} {t.plOf} {totalQuestions}
                </span>
              </div>

              {/* progress */}
              <div className="mb-8 h-3 w-full overflow-hidden rounded-full bg-white doodle-outline">
                <div className="h-full rounded-full bg-[var(--color-grape)] transition-all" style={{ width: `${(done / totalQuestions) * 100}%` }} />
              </div>

              <h3 className="text-2xl font-black leading-snug sm:text-3xl">{current.prompt}</h3>

              <div className="mt-8 space-y-3">
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
                        'flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 text-left text-lg font-bold doodle-outline transition-all',
                        !revealed && 'doodle-shadow hover:translate-x-[1px] hover:translate-y-[1px]',
                        revealed && isAnswer && 'bg-[var(--color-mint-soft)] shadow-[3px_4px_0_0_var(--color-ink)]',
                        revealed && isChosen && !isAnswer && 'bg-[var(--color-bubblegum-soft)] shadow-[3px_4px_0_0_var(--color-ink)]'
                      )}
                    >
                      <span>{opt}</span>
                      {revealed && isAnswer && <Check className="size-5 text-[var(--color-mint)]" strokeWidth={3} />}
                      {revealed && isChosen && !isAnswer && <X className="size-5 text-[var(--color-bubblegum)]" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence>
                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-white p-4 doodle-outline doodle-shadow-sm">
                    <p className={cn('text-sm font-black', selected === current.answer ? 'text-[var(--color-mint)]' : 'text-[var(--color-bubblegum)]')}>
                      {selected === current.answer ? t.plCorrect : t.plWrong}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-warm-text)]">{current.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto pt-8">
                <button
                  onClick={next}
                  disabled={selected === null}
                  className="doodle-btn flex w-full items-center justify-center gap-2 bg-[var(--color-grape)] px-7 py-4 text-lg text-white disabled:opacity-40"
                >
                  {levelIdx === CEFR_ORDER.length - 1 && itemIdx === ITEMS_PER_LEVEL - 1 ? t.plFinish : t.plNext}
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ---- RESULT ---- */}
          {phase === 'result' && outcome && (
            <motion.div key="result" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-1 flex-col justify-center">
              <p className="text-center text-sm font-black uppercase tracking-widest text-[var(--color-muted-warm)]">{t.plResult}</p>
              <div className="mt-4 grid place-items-center">
                <div className="grid size-28 place-items-center rounded-full text-4xl font-black text-white doodle-outline doodle-shadow" style={{ background: LEVELS[outcome.level].color }}>
                  {outcome.level}
                </div>
              </div>
              <h2 className="mt-4 text-center text-2xl font-black">{LEVELS[outcome.level].name}</h2>

              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-muted-warm)]">
                <Sparkles className="size-4 text-[var(--color-grape)]" />
                {t.plConfidence}: {outcome.confidence === 'high' ? t.plHigh : outcome.confidence === 'medium' ? t.plMedium : t.plLow}
                <span className="opacity-60">· {outcome.totalCorrect}/{outcome.totalAsked}</span>
              </div>

              <div className="mt-6 rounded-3xl bg-white p-5 doodle-outline doodle-shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{t.plCanDo}</h3>
                <ul className="mt-3 space-y-2">
                  {CEFR_LEVELS[outcome.level].canDo.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-semibold text-[var(--color-warm-text)]">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-grape)]" />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <ResultCard outcome={outcome} />
              </div>

              <button onClick={useLevel} className="doodle-btn mt-6 inline-flex items-center justify-center gap-2 bg-[var(--color-grape)] px-7 py-4 text-lg text-white">
                {t.plUseThis} <ArrowRight className="size-5" />
              </button>
              <button onClick={retake} className="doodle-btn mt-3 inline-flex items-center justify-center gap-2 bg-white px-7 py-3 font-extrabold">
                <RotateCcw className="size-4" /> {t.plRetake}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <Link href="/onboarding" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--color-muted-warm)] hover:text-[var(--color-grape)]">
            <ArrowLeft className="size-4" /> {t.obBack}
          </Link>
        </div>
      </div>
    </main>
  )
}
