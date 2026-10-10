'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { CEFR_LEVELS } from '@/lib/cefr'
import type { PlacementOutcome } from '@/lib/placement/engine'
import { useAppStore } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'

const LEVEL_HEX: Record<string, string> = {
  A1: '#3f8f6d',
  A2: '#5b79c9',
  B1: '#2a4bb0',
  B2: '#cf6a3a',
  C1: '#c0431f',
  C2: '#cf9f3a',
}

const FONT = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
const W = 1080
const H = 1350

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export function ResultCard({ outcome }: { outcome: PlacementOutcome }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const { name, nativeLang } = useAppStore()
  const t = getLocale(nativeLang).ui

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const level = CEFR_LEVELS[outcome.level]
    const accent = LEVEL_HEX[outcome.level] ?? '#2a4bb0'

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    // background
    ctx.fillStyle = '#f7f2e6'
    ctx.fillRect(0, 0, W, H)

    // frame
    ctx.lineWidth = 12
    ctx.strokeStyle = '#201d33'
    roundRect(ctx, 40, 40, W - 80, H - 80, 48)
    ctx.stroke()

    // top band
    ctx.save()
    roundRect(ctx, 40, 40, W - 80, 300, 48)
    ctx.clip()
    ctx.fillStyle = accent
    ctx.fillRect(40, 40, W - 80, 300)
    ctx.restore()

    ctx.fillStyle = '#fffdf7'
    ctx.font = `900 74px ${FONT}`
    ctx.fillText('Say So', 100, 170)
    ctx.font = `800 34px ${FONT}`
    ctx.fillText('Say So · English tutor', 100, 224)
    ctx.font = `800 30px ${FONT}`
    ctx.fillText('CEFR Placement', 100, 280)

    // level circle
    ctx.beginPath()
    ctx.arc(W / 2, 560, 150, 0, Math.PI * 2)
    ctx.fillStyle = accent
    ctx.fill()
    ctx.lineWidth = 10
    ctx.strokeStyle = '#201d33'
    ctx.stroke()

    ctx.fillStyle = '#fffdf7'
    ctx.textAlign = 'center'
    ctx.font = `900 120px ${FONT}`
    ctx.fillText(outcome.level, W / 2, 600)

    // level name + confidence
    ctx.fillStyle = '#2b2620'
    ctx.font = `900 46px ${FONT}`
    ctx.fillText(level.name, W / 2, 790)

    ctx.font = `800 30px ${FONT}`
    ctx.fillStyle = '#6f6754'
    ctx.fillText(`${outcome.confidence.toUpperCase()} CONFIDENCE · ${outcome.totalCorrect}/${outcome.totalAsked}`, W / 2, 846)

    // can-do
    ctx.textAlign = 'left'
    ctx.fillStyle = '#2b2620'
    ctx.font = `800 32px ${FONT}`
    ctx.fillText('Can do at this level', 120, 940)

    ctx.font = `700 28px ${FONT}`
    let y = 1000
    for (const c of level.canDo.slice(0, 3)) {
      const text = c.text.length > 150 ? c.text.slice(0, 147) + '…' : c.text
      const lines = wrap(ctx, text, W - 320)
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(132, y - 10, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#3a342a'
      for (const line of lines.slice(0, 2)) {
        ctx.fillText(line, 170, y)
        y += 40
      }
      y += 26
      if (y > 1220) break
    }

    // footer
    ctx.textAlign = 'center'
    ctx.fillStyle = '#6f6754'
    ctx.font = `800 26px ${FONT}`
    ctx.fillText(`${name ? name + ' · ' : ''}CEFR-aligned placement (not a certified exam)`, W / 2, 1290)

    setReady(true)
  }, [outcome, name])

  async function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => canvasRef.current?.toBlob((b) => resolve(b), 'image/png') ?? resolve(null))
  }

  async function download() {
    const blob = await toBlob()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `say-so-cefr-${outcome.level}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function share() {
    const blob = await toBlob()
    if (!blob) return
    const file = new File([blob], `say-so-cefr-${outcome.level}.png`, { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean }
    if (nav.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: t.scTitle, text: t.scHint })
        return
      } catch {
        /* fall through to download */
      }
    }
    await download()
  }

  return (
    <div className="rounded-3xl bg-white p-4 doodle-outline doodle-shadow-sm">
      <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-[var(--color-muted-warm)]">{t.scTitle}</p>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label={t.scTitle}
        className="mx-auto h-auto w-full max-w-[280px] rounded-2xl"
      />
      <div className="mt-3 flex gap-2">
        <button onClick={download} disabled={!ready} className="doodle-btn inline-flex flex-1 items-center justify-center gap-2 bg-white px-4 py-3 font-extrabold disabled:opacity-40">
          <Download className="size-4" aria-hidden /> {t.scDownload}
        </button>
        <button onClick={share} disabled={!ready} className="doodle-btn inline-flex flex-1 items-center justify-center gap-2 bg-[var(--color-grape)] px-4 py-3 font-extrabold text-white disabled:opacity-40">
          <Share2 className="size-4" aria-hidden /> {t.scShare}
        </button>
      </div>
    </div>
  )
}
