'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, LEVELS, type LevelId, type TeacherLang } from '@/lib/store/appStore'
import { CEFR_ORDER } from '@/lib/cefr'
import { LOCALE_LIST, getLocale } from '@/lib/i18n'
import { useNarration } from '@/lib/hooks/useNarration'
import { ArrowRight, ArrowLeft, Check, GraduationCap, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_ORDER: LevelId[] = CEFR_ORDER
const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const { name, level, teacherLang, nativeLang, setName, setLevel, setTeacherLang, setNativeLang } = useAppStore()
  const [step, setStep] = useState(0)
  const [localName, setLocalName] = useState(name)

  const locale = getLocale(nativeLang)
  const t = locale.ui
  const { enabled: narrationOn, setEnabled: setNarration, say, supported: ttsOk } = useNarration(locale.speechTag)

  const NARRATION = [t.narStepLang, t.narStepName, t.narStepLevel, t.narStepTeacher]

  useEffect(() => {
    say(NARRATION[step])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, narrationOn])

  const LANGS: { id: TeacherLang; label: string; desc: string }[] = [
    { id: 'id', label: t.teacherIdLabel, desc: t.teacherIdDesc },
    { id: 'bilingual', label: t.teacherBilingualLabel, desc: t.teacherBilingualDesc },
    { id: 'en', label: t.teacherEnLabel, desc: t.teacherEnDesc },
  ]

  function next() {
    if (step === 1) {
      setName(localName.trim() || 'Sobat')
      setStep(2)
    } else if (step === 3) {
      router.push('/karakter')
    } else {
      setStep(step + 1)
    }
  }

  const canNext = step === 1 ? localName.trim().length > 0 : step === 2 ? !!level : true

  return (
    <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      {/* progress dots */}
      <div className="relative mb-10 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 rounded-full doodle-outline transition-all',
              i <= step ? 'w-10 bg-[var(--color-grape)]' : 'w-3 bg-white'
            )}
          />
        ))}
        {ttsOk && (
          <button
            onClick={() => setNarration(!narrationOn)}
            aria-pressed={narrationOn}
            aria-label={t.narrateLabel}
            title={t.narrateLabel}
            className="doodle-btn absolute right-0 inline-flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-black"
          >
            {narrationOn ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
            {t.narrateLabel}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex-1">
            <h2 className="text-3xl font-black sm:text-4xl">🌍 Bahasa · Idioma · Língua</h2>
            <p className="mt-2 text-lg font-semibold text-[var(--color-muted-warm)]">
              Pilih bahasa ibumu · Elige tu idioma · Escolha o seu idioma
            </p>
            <div className="mt-8 space-y-4">
              {LOCALE_LIST.map((l) => {
                const active = nativeLang === l.code
                return (
                  <button
                    key={l.code}
                    onClick={() => setNativeLang(l.code)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left doodle-outline transition-all',
                      active ? 'translate-x-[2px] translate-y-[2px] bg-[var(--color-grape-soft)] shadow-[3px_4px_0_0_var(--color-ink)]' : 'doodle-shadow hover:translate-x-[1px] hover:translate-y-[1px]'
                    )}
                  >
                    <span className="text-3xl">{l.ui.langFlag}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-black">{l.ui.langName}</h3>
                      <p className="text-sm font-semibold text-[var(--color-muted-warm)]">{l.teacherLabel}</p>
                    </div>
                    {active && <Check className="size-6" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex-1">
            <h2 className="text-3xl font-black sm:text-4xl">{t.obNameTitle}</h2>
            <p className="mt-2 text-lg font-semibold text-[var(--color-muted-warm)]">{t.obNameSub}</p>
            <input
              autoFocus
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canNext && next()}
              placeholder={t.obNamePlaceholder}
              maxLength={20}
              className="mt-8 w-full rounded-3xl bg-white px-6 py-5 text-xl font-bold doodle-outline doodle-shadow outline-none placeholder:text-[var(--color-muted-warm)]/50 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[3px_4px_0_0_var(--color-ink)] transition-all"
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex-1">
            <h2 className="text-3xl font-black sm:text-4xl">{t.obLevelTitle}</h2>
            <p className="mt-2 text-lg font-semibold text-[var(--color-muted-warm)]">{t.obLevelSub}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {LEVEL_ORDER.map((id) => {
                const lv = LEVELS[id]
                const active = level === id
                return (
                  <button
                    key={id}
                    onClick={() => setLevel(id)}
                    className={cn(
                      'group relative rounded-3xl bg-white p-5 text-left doodle-outline transition-all',
                      active ? 'translate-x-[2px] translate-y-[2px] shadow-[3px_4px_0_0_var(--color-ink)]' : 'doodle-shadow hover:translate-x-[1px] hover:translate-y-[1px]'
                    )}
                    style={active ? { background: lv.soft } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full px-3 py-1 text-sm font-black text-white doodle-outline" style={{ background: lv.color }}>
                        {id}
                      </span>
                      {active && <Check className="size-6" strokeWidth={3} />}
                    </div>
                    <h3 className="mt-3 text-xl font-black">{lv.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{locale.levelTaglines[id]}</p>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => router.push('/placement')}
              className="doodle-btn mt-6 inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-3 font-extrabold"
            >
              <GraduationCap className="size-5 text-[var(--color-grape)]" /> {t.obTakeTest}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="flex-1">
            <h2 className="text-3xl font-black sm:text-4xl">{t.obTeacherTitle}</h2>
            <p className="mt-2 text-lg font-semibold text-[var(--color-muted-warm)]">{t.obTeacherSub}</p>
            <div className="mt-8 space-y-4">
              {LANGS.map((l) => {
                const active = teacherLang === l.id
                return (
                  <button
                    key={l.id}
                    onClick={() => setTeacherLang(l.id)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left doodle-outline transition-all',
                      active ? 'translate-x-[2px] translate-y-[2px] bg-[var(--color-grape-soft)] shadow-[3px_4px_0_0_var(--color-ink)]' : 'doodle-shadow hover:translate-x-[1px] hover:translate-y-[1px]'
                    )}
                  >
                    <div className={cn('grid size-8 shrink-0 place-items-center rounded-full doodle-outline', active ? 'bg-[var(--color-grape)] text-white' : 'bg-white')}>
                      {active && <Check className="size-5" strokeWidth={3} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{l.label}</h3>
                      <p className="text-sm font-semibold text-[var(--color-muted-warm)]">{l.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="doodle-btn inline-flex items-center gap-2 bg-white px-5 py-3 font-extrabold">
            <ArrowLeft className="size-5" /> {t.obBack}
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={next}
          disabled={!canNext}
          className="doodle-btn inline-flex items-center gap-2 bg-[var(--color-grape)] px-7 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === TOTAL_STEPS - 1 ? t.obPickCharacter : t.obNext}
          <ArrowRight className="size-5" />
        </button>
      </div>
    </main>
  )
}
