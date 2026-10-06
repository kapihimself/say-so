import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type ProgressBody = {
  learnerId?: string
  kind?: string
  payload?: unknown
}

const MAX_KIND = 40

export async function POST(request: NextRequest) {
  let body: ProgressBody
  try {
    body = (await request.json()) as ProgressBody
  } catch {
    return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 })
  }

  const learnerId = String(body.learnerId ?? '').slice(0, 80)
  const kind = String(body.kind ?? '').slice(0, MAX_KIND)
  if (!learnerId || !kind) {
    return NextResponse.json({ ok: false, error: 'missing learnerId/kind' }, { status: 400 })
  }

  const admin = createAdminClient()
  if (!admin) {
    // Supabase not configured — the app still persists locally.
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { error } = await admin.from('progress_events').insert({
    learner_id: learnerId,
    kind,
    payload: (body.payload ?? {}) as object,
  })

  if (error) {
    // Best-effort telemetry: never surface an error to the fire-and-forget
    // client (e.g. before 002_progress.sql has been applied).
    console.warn('API_PROGRESS: insert failed', error.message)
    return NextResponse.json({ ok: false, skipped: true, error: error.message })
  }
  return NextResponse.json({ ok: true })
}
