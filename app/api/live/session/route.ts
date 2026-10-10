import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const BASE = (process.env.STT_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
const KEY = process.env.STT_API_KEY ?? ''

type NativeLang = 'id' | 'es' | 'pt'
type TeacherLang = 'id' | 'en' | 'bilingual'

type LiveContext = {
  studentName?: string
  level?: string
  unitTitle?: string
  grammarFocus?: string[]
  vocab?: string[]
  teacherLang?: TeacherLang
  nativeLang?: NativeLang
}

const NATIVE: Record<NativeLang, { label: string; demonym: string; interference: string }> = {
  id: {
    label: 'Bahasa Indonesia',
    demonym: 'Indonesian',
    interference:
      'Watch for typical Indonesian interference: no tense/lax vowel contrast (/ɪ/→/i/, /æ/→/e/), /θ/→/t/ and /ð/→/d/, final voiced consonants devoiced (big→bik), /v/→/f/.',
  },
  es: {
    label: 'Spanish (Español)',
    demonym: 'Spanish-speaking',
    interference:
      'Watch for typical Spanish interference: /ɪ/→/i/, /æ/→/a/, /b/ and /v/ merged, /θ/→/s/ and /ð/→/d/, "sh"→"ch", and an epenthetic /e/ before initial s-clusters (speak→espeak).',
  },
  pt: {
    label: 'Portuguese, Brazil (Português)',
    demonym: 'Brazilian Portuguese-speaking',
    interference:
      'Watch for typical Brazilian Portuguese interference: final consonants devoiced (big→bik), /ɪ/→/i/, /æ/→/ɛ/, /θ/→/t/ and /ð/→/d/, an epenthetic /i/ before initial s-clusters (speak→ispeak), and final /l/→/w/.',
  },
}

function buildSystemPrompt(ctx: LiveContext): string {
  const name = ctx.studentName || 'the student'
  const level = ctx.level || 'B1'
  const unit = ctx.unitTitle || 'Everyday Communication'
  const grammar = (ctx.grammarFocus ?? []).join(', ') || 'general conversation'
  const vocab = (ctx.vocab ?? []).join(', ') || 'everyday vocabulary'
  const native = NATIVE[ctx.nativeLang ?? 'id']

  const langRule =
    ctx.teacherLang === 'en'
      ? `Speak ONLY in English. Immersive mode — do not use ${native.label}.`
      : ctx.teacherLang === 'id'
        ? `Explain everything in ${native.label}. Use English only for the example phrases and practice lines the student should repeat.`
        : `BILINGUAL MODE: Explain grammar rules and give encouragement in ${native.label}. Use English for the practice dialogue and example sentences. If the student seems confused or stuck, switch fully to ${native.label} to clarify, then return to English.`

  return `You are a warm, encouraging English teacher in a cozy virtual classroom, speaking live over voice. Your student is ${name}, a ${native.demonym} learner at CEFR level ${level}.

The student's native language is ${native.label}. ${native.interference}
Use this to anticipate and explain the mistakes they are most likely to make.

CEFR LEVEL ALIGNMENT — stay strictly within ${level}:
- A1/A2: very short sentences, high-frequency words, present/past simple, concrete topics only.
- B1: connected sentences, familiar topics, present perfect & conditionals.
- B2: complex ideas, abstract topics, hedging and opinion language.
- C1/C2: nuanced, idiomatic, near-native register.
Do NOT use grammar or vocabulary far above ${level}; grade your input to the level.

Current unit: "${unit}".
Grammar focus this session: ${grammar}.
Vocabulary to reinforce: ${vocab}.

LANGUAGE POLICY:
${langRule}

VOICE CONVERSATION RULES (this is a live spoken lesson, not a chat):
- Keep turns SHORT — 1 to 3 sentences. This is a conversation, not a lecture.
- You actively guide: HOOK, EXPLAIN briefly, SHOW an example, then ask the student to try a sentence out loud.
- If the student makes a grammar or pronunciation mistake, correct gently: say what they did well, give the correct form once, and ask them to retry. NEVER say "that is wrong".
- Acknowledge frustration warmly in ${native.label} and slow down.
- Pronunciation coaching: when a sound is the problem, name it simply (e.g. "long e", "th") and give one physical cue (lips, tongue, jaw). Do not read phonetic symbols aloud.
- Celebrate small wins. End turns by inviting the student to speak again.
- Do not use markdown, backticks, or lists — everything is spoken aloud.`
}

/**
 * Browser -> OpenAI Realtime (WebRTC) bridge.
 *
 * The browser POSTs its SDP offer; we forward it to OpenAI with the session
 * configuration and return the SDP answer. The API key never leaves the server,
 * and audio flows peer-to-peer between the browser and OpenAI over WebRTC.
 */
export async function POST(request: NextRequest) {
  if (!KEY) return NextResponse.json({ error: 'live not configured' }, { status: 503 })

  const sdp = await request.text()
  if (!sdp.trim()) return NextResponse.json({ error: 'SDP offer required' }, { status: 400 })

  let ctx: LiveContext = {}
  try {
    const header = request.headers.get('x-live-context')
    if (header) ctx = JSON.parse(header) as LiveContext
  } catch {
    ctx = {}
  }

  const fd = new FormData()
  fd.set('sdp', sdp)
  fd.set(
    'session',
    JSON.stringify({
      type: 'realtime',
      model: 'gpt-realtime-2.1',
      instructions: buildSystemPrompt(ctx),
      audio: {
        input: { noise_reduction: { type: 'near_field' } },
        output: { voice: 'marin', speed: 0.92 },
      },
    })
  )

  try {
    const res = await fetch(`${BASE}/realtime/calls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'OpenAI-Safety-Identifier': 'say-so-learner',
      },
      body: fd,
    })

    if (!res.ok) {
      const details = await res.text()
      console.error('API_LIVE: upstream error', res.status, details.slice(0, 500))
      return NextResponse.json({ error: 'live session failed', details: details.slice(0, 300) }, { status: res.status })
    }

    const answer = await res.text()
    return new NextResponse(answer, {
      status: 200,
      headers: { 'Content-Type': 'application/sdp', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('API_LIVE: fetch failed', e)
    return NextResponse.json({ error: 'live session failed' }, { status: 502 })
  }
}
