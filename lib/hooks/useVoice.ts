'use client'

import { useCallback, useRef, useState } from 'react'
import { talkLevel, resetTalkLevel } from '@/lib/audio/talkLevel'

// Minimal typings for the Web Speech API.
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
 * Speech-to-text. Always records the mic (MediaRecorder), so we can fall back to
 * the server (Whisper / gpt-4o-mini-transcribe) whenever the browser's Web
 * Speech API is unavailable or returns nothing — this is what makes the mic
 * work across browsers. Live amplitude still feeds the animated mouth.
 */
export function useVoice(lang = 'en-US') {
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const srTextRef = useRef('')
  const srResolveRef = useRef<((t: string) => void) | null>(null)

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
      /* amplitude optional */
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    srTextRef.current = ''
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('mic-denied')
      throw new Error('microphone unavailable')
    }
    streamRef.current = stream

    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
    mr.start()
    mediaRef.current = mr
    startAnalyser(stream)

    const SR = getSpeechRecognition()
    if (SR) {
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
        srTextRef.current = s
      }
      rec.onerror = () => {}
      rec.onend = () => {
        const r = srResolveRef.current
        srResolveRef.current = null
        r?.(srTextRef.current.trim())
      }
      recRef.current = rec
      try {
        rec.start()
      } catch {
        /* SR may fail if the mic is busy — server fallback covers it */
      }
    }

    setRecording(true)
  }, [lang, startAnalyser])

  const stop = useCallback(async (): Promise<string> => {
    setTranscribing(true)
    stopAnalyser()

    // 1) fast path: browser speech recognition
    let srText = ''
    if (recRef.current) {
      const rec = recRef.current
      recRef.current = null
      srText = await new Promise<string>((resolve) => {
        srResolveRef.current = resolve
        try {
          rec.stop()
        } catch {
          resolve(srTextRef.current.trim())
        }
      })
    }

    // 2) stop the recorder
    const mr = mediaRef.current
    let blob: Blob | null = null
    if (mr && mr.state !== 'inactive') {
      blob = await new Promise<Blob>((resolve) => {
        mr.onstop = () => resolve(new Blob(chunksRef.current, { type: 'audio/webm' }))
        try {
          mr.stop()
        } catch {
          resolve(new Blob())
        }
      })
    }
    mediaRef.current = null
    releaseStream()
    setRecording(false)

    if (srText) {
      setTranscribing(false)
      return srText
    }

    // 3) fallback: server transcription
    if (!blob || blob.size === 0) {
      setTranscribing(false)
      return ''
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
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
