import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const BASE = (process.env.TTS_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
const KEY = process.env.TTS_API_KEY ?? ''
const MODEL = process.env.TTS_MODEL ?? 'gpt-4o-mini-tts'

/**
 * Dynamic narration for text that can't be pre-recorded (e.g. the learner's
 * name). Returns mp3 audio.
 */
export async function POST(request: NextRequest) {
  const { text, voice = 'alloy', instructions } = (await request.json()) as {
    text?: string
    voice?: string
    instructions?: string
  }
  if (!text) return NextResponse.json({ error: 'no text' }, { status: 400 })
  if (!KEY) return NextResponse.json({ error: 'tts not configured' }, { status: 503 })

  const res = await fetch(`${BASE}/audio/speech`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      voice,
      input: String(text).slice(0, 700),
      response_format: 'mp3',
      instructions:
        instructions ??
        'Speak warmly, slowly and clearly, like a kind language teacher welcoming a nervous beginner.',
    }),
  })

  if (!res.ok) {
    const details = await res.text()
    console.error('API_TTS: upstream error', details)
    return NextResponse.json({ error: 'tts failed', details }, { status: res.status })
  }

  const buf = await res.arrayBuffer()
  return new NextResponse(buf, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' },
  })
}
