'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, LEVELS, type LevelId, type TeacherLang } from '@/lib/store/appStore'
import { CEFR_ORDER } from '@/lib/cefr'
import { LOCALE_LIST, getLocale } from '@/lib/i18n'
import { CURRICULUM } from '@/lib/curriculum'
import { useNarration } from '@/lib/hooks/useNarration'
import { ArrowRight, ArrowLeft, Check, GraduationCap, Volume2, VolumeX, Briefcase, Plane, School, PartyPopper, Sparkles, Target, CalendarClock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_ORDER: LevelId[] = CEFR_ORDER
const TOTAL_STEPS = 7

type Goal = 'work' | 'travel' | 'school' | 'fun'

const GOAL_ICONS: Record<Goal, React.ReactNode> = {
  work: <Briefcase className="size-5" aria-hidden />,
  travel: <Plane className="size-5" aria-hidden />,
  school: <School className="size-5" aria-hidden />,
  fun: <PartyPopper className="size-5" aria-hidden />,
}

/** Mobbin pattern 3+5: the "mirror" — a plan assembled from the user's answers. */
function mirrorBadge(goal: Goal | null, level: LevelId | null): string {
  if (goal === 'work') return level === 'A1' ? 'Career Starter' : 'Professional Voice'
  if (goal === 'travel') return 'Conversation First'
  if (goal === 'school') return 'Exam Sharp'
  if (goal === 'fun') return 'Culture Curious'
  return 'Careful Beginner'
}

export default function OnboardingPage() {
  const router = useRouter()
  const { name, level, teacherLang, nativeLang, setName, setLevel, setTeacherLang, setNativeLang } = useAppStore()
  const [step, setStep] = useState(0)
  const [localName, setLocalName] = useState(name)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [assembling, setAssembling] = useState(false)

  const locale = getLocale(nativeLang)
  const t = locale.ui
  const { enabled: narrationOn, setEnabled: setNarration, say, supported: ttsOk } = useNarration(locale.code, locale.speechTag)

  const NARRATION_KEYS = ['ob_lang', 'ob_name', 'ob_level', 'ob_teacher'] as const
  const NARRATION = [t.narStepLang, t.narStepName, t.narStepLevel, t.narStepTeacher]

  useEffect(() => {
    if (step <= 3) say(NARRATION_KEYS[step], NARRATION[step])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, narrationOn])

  const LANGS: { id: TeacherLang; label: string; desc: string }[] = [
    { id: 'id', label: t.teacherIdLabel, desc: t.teacherIdDesc },
    { id: 'bilingual', label: t.teacherBilingualLabel, desc: t.teacherBilingualDesc },
    { id: 'en', label: t.teacherEnLabel, desc: t.teacherEnDesc },
  ]

  // The assembled plan (Mobbin pattern 5) — built from answers, shown before entering.
  const plan = useMemo(() => {
    const unit = level ? CURRICULUM[level] : null
    return {
      focus: unit?.grammarFocus.slice(0, 2).join(' · ') ?? '—',
      habit: t.obMinutesDay ?? '10 min/day',
      result: goal === 'work' ? 'meetings & interviews' : goal === 'travel' ? 'confident small talk' : goal === 'school' ? 'exam-ready' : 'binge without subtitles',
    }
  }, [level, goal, t])

  function next() {
    if (step === 1) {
      setName(localName.trim() || 'Sobat')
      setStep(2)
    } else if (step === 3) {
      router.push('/karakter')
    } else if (step === 5) {
      // Mobbin pattern 4/5 bridge: fake "assembling your plan" pause, then the mirror.
      setAssembling(true)
      setTimeout(() => {
        setAssembling(false)
        setStep(6)
      }, 1600)
    } else {
      setStep(step + 1)
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  const canNext = step === 1 ? localName.trim().length > 0 : step === 2 ? !!level : step === 4 ? !!goal : true

  return (
    <main className="relative mx-auto flex h-dvh max-w-2xl flex-col overflow-hidden px-5 py-5">
      {/* progress — Mobbin pattern 1: visible from the very first screen */}
      <div className="relative mb-5 flex shrink-0 items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            layout
            className={cn('h-2.5 rounded-full', i <= step ? 'bg-[var(--color-grape)]' : 'bg-white clay-sunken')}
            animate={{ width: i <= step ? 32 : 10 }}
            transition={{ type: 'spring', bounce: 0.3 }}
          />
        ))}
        {ttsOk && (
          <button
            onClick={() => setNarration(!narrationOn)}
            aria-pressed={narrationOn}
            aria-label={t.narrateLabel}
            title={t.narrateLabel}
            className="clay-btn-soft absolute right-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px]"
          >
            {narrationOn ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />}
            {t.narrateLabel}
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          {/* ---- 0 · Language ---- */}
          {step === 0 && (
            <motion.div key="s0" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="text-2xl font-black">🌍 Bahasa · Idioma · Língua</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">
                Pilih bahasa ibumu · Elige tu idioma · Escolha o seu idioma
              </p>
              <div className="clay-stagger mt-5 space-y-3">
                {LOCALE_LIST.map((l) => {
                  const active = nativeLang === l.code
                  return (
                    <button
                      key={l.code}
                      onClick={() => setNativeLang(l.code)}
                      data-selected={active}
                      className={cn('clay-chip flex w-full items-center gap-3 p-4 text-left', active && '-translate-y-px')}
                    >
                      <span className="text-2xl">{l.ui.langFlag}</span>
                      <div className="flex-1">
                        <h3 className="text-base font-black">{l.ui.langName}</h3>
                        <p className="text-xs font-semibold text-[var(--color-muted-warm)]">{l.teacherLabel}</p>
                      </div>
                      {active && <Check className="size-5" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ---- 1 · Name ---- */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="text-2xl font-black">{t.obNameTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{t.obNameSub}</p>
              <input
                autoFocus
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canNext && next()}
                placeholder={t.obNamePlaceholder}
                maxLength={20}
                className="clay-sunken mt-5 w-full px-5 py-4 text-lg font-bold outline-none placeholder:text-[var(--color-muted-warm)]/50"
              />
            </motion.div>
          )}

          {/* ---- 2 · Level ---- */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="text-2xl font-black">{t.obLevelTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{t.obLevelSub}</p>
              <div className="clay-stagger mt-4 grid gap-2 sm:grid-cols-2">
                {LEVEL_ORDER.map((id) => {
                  const lv = LEVELS[id]
                  const active = level === id
                  return (
                    <button
                      key={id}
                      onClick={() => setLevel(id)}
                      data-selected={active}
                      className="clay-chip group relative p-2.5 text-left"
                      style={active ? { background: lv.soft } : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-black text-white" style={{ background: lv.color }}>
                          {id}
                        </span>
                        {active && <Check className="size-5" strokeWidth={3} />}
                      </div>
                      <h3 className="mt-1 text-sm font-black sm:text-base">{lv.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-[var(--color-muted-warm)]">{locale.levelTaglines[id]}</p>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => router.push('/placement')}
                className="clay-btn-soft mt-2.5 inline-flex w-full shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm"
              >
                <GraduationCap className="size-4 text-[var(--color-grape)]" aria-hidden /> {t.obTakeTest}
              </button>
            </motion.div>
          )}

          {/* ---- 3 · Teacher voice ---- */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="text-2xl font-black">{t.obTeacherTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{t.obTeacherSub}</p>
              <div className="clay-stagger mt-4 space-y-2.5">
                {LANGS.map((l) => {
                  const active = teacherLang === l.id
                  return (
                    <button
                      key={l.id}
                      onClick={() => setTeacherLang(l.id)}
                      data-selected={active}
                      className="clay-chip flex w-full items-center gap-3 p-4 text-left"
                    >
                      <div className={cn('grid size-7 shrink-0 place-items-center rounded-full', active ? 'bg-[var(--color-grape)] text-white' : 'bg-[var(--color-cloud)]')}>
                        {active && <Check className="size-4" strokeWidth={3} />}
                      </div>
                      <div>
                        <h3 className="text-base font-black">{l.label}</h3>
                        <p className="text-xs font-semibold text-[var(--color-muted-warm)]">{l.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ---- 4 · The personal question (Mobbin pattern 2) ---- */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="text-2xl font-black">{t.obWhyTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{t.obWhySub}</p>
              <div className="clay-stagger mt-4 grid grid-cols-2 gap-2.5">
                {(
                  [
                    ['work', t.obWhyWork],
                    ['travel', t.obWhyTravel],
                    ['school', t.obWhySchool],
                    ['fun', t.obWhyFun],
                  ] as [Goal, string][]
                ).map(([id, label]) => {
                  const active = goal === id
                  return (
                    <button key={id} onClick={() => setGoal(id)} data-selected={active} className="clay-chip flex flex-col items-center gap-2 p-5 text-center">
                      <span className={cn('grid size-11 place-items-center rounded-2xl', active ? 'bg-[var(--color-grape)] text-white' : 'bg-[var(--color-cloud)] text-[var(--color-grape)]')}>
                        {GOAL_ICONS[id]}
                      </span>
                      <span className="text-sm font-black">{label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ---- 5 · Assembling (the pause that sells the plan) ---- */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
              <motion.div
                animate={assembling ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                className="grid size-16 place-items-center rounded-3xl bg-[var(--color-grape)] text-white clay-shadow"
              >
                <Sparkles className="size-8" aria-hidden />
              </motion.div>
              <h2 className="mt-6 text-2xl font-black">{t.obPlanTitle}</h2>
              <p className="mt-2 text-sm font-semibold text-[var(--color-muted-warm)]">{t.obPlanSub}</p>
              <div className="mt-6 w-full max-w-sm space-y-2">
                {[t.obPlanFocus ?? 'Focus', t.obPlanHabit ?? 'Habit', t.obPlanResult ?? 'Goal'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0.35 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.35, duration: 0.35 }}
                    className="clay-sunken flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--color-muted-warm)]">{label}</span>
                    <Check className="size-4 text-[var(--color-mint)]" aria-hidden />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---- 6 · The mirror + plan (Mobbin patterns 3 + 5) ---- */}
          {step === 6 && (
            <motion.div key="s6" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ type: 'spring', bounce: 0.35 }} className="flex min-h-0 flex-1 flex-col">
              <h2 className="text-2xl font-black">{t.obMirrorTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted-warm)]">{t.obMirrorSub}</p>

              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
                className="clay-card mt-4 p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-grape)] px-3 py-1 text-xs font-black text-white">
                    <Sparkles className="size-3" aria-hidden /> {t.obMirrorBadge}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-warm)]">{mirrorBadge(goal, level) === t.obMirrorBadge ? '' : mirrorBadge(goal, level)}</span>
                </div>
                <p className="mt-3 text-[15px] font-bold leading-relaxed">
                  {level} · {level ? CURRICULUM[level].unitTitle : ''} — {plan.focus}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: <Target className="size-4" aria-hidden />, label: t.obPlanFocus ?? '', value: plan.focus.split(' · ')[0] },
                    { icon: <CalendarClock className="size-4" aria-hidden />, label: t.obPlanHabit ?? '', value: plan.habit },
                    { icon: <TrendingUp className="size-4" aria-hidden />, label: t.obPlanResult ?? '', value: plan.result },
                  ].map((cell) => (
                    <div key={cell.label} className="clay-sunken flex flex-col items-center gap-1 p-3">
                      <span className="text-[var(--color-grape)]">{cell.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{cell.label}</span>
                      <span className="text-xs font-black">{cell.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <button onClick={next} className="clay-btn mt-5 inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-base">
                {t.obPlanStart} <ArrowRight className="size-5" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* nav — hidden on the mirror (its own CTA) and the assembler */}
      {step < 5 && (
        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 pt-2">
          {step > 0 ? (
            <button onClick={back} className="clay-btn-soft inline-flex items-center gap-2 px-4 py-2.5">
              <ArrowLeft className="size-4" /> {t.obBack}
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={next}
            disabled={!canNext}
            className="clay-btn inline-flex items-center gap-2 px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === 3 ? t.obPickCharacter : t.obNext}
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}
    </main>
  )
}