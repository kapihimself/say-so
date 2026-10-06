'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'
import { useMistakeBank } from '@/lib/store/mistakeBank'
import { getLocale } from '@/lib/i18n'
import { rulesFor } from '@/lib/phonetics/interference'
import { cn } from '@/lib/utils'

/**
 * Mistake bank — the learner's recurring errors, each linked to the
 * contrastive rule that explains it. Fed by PhoneticBoard scoring.
 */
export function MistakeBankPanel({ className }: { className?: string }) {
  const nativeLang = useAppStore((s) => s.nativeLang)
  const entries = useMistakeBank((s) => s.entries)
  const clear = useMistakeBank((s) => s.clear)
  const t = getLocale(nativeLang).ui

  const ruleNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const r of rulesFor(nativeLang)) map[r.id] = r.name[nativeLang]
    return map
  }, [nativeLang])

  const list = useMemo(
    () =>
      Object.values(entries)
        .filter((e) => e.nativeLang === nativeLang)
        .sort((a, b) => b.count - a.count || b.lastAt - a.lastAt),
    [entries, nativeLang]
  )

  return (
    <div className={cn('rounded-2xl border-[3px] border-[var(--color-ink)] bg-white p-4 doodle-shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-black text-sm text-[var(--color-ink)]">
          <AlertTriangle className="size-4 text-[var(--color-bubblegum)]" aria-hidden /> {t.mbTitle}
        </span>
        {list.length > 0 && (
          <button
            onClick={clear}
            aria-label={t.mbClear}
            className="doodle-btn inline-flex items-center gap-1 bg-white px-2.5 py-1 text-[10px] font-black"
          >
            <Trash2 className="size-3" aria-hidden /> {t.mbClear}
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="mt-2 text-xs font-bold text-[var(--color-muted-warm)]">{t.mbEmpty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {list.slice(0, 6).map((e) => (
              <motion.li
                key={`${e.word}-${e.sound}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bubblegum-soft)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-[var(--color-ink)]">{e.word}</span>
                    <span className="text-xs font-black text-[var(--color-bubblegum)]">/{e.sound}/</span>
                  </div>
                  {e.ruleIds.length > 0 && (
                    <p className="truncate text-[10px] font-semibold text-[var(--color-muted-warm)]">
                      {e.ruleIds.map((id) => ruleNames[id]).filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black doodle-outline">
                  {e.count}× {t.mbTimes}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
