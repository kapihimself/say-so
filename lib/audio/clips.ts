'use client'

import { speak, stopSpeaking } from '@/lib/tts'

/**
 * Playback for pre-recorded OpenAI-TTS clips, with a server-TTS fallback
 * (gpt-4o-mini-tts via /api/tts) and the browser voice only as a last resort
 * if the network call fails.
 */

const existsCache = new Map<string, boolean>()
let current: HTMLAudioElement | null = null

const VOICE_BY_LANG: Record<string, string> = { id: 'coral', es: 'nova', pt: 'shimmer' }

async function exists(url: string): Promise<boolean> {
  const hit = existsCache.get(url)
  if (hit !== undefined) return hit
  try {
    const r = await fetch(url, { method: 'HEAD' })
    existsCache.set(url, r.ok)
    return r.ok
  } catch {
    existsCache.set(url, false)
    return false
  }
}

function playUrl(url: string, onFail: () => void) {
  try {
    current?.pause()
  } catch {
    /* ignore */
  }
  stopSpeaking()
  const a = new Audio(url)
  current = a
  a.play().catch(onFail)
}

/** Natural server TTS — used whenever a pre-recorded clip is missing. */
async function speakServer(text: string, langCode: string): Promise<boolean> {
  try {
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: VOICE_BY_LANG[langCode] ?? 'alloy',
        instructions:
          'Speak warmly, slowly and clearly, like a kind language teacher encouraging a nervous beginner. Match the language of the text.',
      }),
    })
    if (!r.ok) return false
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    playUrl(url, () => speak(text, langCode, 0.98))
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    return true
  } catch {
    return false
  }
}

/** Play a narration clip by key; fall back to server TTS, then browser voice. */
export async function playNarration(langCode: string, key: string, fallbackText: string, rate = 0.98): Promise<void> {
  if (typeof window === 'undefined') return
  const url = `/audio/narration/${langCode}/${key}.mp3`
  if (await exists(url)) {
    playUrl(url, () => void speakServer(fallbackText, langCode))
    return
  }
  if (await speakServer(fallbackText, langCode)) return
  speak(fallbackText, langCode, rate)
}

/** Play the pre-recorded English letter name (a–z); fall back to server TTS. */
export async function playLetter(letter: string): Promise<void> {
  if (typeof window === 'undefined') return
  const url = `/audio/letters/${letter.toLowerCase()}.mp3`
  if (await exists(url)) {
    playUrl(url, () => speak(letter, 'en-US', 0.85))
    return
  }
  if (await speakServer(letter, 'id')) return
  speak(letter, 'en-US', 0.85)
}

/** Play the phonics SOUND of a letter (e.g. "buh, ball"); fall back to TTS. */
export async function playSound(letter: string): Promise<void> {
  if (typeof window === 'undefined') return
  const url = `/audio/sounds/${letter.toLowerCase()}.mp3`
  if (await exists(url)) {
    playUrl(url, () => speak(letter, 'en-US', 0.85))
    return
  }
  if (await speakServer(letter, 'id')) return
  speak(letter, 'en-US', 0.85)
}

/** Natural voice for text that can't be pre-recorded (e.g. a learner's name). */
export async function speakDynamic(
  text: string,
  voice: string,
  fallbackLangCode: string,
  instructions?: string
): Promise<void> {
  if (typeof window === 'undefined' || !text) return
  try {
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, instructions }),
    })
    if (!r.ok) throw new Error('tts')
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    playUrl(url, () => speak(text, fallbackLangCode, 0.98))
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  } catch {
    speak(text, fallbackLangCode, 0.98)
  }
}

export function stopAudio() {
  try {
    current?.pause()
  } catch {
    /* ignore */
  }
  stopSpeaking()
}