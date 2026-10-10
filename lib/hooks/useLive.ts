'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { talkLevel, resetTalkLevel } from '@/lib/audio/talkLevel'

/**
 * GPT Live — real-time speech-to-speech over WebRTC.
 *
 * The mic becomes a live media track (no MediaRecorder/stop-to-send), the
 * teacher's voice streams back as a remote audio track, and the `oai-events`
 * data channel carries transcripts. The server route (/api/live/session)
 * exchanges our SDP offer for OpenAI's answer and keeps the API key server-side.
 */

type LiveStatus = 'idle' | 'connecting' | 'live' | 'error'

type UseLiveOptions = {
  /** Teacher context — sent once, at session creation. */
  context?: Record<string, unknown>
  /** Fired with each finalized student utterance. */
  onUserTranscript?: (text: string) => void
  /** Fired with the complete teacher response (assembled from deltas). */
  onAssistantTranscript?: (text: string) => void
}

export function useLive({ context, onUserTranscript, onAssistantTranscript }: UseLiveOptions = {}) {
  const [status, setStatus] = useState<LiveStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const micRef = useRef<MediaStream | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)

  // Response assembly
  const assistantTextRef = useRef('')
  const assistantIdRef = useRef<string | null>(null)

  // Latest callbacks without re-binding the data channel handler
  const cbsRef = useRef({ onUserTranscript, onAssistantTranscript })
  const ctxRef = useRef<Record<string, unknown> | undefined>(context)
  useEffect(() => {
    cbsRef.current = { onUserTranscript, onAssistantTranscript }
    ctxRef.current = context
  }, [onUserTranscript, onAssistantTranscript, context])

  const stopAnalyser = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    resetTalkLevel()
  }, [])

  const teardown = useCallback(() => {
    stopAnalyser()
    micRef.current?.getTracks().forEach((t) => t.stop())
    micRef.current = null
    try {
      dcRef.current?.close()
    } catch {}
    dcRef.current = null
    try {
      pcRef.current?.close()
    } catch {}
    pcRef.current = null
    if (audioElRef.current) {
      audioElRef.current.srcObject = null
    }
    assistantTextRef.current = ''
    assistantIdRef.current = null
  }, [stopAnalyser])

  useEffect(() => () => teardown(), [teardown])

  const statusRef = useRef<LiveStatus>('idle')
  useEffect(() => {
    statusRef.current = status
  }, [status])

  const start = useCallback(async (contextOverride?: Record<string, unknown>) => {
    if (statusRef.current === 'connecting' || statusRef.current === 'live') return
    setError(null)
    setStatus('connecting')
    statusRef.current = 'connecting'
    if (contextOverride) ctxRef.current = { ...(ctxRef.current ?? {}), ...contextOverride }
    try {
      // 1. Mic
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
      micRef.current = mic

      // 2. Peer connection + teacher audio
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      const audio = document.createElement('audio')
      audio.autoplay = true
      audioElRef.current = audio
      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0]
        audio.play().catch(() => {})
      }

      // Mic amplitude meter for the 3D mouth (same signal the room already uses)
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new Ctx()
        const source = ctx.createMediaStreamSource(mic)
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

      for (const track of mic.getAudioTracks()) pc.addTrack(track, mic)

      // 3. Data channel — created BEFORE the offer, per the WebRTC handshake
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.addEventListener('message', (e) => {
        let event: Record<string, unknown>
        try {
          event = JSON.parse(e.data) as Record<string, unknown>
        } catch {
          return
        }
        const type = event.type as string | undefined
        if (!type) return

        // Teacher speech transcript — assemble deltas, fire on completion
        if (type === 'response.output_audio_transcript.delta') {
          const delta = (event.delta as string | undefined) ?? ''
          const itemId = event.item_id as string | undefined
          if (assistantIdRef.current && itemId !== assistantIdRef.current) {
            cbsRef.current.onAssistantTranscript?.(assistantTextRef.current.trim())
            assistantTextRef.current = ''
          }
          assistantIdRef.current = itemId ?? assistantIdRef.current
          assistantTextRef.current += delta
        } else if (type === 'response.output_audio_transcript.done') {
          const itemId = event.item_id as string | undefined
          if (!assistantIdRef.current || itemId === assistantIdRef.current) {
            const full = ((event.transcript as string | undefined) ?? assistantTextRef.current).trim()
            if (full) cbsRef.current.onAssistantTranscript?.(full)
          }
          assistantTextRef.current = ''
          assistantIdRef.current = null
        } else if (type === 'response.done') {
          if (assistantTextRef.current.trim()) {
            cbsRef.current.onAssistantTranscript?.(assistantTextRef.current.trim())
          }
          assistantTextRef.current = ''
          assistantIdRef.current = null
        }

        // Student speech transcript
        else if (type === 'conversation.item.input_audio_transcription.completed') {
          const text = ((event.transcript as string | undefined) ?? '').trim()
          if (text) {
            cbsRef.current.onUserTranscript?.(text)
          }
        }

        else if (type === 'error') {
          const message = (event.error as { message?: string } | undefined)?.message ?? 'live error'
          console.error('LIVE: server error', message)
        }

        else if (type === 'session.closed') {
          teardown()
          setStatus('idle')
        }
      })
      dc.addEventListener('close', () => {
        if (statusRef.current === 'live') {
          teardown()
          setStatus('idle')
        }
      })

      // 4. SDP offer -> server -> OpenAI -> answer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      if (pc.iceGatheringState !== 'complete') {
        await new Promise<void>((resolve) => {
          const done = () => resolve()
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') done()
          })
          // don't hang forever on candidate gathering
          setTimeout(done, 2500)
        })
      }

      const res = await fetch('/api/live/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'x-live-context': JSON.stringify(ctxRef.current ?? {}),
        },
        body: pc.localDescription?.sdp ?? offer.sdp,
      })
      if (!res.ok) throw new Error(`live session failed (${res.status})`)
      const answerSdp = await res.text()

      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
      setStatus('live')
    } catch (e) {
      console.error('LIVE: connect failed', e)
      teardown()
      setStatus('error')
      setError(e instanceof Error ? e.message : 'connect failed')
    }
  }, [teardown])

  const stop = useCallback(async () => {
    const dc = dcRef.current
    if (dc && dc.readyState === 'open') {
      // Graceful close: ask OpenAI to finalize, then clean up on session.closed.
      try {
        dc.send(JSON.stringify({ type: 'session.close' }))
      } catch {}
      await new Promise<void>((resolve) => setTimeout(resolve, 400))
    }
    teardown()
    setStatus('idle')
  }, [teardown])

  /** Push a text turn into the live conversation (used for the typed chat box). */
  const sendText = useCallback((text: string) => {
    const dc = dcRef.current
    if (!dc || dc.readyState !== 'open' || !text.trim()) return
    dc.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: text.trim() }],
        },
      })
    )
    dc.send(JSON.stringify({ type: 'response.create' }))
  }, [])

  return { status, error, start, stop, sendText, isLive: status === 'live' }
}