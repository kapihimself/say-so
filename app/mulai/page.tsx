'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store/appStore'
import { getLocale, fmt } from '@/lib/i18n'
import { ALPHABET } from '@/lib/phonics/alphabet'
import { speak } from '@/lib/tts'
import { useVoice } from '@/lib/hooks/useVoice'
import { scorePronunciation, wordToPhonemes, phonemesToString } from '@/lib/phonetics/g2p'
import {
  ArrowRight,
  Mic,
  Square,
  Loader2,
  Volume2,
  CheckCircle,
  RotateCcw,
  GraduationCap,
  SkipForward,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TEST_WORDS = ['cat', 'day', 'sheep', 'ship', 'thin']
type Step = 'welcome' | 'alphabet' | 'test' | 'done'

export default function MulaiPage() {
  const router = useRouter()
  const { name, level, nativeLang } = useAppStore()
  const locale = getLocale(nativeLang)
  const t = locale.ui

  const [step, setStep] = useState<Step>('welcome')
  const [selected, setSelected] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const { recording, transcribing, start, stop } = useVoice('en-US')

  const welcomed = useRef(false)
  const welcomeMsg = fmt(t.tutWelcome, { name: name || 'Sobat', level: level ?? 'A1' })

  useEffect(() => {
    if (welcomed.current) return
    welcomed.current = true
    speak(welcomeMsg, locale.speechTag, 0.95)
  }, [welcomeMsg, locale.speechTag])

  const word = TEST_WORDS[idx]
  const wordIpa = phonemesToString(wordToPhonemes(word))

  async function handleMic() {
    if (recording) {
      const text = await stop()
      setHeard(text)
      setScore(text ? scorePronunciation(word, text).score : 0)
    } else {
      setScore(null)
      setHeard('')
      await start()
    }
  }

  function nextWord() {
    if (idx >= TEST_WORDS.length - 1) {
      setStep('done')
      return
    }
    setIdx(idx + 1)
    setScore(null)
    setHeard('')
  }

  return (
    <main className="relative mx-auto flex h-dvh max-w-2xl flex-col overflow-hidden px-6 py-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--color-sky-soft)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[var(--color-lemon-soft)] blur-2xl" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {/* ---- WELCOME ---- */}
          {step === 'welcome' && (
            <motion.div key="welcome" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
              <div className="grid size-16 place-items-center rounded-3xl bg-[var(--color-grape)] text-white doodle-outline doodle-shadow">
                <GraduationCap className="size-8" aria-hidden />
              </div>
              <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                {fmt('{name} 👋', { name: name || 'Sobat' })}
              </h2>
              <p className="mt-4 max-w-lg text-lg font-semibold text-[var(--color-warm-text)]">{welcomeMsg}</p>
              <button
                onClick={() => speak(welcomeMsg, locale.speechTag, 0.95)}
                className="doodle-btn mt-6 inline-flex items-center gap-2 bg-white px-5 py-2.5 font-extrabold"
              >
                <Volume2 className="size-4" aria-hidden /> {t.narrateLabel}
              </button>
              <button
                onClick={() => setStep('alphabet')}
                className="doodle-btn mt-6 inline-flex items-center gap-2 bg-[var(--color-grape)] px-8 py-4 text-lg text-white"
              >
                {t.obNext} <ArrowRight className="size-5" aria-hidden />
              </button>
            </motion.div>
          )}

          {/* ---- ALPHABET PHONICS ---- */}
          {step === 'alphabet' && (
            <motion.div key="alphabet" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="shrink-0 text-xl font-black sm:text-2xl">{t.tutPhonicsTitle}</h2>
              <p className="mt-1 shrink-0 text-xs font-semibold text-[var(--color-muted-warm)]">{t.tutPhonicsHint}</p>

              <div className="mt-3 grid min-h-0 flex-1 auto-rows-fr grid-cols-6 gap-1.5 sm:grid-cols-8">
                {ALPHABET.map((l) => (
                  <button
                    key={l.letter}
                    onClick={() => {
                      setSelected(l.letter)
                      speak(l.letter, 'en-US', 0.85)
                    }}
                    aria-label={`${l.letter} ${l.ipa}`}
                    className={cn(
                      'min-h-0 rounded-lg text-base font-black doodle-outline transition-all',
                      selected === l.letter ? 'translate-y-px bg-[var(--color-grape)] text-white shadow-[2px_3px_0_0_var(--color-ink)]' : 'bg-white doodle-shadow-sm hover:-translate-y-0.5'
                    )}
                  >
                    {l.letter}
                  </button>
                ))}
              </div>

              {selected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl bg-white p-3 doodle-outline doodle-shadow-sm">
                  {(() => {
                    const l = ALPHABET.find((x) => x.letter === selected)!
                    return (
                      <>
                        <div>
                          <div className="text-3xl font-black">
                            {l.letter} <span className="text-lg text-[var(--color-grape)]">{l.ipa}</span>
                          </div>
                          <p className="text-sm font-bold text-[var(--color-muted-warm)]">
                            {l.example} {phonemesToString(wordToPhonemes(l.example))}
                          </p>
                        </div>
                        <button
                          onClick={() => speak(l.example, 'en-US', 0.85)}
                          aria-label={`${t.tutSayWord} ${l.example}`}
                          className="doodle-btn grid size-11 shrink-0 place-items-center bg-white"
                        >
                          <Volume2 className="size-5" aria-hidden />
                        </button>
                      </>
                    )
                  })()}
                </motion.div>
              )}

              <div className="mt-3 flex shrink-0 gap-3">
                <button onClick={() => setStep('test')} className="doodle-btn inline-flex flex-1 items-center justify-center gap-2 bg-[var(--color-grape)] px-6 py-3 text-base text-white">
                  {t.obNext} <ArrowRight className="size-4" aria-hidden />
                </button>
                <button onClick={() => router.push('/room')} className="doodle-btn inline-flex items-center gap-1.5 bg-white px-4 py-3 text-sm font-extrabold">
                  <SkipForward className="size-4" aria-hidden /> {t.tutSkip}
                </button>
              </div>
            </motion.div>
          )}

          {/* ---- INTERACTIVE MIC TEST ---- */}
          {step === 'test' && (
            <motion.div key={`test-${idx}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black doodle-outline doodle-shadow-sm">
                {idx + 1} / {TEST_WORDS.length}
              </span>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">{t.tutTestTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{t.tutTestHint}</p>

              <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white px-6 py-4 doodle-outline doodle-shadow">
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-warm)]">{t.tutSayWord}</div>
                  <div className="text-4xl font-black">{word}</div>
                  <div className="text-sm font-bold text-[var(--color-grape)]">{wordIpa}</div>
                </div>
                <button onClick={() => speak(word, 'en-US', 0.8)} aria-label={`${t.tutSayWord} ${word}`} className="doodle-btn grid size-11 place-items-center bg-white">
                  <Volume2 className="size-5" aria-hidden />
                </button>
              </div>

              <button
                onClick={handleMic}
                disabled={transcribing}
                aria-label={t.roomMicTitle}
                aria-pressed={recording}
                className={cn(
                  'doodle-btn mt-6 grid size-20 place-items-center text-white',
                  recording ? 'bg-[var(--color-bubblegum)]' : 'bg-[var(--color-grape)]'
                )}
              >
                {transcribing ? <Loader2 className="size-8 animate-spin" aria-hidden /> : recording ? <Square className="size-8 fill-current" aria-hidden /> : <Mic className="size-8" aria-hidden />}
              </button>
              <p className="mt-2 text-xs font-bold text-[var(--color-muted-warm)]">
                {recording ? t.tutListening : t.roomMicTitle}
              </p>

              <AnimatePresence>
                {score !== null && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 w-full max-w-sm rounded-2xl bg-white p-4 doodle-outline doodle-shadow-sm">
                    <div className="flex items-center justify-center gap-2">
                      {score >= 70 ? (
                        <CheckCircle className="size-5 text-[var(--color-mint)]" aria-hidden />
                      ) : (
                        <RotateCcw className="size-5 text-[var(--color-bubblegum)]" aria-hidden />
                      )}
                      <span className={cn('text-lg font-black', score >= 70 ? 'text-[var(--color-mint)]' : 'text-[var(--color-bubblegum)]')}>
                        {score >= 70 ? t.tutCorrect : t.tutAlmost}
                      </span>
                      <span className="text-sm font-black text-[var(--color-muted-warm)]">{score}</span>
                    </div>
                    {heard && <p className="mt-1 text-xs font-semibold text-[var(--color-muted-warm)]">“{heard}”</p>}
                    {score < 70 && <p className="mt-2 text-sm font-bold text-[var(--color-warm-text)]">{t.tutEncourage}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex gap-3">
                {score !== null && score < 70 && (
                  <button onClick={handleMic} className="doodle-btn inline-flex items-center gap-2 bg-white px-5 py-3 font-extrabold">
                    <RotateCcw className="size-4" aria-hidden /> {t.tutRetry}
                  </button>
                )}
                <button
                  onClick={nextWord}
                  disabled={score === null}
                  className="doodle-btn inline-flex items-center gap-2 bg-[var(--color-grape)] px-6 py-3 font-extrabold text-white disabled:opacity-40"
                >
                  {idx >= TEST_WORDS.length - 1 ? t.tutEnter : t.tutNext} <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          )}

          {/* ---- DONE ---- */}
          {step === 'done' && (
            <motion.div key="done" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
              <div className="grid size-20 place-items-center rounded-full bg-[var(--color-mint)] text-4xl doodle-outline doodle-shadow">🎉</div>
              <h2 className="mt-5 text-3xl font-black">{t.tutCorrect}</h2>
              <p className="mt-3 max-w-md text-lg font-semibold text-[var(--color-warm-text)]">{t.tutEncourage}</p>
              <button
                onClick={() => router.push('/room')}
                className="doodle-btn mt-8 inline-flex items-center gap-2 bg-[var(--color-grape)] px-8 py-4 text-lg text-white"
              >
                {t.tutEnter} <ArrowRight className="size-5" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
