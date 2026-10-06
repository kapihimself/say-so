'use client'

import { useCallback, useRef, useState } from 'react'
import { talkLevel, resetTalkLevel } from '@/lib/audio/talkLevel'

// Minimal typings for the Web Speech API (not in lib.dom for all TS versions).
type SRAlternative = { transcript: string }
type SRResult = { length: number; [index: number]: SRAlternative }
type SRResultList = { length: number; [index: number]: SRResult }
type SRResultEvent = { resultIndex: number; results: SRResultList }
type SRErrorEvent = { error?: string }

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SRResultEvent) => void) | null
  onerror: ((e: SRErrorEvent) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * Speech-to-text. Prefers the browser Web Speech API (free, no API key, live);
 * falls back to MediaRecorder → /api/transcribe (Whisper) when unavailable.
 * Also streams live mic amplitude into the shared talkLevel signal for the
 * animated mouth / level meter.
 */
export function useVoice(lang = 'en-US') {
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')
  const resolveRef = useRef<((t: string) => void) | null>(null)
  const modeRef = useRef<'sr' | 'whisper'>('sr')

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)

  const stopAnalyser = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    resetTalkLevel()
  }, [])

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startAnalyser = useCallback((stream: MediaStream) => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.75
      source.connect(analyser)
      audioCtxRef.current = ctx

      const data = new Uint8Array(analyser.frequencyBinCount)
      const bandCount = talkLevel.bands.length

      const tick = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        const rms = sum / data.length / 255
        talkLevel.value = talkLevel.value * 0.6 + Math.min(1, rms * 3.2) * 0.4
        talkLevel.active = talkLevel.value > 0.04

        const per = Math.floor(data.length / bandCount)
        for (let b = 0; b < bandCount; b++) {
          let s = 0
          for (let i = b * per; i < (b + 1) * per; i++) s += data[i]
          talkLevel.bands[b] = s / per / 255
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      // amplitude is a nice-to-have
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    finalRef.current = ''

    const SR = getSpeechRecognition()
    if (SR) {
      modeRef.current = 'sr'
      const rec = new SR()
      rec.lang = lang
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 1
      rec.onresult = (e) => {
        let s = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const alt = e.results[i][0]
          if (alt) s += alt.transcript
        }
        finalRef.current = s
      }
      rec.onerror = (e) => setError(e?.error ?? 'sr-error')
      rec.onend = () => {
        setRecording(false)
        setTranscribing(false)
        const r = resolveRef.current
        resolveRef.current = null
        r?.(finalRef.current.trim())
      }
      recRef.current = rec
      try {
        rec.start()
      } catch {
        /* already started */
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        startAnalyser(stream)
      } catch {
        /* mic level optional */
      }
      setRecording(true)
      return
    }

    modeRef.current = 'whisper'
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
    mr.start()
    mediaRef.current = mr
    startAnalyser(stream)
    setRecording(true)
  }, [lang, startAnalyser])

  const stop = useCallback(async (): Promise<string> => {
    if (modeRef.current === 'sr' && recRef.current) {
      setTranscribing(true)
      stopAnalyser()
      return new Promise<string>((resolve) => {
        resolveRef.current = resolve
        try {
          recRef.current?.stop()
        } catch {
          resolve(finalRef.current.trim())
        }
        setTimeout(() => {
          releaseStream()
        }, 200)
      })
    }

    const mr = mediaRef.current
    if (!mr) return ''
    setRecording(false)
    setTranscribing(true)
    stopAnalyser()

    const blob: Blob = await new Promise((resolve) => {
      mr.onstop = () => resolve(new Blob(chunksRef.current, { type: 'audio/webm' }))
      mr.stop()
    })
    releaseStream()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    try {
      const form = new FormData()
      form.append('audio', blob, 'audio.webm')
      const res = await fetch('/api/transcribe', { method: 'POST', body: form, signal: controller.signal })
      if (!res.ok) throw new Error(`transcribe ${res.status}`)
      const data = await res.json()
      return (data.text ?? '').trim()
    } catch (e) {
      setError(e instanceof Error && e.name === 'AbortError' ? 'timeout' : 'failed')
      return ''
    } finally {
      clearTimeout(timeout)
      setTranscribing(false)
    }
  }, [stopAnalyser, releaseStream])

  const srSupported = typeof window !== 'undefined' && !!getSpeechRecognition()

  return { recording, transcribing, error, start, stop, srSupported }
}
