'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ear, Play, ScanSearch, Sparkles, Wrench, Info, Search } from 'lucide-react'
import type { NativeLang } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { applyInterference } from '@/lib/phonetics/interference'
import { wordToPhonemes, loadFullDict } from '@/lib/phonetics/g2p'
import { cn } from '@/lib/utils'

/**
 * Dialect Lens — the Listener/Lens-inspired panel. For a target word it shows:
 *   A) the native pronunciation
 *   B) how a speaker of the learner's L1 is likely to hear/produce it,
 *      with an audible approximation (L1 voice reading an L1-friendly respelling)
 *   C) how to fix it
 * plus an evidence receipt of the interference rules that fired (with sources).
 *
 * The learner can also type ANY English word ("pronounce anything").
 */
export function DialectLens({
  word,
  ipa,
  nativeLang,
  className,
}: {
  word: string
  ipa: string
  nativeLang: NativeLang
  className?: string
}) {
  const locale = getLocale(nativeLang)
  const t = locale.ui
  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [dictReady, setDictReady] = useState(false)

  useEffect(() => {
    let mounted = true
    loadFullDict().then(() => mounted && setDictReady(true))
    return () => {
      mounted = false
    }
  }, [])

  const qWord = query.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z']/g, '') ?? ''
  const displayWord = qWord || word
  const displayIpa = qWord ? `/${wordToPhonemes(qWord).join('')}/` : ipa

  const result = useMemo(
    () => applyInterference(displayIpa, nativeLang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayIpa, nativeLang, dictReady]
  )

  function speak(text: string, lang: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
    const loose = voices.find((v) => v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()))
    const voice = exact ?? loose
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  }

  const changed = result.hits.length > 0

  return (
    <div className={cn('rounded-2xl border-[3px] border-[var(--color-ink)] bg-white p-4 doodle-shadow-sm', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-grape)] rounded-lg"
      >
        <span className="flex items-center gap-2 font-black text-sm text-[var(--color-ink)]">
          <Ear className="size-4 text-[var(--color-grape)]" aria-hidden /> {t.dlTitle}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">
          {open ? t.dlHide : t.dlShow}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-xs font-bold text-[var(--color-muted-warm)]">{t.dlSubtitle}</p>

            {/* Pronounce anything */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted-warm)]" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.dlTryPlaceholder}
                  aria-label={t.dlTryOther}
                  className="w-full rounded-full bg-[var(--color-cloud)] py-2 pl-9 pr-3 text-sm font-bold doodle-outline outline-none placeholder:text-[var(--color-muted-warm)]/60 focus-visible:ring-2 focus-visible:ring-[var(--color-grape)]"
                />
              </div>
              {query && (
                <button onClick={() => setQuery('')} className="doodle-btn bg-white px-3 py-2 text-xs" aria-label="Clear">
                  ✕
                </button>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {/* Track A — native */}
              <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-mint-soft)] px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{t.dlTrackA}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-[var(--color-ink)]">{displayWord}</span>
                    <span className="text-sm font-bold text-[var(--color-muted-warm)]">{displayIpa}</span>
                  </div>
                </div>
                <button
                  onClick={() => speak(displayWord, 'en-US')}
                  className="doodle-btn grid size-9 shrink-0 place-items-center bg-white"
                  aria-label={`${t.dlPlay} ${displayWord}`}
                >
                  <Play className="size-4" aria-hidden />
                </button>
              </div>

              {/* Track B — L1 ear */}
              <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bubblegum-soft)] px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">
                    {t.dlTrackB} · {locale.ui.langFlag} {locale.ui.langName}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-[var(--color-ink)]">“{result.respelling}”</span>
                    <span className="text-sm font-bold text-[var(--color-bubblegum)]">{result.approxIpa}</span>
                  </div>
                </div>
                <button
                  onClick={() => speak(result.respelling, locale.speechTag)}
                  className="doodle-btn grid size-9 shrink-0 place-items-center bg-white"
                  aria-label={`${t.dlPlay} ${result.respelling}`}
                >
                  <Ear className="size-4" aria-hidden />
                </button>
              </div>

              {/* Track C — how to fix */}
              <div className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/30 bg-[var(--color-cloud)] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">
                  <Wrench className="size-3" aria-hidden /> {t.dlTrackC}
                </div>
                <p className="mt-1 text-xs font-bold text-[var(--color-warm-text)]">{t.dlFixHint}</p>
              </div>
            </div>

            {/* Evidence receipt */}
            <div className="mt-3 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-lemon-soft)] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">
                <ScanSearch className="size-3" aria-hidden /> {t.dlEvidence}
              </div>
              {changed ? (
                <ul className="mt-2 space-y-2">
                  {result.hits.map((h) => (
                    <li key={h.id} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 size-3 shrink-0 text-[var(--color-grape)]" aria-hidden />
                      <div>
                        <span className="text-xs font-black text-[var(--color-ink)]">{h.name[nativeLang]}</span>
                        <p className="text-[11px] font-semibold leading-snug text-[var(--color-muted-warm)]">{h.desc[nativeLang]}</p>
                        <p className="mt-0.5 text-[9px] italic text-[var(--color-muted-warm)]/80">
                          {t.dlSource}: {h.ref}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs font-bold text-[var(--color-mint)]">{t.dlNoRules}</p>
              )}
            </div>

            <p className="mt-2 flex items-start gap-1.5 text-[10px] font-semibold leading-snug text-[var(--color-muted-warm)]">
              <Info className="mt-0.5 size-3 shrink-0" aria-hidden /> {t.dlDisclaimer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
