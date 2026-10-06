import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = (process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
const API_KEY = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''
const CHAT_MODEL = process.env.AI_CHAT_MODEL ?? process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini'

type NativeLang = 'id' | 'es' | 'pt'

type TeacherContext = {
  studentName?: string
  level?: string
  unitTitle?: string
  grammarFocus?: string[]
  vocab?: string[]
  teacherLang?: 'id' | 'en' | 'bilingual'
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

function buildSystemPrompt(ctx: TeacherContext): string {
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

  return `You are a warm, encouraging English teacher in a cozy virtual classroom. Your student is ${name}, a ${native.demonym} learner at CEFR level ${level}.

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

TEACHING METHOD — you actively guide, you do NOT wait for the student to fail. For every new grammar point or vocab, follow this flow naturally across turns:
1. HOOK — open with a relatable situation (in ${native.label} when not in immersive mode, e.g. "Have you ever wondered when to use 'have done' vs 'did'?").
2. EXPLAIN — short explanation, max 3 sentences.
3. SHOW — give 2–3 examples with context.
4. PRACTICE — ask the student to try a sentence.
5. CORRECT — if wrong, correct gently: "Almost! The correct form is..." then explain the rule briefly, ask them to retry. NEVER say "that is wrong".
6. REINFORCE — repeat with a fresh variation.
7. REWARD — acknowledge progress, celebrate small wins.

TONE RULES:
- Always encouraging, never make the student feel embarrassed.
- If the student goes silent or asks you to repeat, explain a DIFFERENT way, not the same words.
- If the student seems frustrated, acknowledge it warmly in ${native.label} (an equivalent of "this is tricky, it's normal to be confused, let's take it slowly").
- Keep responses conversational and SHORT — max 3 sentences per turn unless explaining a concept.
- Correct grammar and pronunciation mistakes you notice, but pick the most important one — don't overwhelm.
- ALWAYS wrap any English words, phrases, phonetic symbols, or practice sentences in markdown backticks (e.g. \`day\` or \`/eɪ/\`) so that the client-side speech engine can read them with a native English accent, while keeping explanations in ${native.label} outside backticks.
- Start the very first turn with a friendly greeting using the student's name and a light HOOK to begin the lesson.`
}

export async function POST(request: NextRequest) {
  const { messages, teacherContext } = (await request.json()) as {
    messages: { role: string; content: string }[]
    teacherContext: TeacherContext
  }

  const systemPrompt = buildSystemPrompt(teacherContext ?? {})

  const upstream = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: 350,
      temperature: 0.8,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
    }),
  }).catch((e) => {
    console.error('API_CHAT: Fetch failed', e)
    throw e
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    console.error('API_CHAT: Upstream error', err)
    return NextResponse.json({ error: 'AI error', details: err }, { status: upstream.status })
  }

  const encoder = new TextEncoder()
  const reader = upstream.body!.getReader()
  const decoder = new TextDecoder()

  const readable = new ReadableStream({
    async start(controller) {
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
            return
          }
          try {
            const parsed = JSON.parse(data)
            const text = parsed.choices?.[0]?.delta?.content
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          } catch {}
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
