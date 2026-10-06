'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Buddy, type BuddyLook } from '@/components/character/Buddy'
import { Whiteboard } from '@/components/room/Whiteboard'
import { LevelMeter } from '@/components/room/LevelMeter'
import { useAppStore, LEVELS, type TeacherLang } from '@/lib/store/appStore'
import { getLocale } from '@/lib/i18n'
import { CURRICULUM } from '@/lib/curriculum'
import { useVoice } from '@/lib/hooks/useVoice'
import { Mic, Send, Volume2, VolumeX, ArrowLeft, Loader2, Square, Headphones, ClipboardList, AudioLines } from 'lucide-react'
import { HudPanel } from '@/components/room/HudPanel'
import { speak as speakTts } from '@/lib/tts'
import { cn } from '@/lib/utils'
import { PhoneticBoard } from '@/components/room/PhoneticBoard'

const ClassroomScene = dynamic(
  () => import('@/components/three/ClassroomScene').then((m) => m.ClassroomScene),
  { ssr: false }
)

type Msg = { role: 'user' | 'assistant'; content: string; hidden?: boolean }

const TEACHER_LOOK: BuddyLook = { skin: '#F1C9A5', hair: '#9FB0F0', hairStyle: 'bun', outfit: '#E8856A', cheeks: '#F4A8C0' }

const LANG_LABEL: Record<TeacherLang, string> = { id: 'ID', bilingual: 'ID+EN', en: 'EN' }
const LANG_CYCLE: TeacherLang[] = ['id', 'bilingual', 'en']

function clean(text: string) {
  return text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim()
}

// Common Indonesian words for language detection
const ID_WORDS = new Set([
  'dan', 'yang', 'di', 'ke', 'dari', 'ini', 'itu', 'ada', 'bisa', 'adalah',
  'kita', 'kamu', 'saya', 'aku', 'mereka', 'dengan', 'untuk', 'pada', 'oleh',
  'juga', 'sudah', 'belum', 'akan', 'telah', 'ngomong', 'pelan', 'bikin',
  'malu', 'halo', 'pernah', 'bingung', 'kapan', 'pakai', 'atau', 'ya',
  'kok', 'aja', 'nih', 'tuh', 'sih', 'dong', 'tahu', 'kalau', 'wajar',
  'emang', 'bilingual', 'belajar', 'bahasa', 'inggris', 'mari', 'coba',
  'seperti', 'contoh', 'kalimat', 'tapi', 'mau', 'lagi', 'udah', 'tadi',
  'sama', 'buat', 'kamu', 'dia', 'kami', 'kalian', 'siapa', 'apa', 'mana',
  'bagaimana', 'mengapa', 'kenapa', 'sangat', 'sekali', 'lebih', 'kurang',
  'paling', 'baru', 'lama', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam',
  'tujuh', 'delapan', 'sembilan', 'sepuluh', 'hari', 'tahun', 'bulan',
  'minggu', 'jam', 'menit', 'detik', 'sekarang', 'besok', 'kemarin', 'nanti',
  'terus', 'lalu', 'latih', 'latihan', 'ucapkan', 'ulangi', 'ikut', 'ikuti',
  'baca', 'dengar', 'tulis', 'tanya', 'jawab', 'artinya', 'maksudnya',
  'salah', 'betul', 'benar', 'hebat', 'mantap', 'keren', 'bagus', 'pintar'
])

// Common English words for language detection
const EN_WORDS = new Set([
  'the', 'and', 'of', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was',
  'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this',
  'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what',
  'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'use', 'an',
  'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other',
  'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
  'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two',
  'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
  'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now',
  'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
  'let', 'lets', 'us', 'we', 'our', 'good', 'very', 'well', 'here', 'there',
  'every', 'speak', 'say', 'talk', 'learn', 'teacher', 'student', 'class',
  'great', 'correct', 'wrong', 'try', 'practice', 'repeat', 'sentence',
  'grammar', 'vocabulary', 'vocab', 'english', 'indonesian', 'bilingual'
])

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+(?:[.!?]+|$)/g)
  if (!matches) return [text]
  return matches.map((s) => s.trim()).filter((s) => s.length > 0)
}

type SegLang = 'native' | 'en'

