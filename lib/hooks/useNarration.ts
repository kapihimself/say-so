'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { stopAudio, playNarration } from '@/lib/audio/clips'
import { ttsAvailable } from '@/lib/tts'

/**
 * Localized voice narration for guided flows. Plays pre-recorded OpenAI-TTS
 * clips when available, otherwise falls back to the browser voice.
 * Off by default so we never surprise the user with audio.
 */
export function useNarration(langCode: string, speechTag: string) {
  const [enabled, setEnabled] = useState(false)
  const [supported] = useState(() => (typeof window === 'undefined' ? true : ttsAvailable()))
  const codeRef = useRef(langCode)
  const tagRef = useRef(speechTag)

  useEffect(() => {
    codeRef.current = langCode
    tagRef.current = speechTag
  }, [langCode, speechTag])

  const say = useCallback(
    (key: string, fallback: string) => {
      if (!enabled) return
      void playNarration(codeRef.current, key, fallback)
    },
    [enabled]
  )

  useEffect(() => {
    if (!enabled) stopAudio()
  }, [enabled])

  useEffect(() => () => stopAudio(), [])

  return { enabled, setEnabled, say, supported, stop: stopAudio }
}
