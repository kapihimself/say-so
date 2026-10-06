'use client'

/**
 * Free, dependency-free text-to-speech via the Web Speech API.
 * (Whisper is speech-to-text; for narration we need TTS, and the browser's
 * speechSynthesis needs no API key or network round-trip.)
 */

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
  if (exact) return exact
  const prefix = lang.split('-')[0].toLowerCase()
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
}

export function speak(text: string, lang: string, rate = 0.95): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = rate
  u.pitch = 1.05
  const voice = pickVoice(lang)
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

/** True when the browser exposes speech synthesis. */
export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