function detectLanguage(sentence: string): SegLang {
  const words = sentence.toLowerCase().match(/[a-z0-9']+/g) || []
  let idScore = 0
  let enScore = 0

  for (const word of words) {
    if (ID_WORDS.has(word)) {
      idScore++
    }
    if (EN_WORDS.has(word)) {
      enScore++
    }
  }

  if (idScore > enScore) return 'native'
  if (enScore > idScore) return 'en'

  // Fallback check for common Indonesian particles/fillers if tied
  const idFillers = ['ya', 'kok', 'aja', 'sih', 'dong', 'kan', 'tapi', 'mau', 'udah', 'nih', 'tuh', 'yuk']
  for (const word of words) {
    if (idFillers.includes(word)) {
      return 'native'
    }
  }

  return 'en'
}

function parseBilingualSegments(text: string): { text: string; lang: SegLang }[] {
  const parts = text.split(/`([^`]+)`/g)
  return parts
    .map((part, index) => {
      const isEnglish = index % 2 === 1
      const cleaned = clean(part)
      if (!cleaned) return null

      const lang: SegLang = isEnglish ? 'en' : detectLanguage(cleaned)
      return { text: cleaned, lang }
    })
    .filter((s): s is { text: string; lang: SegLang } => s !== null)
}

export default function RoomPage() {
  const router = useRouter()
  const { name, level, characterId, teacherLang, nativeLang, setTeacherLang, character } = useAppStore()
  const me = character()
  const locale = getLocale(nativeLang)
  const t = locale.ui
  const { recording, transcribing, start, stop } = useVoice()

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [ready, setReady] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  // Guard: need onboarding done
  useEffect(() => {
    if (!level || !characterId) {
      router.replace('/onboarding')
      return
    }
    setReady(true)
  }, [level, characterId, router])

  const unit = level ? CURRICULUM[level] : null

  const speak = useCallback(
    (text: string) => {
      if (!soundOn || typeof window === 'undefined' || !window.speechSynthesis) return

      window.speechSynthesis.cancel()

      const segments = parseBilingualSegments(text)

      for (const segment of segments) {
        const tag = segment.lang === 'en' ? 'en-US' : locale.speechTag
        const u = new SpeechSynthesisUtterance(segment.text)
        u.lang = tag
        u.rate = segment.lang === 'en' ? 0.94 : 1.0
        u.pitch = 1.05

        // Find best matching voice if available
        const voices = window.speechSynthesis.getVoices()
        let voice = voices.find((v) => v.lang.toLowerCase() === tag.toLowerCase())
        if (!voice) {
          const prefix = tag.split('-')[0].toLowerCase()
          voice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
        }
        if (voice) {
          u.voice = voice
        }

        window.speechSynthesis.speak(u)
      }
    },
    [soundOn, locale.speechTag]
  )

  const sendToTeacher = useCallback(
    async (history: Msg[]) => {
      if (!level || !unit) return
      setStreaming(true)
      setMessages([...history, { role: 'assistant', content: '' }])
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            teacherContext: {
              studentName: name,
              level,
              unitTitle: unit.unitTitle,
              grammarFocus: unit.grammarFocus,
              vocab: unit.vocab,
              teacherLang,
              nativeLang,
            },
          }),
        })
        if (!res.ok || !res.body) throw new Error('no stream')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const t = line.trim()
            if (!t.startsWith('data: ')) continue
            const data = t.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                acc += parsed.text
                setMessages([...history, { role: 'assistant', content: acc }])
              }
            } catch {}
          }
        }
        speak(acc)
      } catch {
        setMessages([
          ...history,
          { role: 'assistant', content: t.roomError },
        ])
      } finally {
        clearTimeout(timeout)
        setStreaming(false)
      }
    },
    [level, unit, name, teacherLang, nativeLang, speak, t.roomError]
  )

  // Kick off the lesson with a teacher greeting
  useEffect(() => {
    if (!ready || startedRef.current || !unit || level === 'A1') return
    startedRef.current = true
    const kickoff: Msg = { role: 'user', content: 'Halo teacher, aku siap mulai belajar hari ini.', hidden: true }
    sendToTeacher([kickoff])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function submitText(text: string) {
    const t = text.trim()
    if (!t || streaming) return
    setInput('')
    sendToTeacher([...messages, { role: 'user', content: t }])
  }

  async function handleMic() {
    if (recording) {
      const text = await stop()
      if (text) submitText(text)
    } else {
      await start()
    }
  }

  function cycleLang() {
    const i = LANG_CYCLE.indexOf(teacherLang)
    setTeacherLang(LANG_CYCLE[(i + 1) % LANG_CYCLE.length])
  }

  if (!ready || !level || !unit) return null
  const lv = LEVELS[level]
  const visible = messages.filter((m) => !m.hidden)
  const teacherTalking = streaming
  const teacherText = [...visible].reverse().find((m) => m.role === 'assistant')?.content ?? ''

  return (
    <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden">
      {/* top bar */}
      <header className="z-20 flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <Link href="/karakter" className="doodle-btn inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm">
          <ArrowLeft className="size-4" /> {t.roomExit}
        </Link>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-black doodle-outline doodle-shadow-sm">
          {t.roomClass} <span style={{ color: lv.color }}>{level}</span> · {unit.unitTitle}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => speakTts(t.narRoom, locale.speechTag)}
            className="doodle-btn inline-flex items-center bg-white px-3 py-2"
            title={`${t.narrateLabel}`}
            aria-label={`${t.narrateLabel}: ${t.narRoom}`}
          >
            <Headphones className="size-4" aria-hidden />
          </button>
          <button onClick={cycleLang} className="doodle-btn inline-flex items-center bg-[var(--color-lemon)] px-3 py-2 text-sm" title={t.roomLangTitle} aria-label={t.roomLangTitle}>
            {LANG_LABEL[teacherLang]}
          </button>
          <button onClick={() => setSoundOn((s) => !s)} className="doodle-btn inline-flex items-center bg-white px-3 py-2" title={t.roomSoundTitle} aria-label={t.roomSoundTitle} aria-pressed={soundOn}>
            {soundOn ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 overflow-hidden px-4 pb-4 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1">
        {/* ---- SCENE (2D classroom, mobile) ---- */}
        <section className="relative flex items-end justify-center gap-4 overflow-hidden rounded-[2rem] bg-gradient-to-b from-[var(--color-sky-soft)] via-[var(--color-grape-soft)] to-[var(--color-lemon-soft)] px-4 pb-3 pt-16 doodle-outline doodle-shadow lg:hidden">
          <div className="pointer-events-none absolute inset-x-4 top-3 h-14 rounded-2xl bg-[var(--color-ink)]/85" />
          <div className="pointer-events-none absolute left-7 top-5 h-1.5 w-20 rounded-full bg-white/40" />
          <div className="pointer-events-none absolute left-7 top-9 h-1.5 w-28 rounded-full bg-white/25" />

          <div className="relative flex flex-col items-center">
            <div className="h-28 w-28 animate-float">
              <Buddy look={TEACHER_LOOK} talking={teacherTalking} expression="happy" />
            </div>
            <span className="rounded-full bg-white px-3 py-0.5 text-xs font-black doodle-outline doodle-shadow-sm">
              {t.roomTeacherName}
            </span>
          </div>

          {me && (
            <div className="relative flex flex-col items-center">
              <div className="h-24 w-24">
                <Buddy look={me.look} talking={recording} expression={recording ? 'wow' : 'happy'} />
              </div>
              <span className="rounded-full bg-white px-3 py-0.5 text-xs font-black doodle-outline doodle-shadow-sm">
                {name || me.name}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute right-3 top-3 rounded-2xl bg-white/85 px-2 py-1 doodle-outline doodle-shadow-sm backdrop-blur">
            <LevelMeter />
          </div>
        </section>

        {/* ---- SCENE (3D classroom) ---- */}
        <section className="relative hidden min-h-0 overflow-hidden rounded-[2rem] doodle-outline doodle-shadow lg:block">
          <ClassroomScene
            className="absolute inset-0"
            teacherLook={TEACHER_LOOK}
            studentLook={me?.look ?? null}
            teacherTalking={teacherTalking}
            teacherText={teacherText}
            recording={recording}
          />

          {/* filmic vignette + soft grain */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_35%,transparent_45%,rgba(43,34,56,0.28)_100%)]" />

          {/* HUD overlays — collapsed pills that expand on hover/tap */}
          <div className="pointer-events-none absolute inset-0">
            <HudPanel icon={<ClipboardList className="size-4" />} label={unit.unitTitle} align="left" className="absolute left-4 top-4">
              <Whiteboard level={level} unit={unit} />
            </HudPanel>

            <HudPanel
              icon={<AudioLines className="size-4" />}
              label={teacherTalking ? t.roomTeacherRole : recording ? t.roomListening : 'Audio'}
              align="right"
              className="absolute right-4 top-4"
            >
              <div className="rounded-2xl bg-white/95 px-3 py-2 doodle-outline doodle-shadow-sm backdrop-blur">
                <LevelMeter label={teacherTalking ? t.roomTeacherRole : recording ? t.roomListening : 'Audio'} />
              </div>
            </HudPanel>
          </div>

          {/* name chips */}
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex items-end justify-between px-4">
            <span className="rounded-full bg-white/90 px-3 py-0.5 text-xs font-black doodle-outline doodle-shadow-sm backdrop-blur">
              {t.roomTeacherName}
            </span>
            {me && (
              <span className="rounded-full bg-white/90 px-3 py-0.5 text-xs font-black doodle-outline doodle-shadow-sm backdrop-blur">
                {name || me.name}
              </span>
            )}
          </div>

          {/* talking bubble */}
          {teacherTalking && (
            <motion.div
              initial={{ scale: 0, y: 6, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-black doodle-outline doodle-shadow-sm"
            >
              {t.roomSpeaking}
            </motion.div>
          )}
        </section>

        {/* ---- CHAT / PHONETIC PRACTICE ---- */}
        {level === 'A1' ? (
          <PhoneticBoard />
        ) : (
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[2rem] bg-white doodle-outline doodle-shadow">
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
              {visible.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="flex items-center gap-2 text-[var(--color-muted-warm)]">
                    <Loader2 className="size-5 animate-spin" /> <span className="font-bold">{t.roomLoading}</span>
                  </div>
                </div>
              )}
              {visible.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] font-semibold leading-relaxed doodle-outline',
                      m.role === 'user'
                        ? 'bg-[var(--color-grape)] text-white doodle-shadow-sm'
                        : 'bg-[var(--color-mint-soft)] text-[var(--color-warm-text)] doodle-shadow-sm'
                    )}
                  >
                    {m.content || (streaming && i === visible.length - 1 ? '…' : '')}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* input */}
            <div className="border-t-[3px] border-[var(--color-ink)] p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMic}
                  disabled={transcribing || streaming}
                  className={cn(
                    'doodle-btn grid size-12 shrink-0 place-items-center',
                    recording ? 'bg-[var(--color-bubblegum)] text-white' : 'bg-[var(--color-mint)]',
                    (transcribing || streaming) && 'opacity-50'
                  )}
                  title={t.roomMicTitle}
                  aria-label={t.roomMicTitle}
                  aria-pressed={recording}
                >
                  {transcribing ? <Loader2 className="size-5 animate-spin" aria-hidden /> : recording ? <Square className="size-5 fill-current" aria-hidden /> : <Mic className="size-5" aria-hidden />}
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitText(input)}
                  placeholder={recording ? t.roomListening : t.roomPlaceholder}
                  disabled={recording}
                  className="h-12 flex-1 rounded-full bg-[var(--color-cloud)] px-5 font-semibold doodle-outline outline-none placeholder:text-[var(--color-muted-warm)]/60 disabled:opacity-60"
                />
                <button
                  onClick={() => submitText(input)}
                  disabled={!input.trim() || streaming}
                  aria-label={t.roomSend}
                  className="doodle-btn grid size-12 shrink-0 place-items-center bg-[var(--color-grape)] text-white disabled:opacity-40"
                >
                  <Send className="size-5" aria-hidden />
                </button>
              </div>
              {recording && (
                <div className="mt-3 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-0.5 h-6">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[var(--color-bubblegum)] rounded-full"
                        animate={{
                          height: [8, Math.random() * 20 + 6, 8]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.5 + i * 0.04,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs font-bold text-[var(--color-bubblegum)]">{t.roomRecordingHint}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
