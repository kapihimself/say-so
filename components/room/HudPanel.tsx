'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * A floating classroom HUD chip. Collapsed to a small pill so it never covers
 * the scene; expands on hover, keyboard focus, or tap. Pointer events are
 * re-enabled only on the chip itself so the 3D scene stays interactive.
 */
export function HudPanel({
  icon,
  label,
  align = 'left',
  className,
  children,
}: {
  icon: React.ReactNode
  label: string
  align?: 'left' | 'right'
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn('pointer-events-auto', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-white/90 px-2.5 py-1.5 shadow-[2px_3px_0_0_var(--color-ink)] backdrop-blur transition-transform hover:-translate-y-0.5"
      >
        <span className="grid size-4 place-items-center text-[var(--color-grape)]" aria-hidden>
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{label}</span>
      </button>

      <div
        className={cn(
          'absolute z-10 mt-2 w-60 origin-top transition-all duration-200',
          align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          open ? 'visible scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}
