import { LEVELS, type LevelId } from '@/lib/store/appStore'
import type { UnitContent } from '@/lib/curriculum'

export function Whiteboard({ level, unit }: { level: LevelId; unit: UnitContent }) {
  const lv = LEVELS[level]
  return (
    <div className="w-full rounded-2xl bg-[#FBFBF7] p-5 doodle-outline doodle-shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-black text-white doodle-outline" style={{ background: lv.color }}>
          {level}
        </span>
        <h3 className="text-base font-black">{unit.unitTitle}</h3>
      </div>
      <div className="mt-3 space-y-1.5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--color-muted-warm)]">Hari ini kita bahas</p>
        {unit.grammarFocus.map((g) => (
          <div key={g} className="flex items-start gap-2 text-sm font-bold">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-bubblegum)]" />
            {g}
          </div>
        ))}
      </div>
    </div>
  )
}
