'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking, ttsAvailable } from '@/lib/tts'

/**
 * Localized voice narration for guided flows (onboarding / how-to).
 * Off by default so we never surprise the user with audio.
 */
export function useNarration(lang: string) {
  const [enabled, setEnabled] = useState(false)
  const [supported] = useState(() => (typeof window === 'undefined' ? true : ttsAvailable()))
  const langRef = useRef(lang)

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  const say = useCallback(
    (text: string) => {
      if (!enabled || !text) return
      speak(text, langRef.current, 0.95)
    },
    [enabled]
  )

  useEffect(() => {
    if (!enabled) stopSpeaking()
  }, [enabled])

  useEffect(() => () => stopSpeaking(), [])

  return { enabled, setEnabled, say, supported, stop: stopSpeaking }
}
