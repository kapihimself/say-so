'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoice } from '@/lib/hooks/useVoice'
import { useAppStore } from '@/lib/store/appStore'
import { getLocale, fmt } from '@/lib/i18n'
import { DialectLens } from '@/components/room/DialectLens'
import { MistakeBankPanel } from '@/components/room/MistakeBankPanel'
import { scorePronunciation, phonemeIndexToSegment, phonemesToString } from '@/lib/phonetics/g2p'
import { applyInterference } from '@/lib/phonetics/interference'
import { useMistakeBank } from '@/lib/store/mistakeBank'
import { syncEvent } from '@/lib/progress/sync'
import {
  Volume2,
  Mic,
  Square,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

type IPASound = {
  symbol: string
  word: string
  anatomyState: 'long-e' | 'short-i' | 'flat-a' | 'theta' | 'eth' | 'diphthong-ei' | 'sh-sound'
}

const IPA_VOWELS: IPASound[] = [
  { symbol: '/ɪ/', word: 'ship', anatomyState: 'short-i' },
  { symbol: '/iː/', word: 'sheep', anatomyState: 'long-e' },
  { symbol: '/e/', word: 'bed', anatomyState: 'short-i' },
  { symbol: '/æ/', word: 'cat', anatomyState: 'flat-a' },
  { symbol: '/ɒ/', word: 'pot', anatomyState: 'flat-a' },
  { symbol: '/ɑː/', word: 'father', anatomyState: 'flat-a' },
  { symbol: '/ɔː/', word: 'door', anatomyState: 'short-i' },
  { symbol: '/ʊ/', word: 'good', anatomyState: 'short-i' },
  { symbol: '/uː/', word: 'boot', anatomyState: 'long-e' },
  { symbol: '/ʌ/', word: 'cup', anatomyState: 'flat-a' },
  { symbol: '/ɜː/', word: 'bird', anatomyState: 'short-i' },
  { symbol: '/ə/', word: 'about', anatomyState: 'short-i' }
]

const IPA_DIPHTHONGS: IPASound[] = [
  { symbol: '/eɪ/', word: 'day', anatomyState: 'diphthong-ei' },
  { symbol: '/aɪ/', word: 'my', anatomyState: 'diphthong-ei' },
  { symbol: '/ɔɪ/', word: 'boy', anatomyState: 'diphthong-ei' },
  { symbol: '/aʊ/', word: 'now', anatomyState: 'flat-a' },
  { symbol: '/oʊ/', word: 'go', anatomyState: 'diphthong-ei' },
  { symbol: '/ɪə/', word: 'near', anatomyState: 'short-i' },
  { symbol: '/eə/', word: 'hair', anatomyState: 'short-i' },
  { symbol: '/ʊə/', word: 'pure', anatomyState: 'short-i' }
]

const IPA_CONSONANTS: IPASound[] = [
  { symbol: '/p/', word: 'pen', anatomyState: 'short-i' },
  { symbol: '/b/', word: 'bad', anatomyState: 'short-i' },
  { symbol: '/t/', word: 'tea', anatomyState: 'short-i' },
  { symbol: '/d/', word: 'did', anatomyState: 'short-i' },
  { symbol: '/k/', word: 'cat', anatomyState: 'short-i' },
  { symbol: '/g/', word: 'got', anatomyState: 'short-i' },
  { symbol: '/tʃ/', word: 'chin', anatomyState: 'sh-sound' },
  { symbol: '/dʒ/', word: 'june', anatomyState: 'sh-sound' },
  { symbol: '/f/', word: 'fall', anatomyState: 'theta' },
  { symbol: '/v/', word: 'van', anatomyState: 'theta' },
  { symbol: '/θ/', word: 'thin', anatomyState: 'theta' },
  { symbol: '/ð/', word: 'this', anatomyState: 'eth' },
  { symbol: '/s/', word: 'sea', anatomyState: 'theta' },
  { symbol: '/z/', word: 'zoo', anatomyState: 'theta' },
  { symbol: '/ʃ/', word: 'she', anatomyState: 'sh-sound' },
  { symbol: '/ʒ/', word: 'vision', anatomyState: 'sh-sound' },
  { symbol: '/h/', word: 'how', anatomyState: 'short-i' },
  { symbol: '/m/', word: 'man', anatomyState: 'short-i' },
  { symbol: '/n/', word: 'no', anatomyState: 'short-i' },
  { symbol: '/ŋ/', word: 'sing', anatomyState: 'short-i' },
  { symbol: '/l/', word: 'leg', anatomyState: 'short-i' },
  { symbol: '/r/', word: 'red', anatomyState: 'sh-sound' },
  { symbol: '/w/', word: 'wet', anatomyState: 'short-i' },
  { symbol: '/j/', word: 'yes', anatomyState: 'short-i' }
]

const TARGET_WORD_SEGMENTS: Record<string, { text: string; isTargetPhonetic: boolean }[]> = {
  sheep: [
    { text: 'sh', isTargetPhonetic: false },
    { text: 'ee', isTargetPhonetic: true },
    { text: 'p', isTargetPhonetic: false }
  ],
  ship: [
    { text: 'sh', isTargetPhonetic: false },
    { text: 'i', isTargetPhonetic: true },
    { text: 'p', isTargetPhonetic: false }
  ],
  cat: [
    { text: 'c', isTargetPhonetic: false },
    { text: 'a', isTargetPhonetic: true },
    { text: 't', isTargetPhonetic: false }
  ],
  thin: [
    { text: 'th', isTargetPhonetic: true },
    { text: 'i', isTargetPhonetic: false },
    { text: 'n', isTargetPhonetic: false }
  ],
  this: [
    { text: 'th', isTargetPhonetic: true },
    { text: 'is', isTargetPhonetic: false }
  ],
  day: [
    { text: 'd', isTargetPhonetic: false },
    { text: 'ay', isTargetPhonetic: true }
  ],
  she: [
    { text: 'sh', isTargetPhonetic: true },
    { text: 'e', isTargetPhonetic: false }
  ]
}

export function PhoneticBoard() {
  const { nativeLang } = useAppStore()
  const locale = getLocale(nativeLang)
  const t = locale.ui
  const PHONETIC_DATA = locale.phonetics.items

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [wrongSegmentIdx, setWrongSegmentIdx] = useState<number | null>(null)
  const [isPlayingTarget, setIsPlayingTarget] = useState(false)
  const [isPlayingContrast, setIsPlayingContrast] = useState(false)
  const [heardPhonemes, setHeardPhonemes] = useState('')

  // IPA Soundboard Popover state
  const [showSoundboard, setShowSoundboard] = useState(false)
  const [previewAnatomyState, setPreviewAnatomyState] = useState<string | null>(null)
  const [previewLabel, setPreviewLabel] = useState<string | null>(null)

  const active = PHONETIC_DATA[selectedIndex]
  const { recording, transcribing, start, stop } = useVoice()
  const recordMistake = useMistakeBank((s) => s.record)

  // Reset scoring & preview states when switching sounds
  useEffect(() => {
    setScore(null)
    setTranscription('')
    setFeedback('')
    setWrongSegmentIdx(null)
    setHeardPhonemes('')
    setPreviewAnatomyState(null)
    setPreviewLabel(null)
  }, [selectedIndex, nativeLang])

  const playTTS = useCallback((text: string, lang: string, isTarget: boolean) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.82 // Slower for phonetic learning clarity
    u.pitch = 1.05

    // Get the high quality voice
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
    if (voice) u.voice = voice

    if (isTarget) {
      setIsPlayingTarget(true)
      u.onend = () => setIsPlayingTarget(false)
    } else {
      setIsPlayingContrast(true)
      u.onend = () => setIsPlayingContrast(false)
    }

    window.speechSynthesis.speak(u)
  }, [])

  const handleRecord = async () => {
    if (recording) {
      const text = await stop()
      if (!text) {
        setScore(0)
        setTranscription('(—)')
        setWrongSegmentIdx(null)
        setFeedback(t.pbSilenceFeedback)
        return
      }

      setTranscription(text)
      const cleanedText = text.toLowerCase().trim().replace(/[^a-z]/g, '')
      const targetWord = active.targetWord.toLowerCase()

      // Phoneme-level score: compares SOUNDS, not spelling.
      const result = scorePronunciation(targetWord, text)
      setHeardPhonemes(phonemesToString(result.heardPhonemes))
      let calculatedScore = result.score

      // Highlight the segment of the first mismatching target phoneme.
      const segmentCount = (TARGET_WORD_SEGMENTS[targetWord] ?? []).length || 1
      let wrongIdx: number | null = null
      const firstBad = result.ops.find((o) => o.type !== 'match' && o.a !== undefined)
      if (firstBad && firstBad.a !== undefined && segmentCount > 1) {
        wrongIdx = phonemeIndexToSegment(firstBad.a, result.targetPhonemes.length, segmentCount)
      }

      // Handle specific mistake overrides and highlight specific wrong segments
      let customAdvice = ''

      for (const [key, value] of Object.entries(active.mistakes)) {
        if (cleanedText === key || cleanedText.includes(key)) {
          customAdvice = value
          calculatedScore = Math.min(65, calculatedScore)

          // Match the segment indexes depending on target word
          if (targetWord === 'sheep' || targetWord === 'ship' || targetWord === 'cat') {
            wrongIdx = 1 // Vowel error
          } else if (targetWord === 'thin' || targetWord === 'this' || targetWord === 'she') {
            wrongIdx = 0 // Consonant error
          } else if (targetWord === 'day') {
            wrongIdx = 1 // Diphthong error
          }
          break
        }
      }

      // Record the mistake in the learner's bank (for later drill).
      if (calculatedScore < 85) {
        const ruleIds = applyInterference(active.targetPhonetic, nativeLang).hits.map((h) => h.id)
        const sound = active.sound.replace(/\//g, '')
        recordMistake({ word: active.targetWord, sound, nativeLang, ruleIds })
        syncEvent('mistake', {
          word: active.targetWord,
          sound,
          score: calculatedScore,
          heard: result.heardPhonemes.join(''),
          ruleIds,
        })
      }

      // If score is low and we don't have a specific override, assume the main target phoneme is wrong
      if (calculatedScore < 70 && wrongIdx === null) {
        wrongIdx = (targetWord === 'sheep' || targetWord === 'ship' || targetWord === 'cat' || targetWord === 'day') ? 1 : 0
      }

      setScore(calculatedScore)
      setWrongSegmentIdx(wrongIdx)

      // Set feedback text
      if (calculatedScore >= 85) {
        setFeedback(t.pbExcellentFeedback)
        setWrongSegmentIdx(null) // Clear errors if overall score is excellent
        if (calculatedScore > 90) setScore(100)
      } else if (customAdvice) {
        setFeedback(customAdvice)
      } else if (calculatedScore >= 50) {
        setFeedback(fmt(t.pbGoodFeedback, { score: calculatedScore }))
      } else {
        setFeedback(fmt(t.pbLowFeedback, { score: calculatedScore }))
      }
    } else {
      setScore(null)
      setTranscription('')
      setFeedback('')
      setWrongSegmentIdx(null)
      await start()
    }
  }

  // Vocal tract morphing states
  const getAnatomyPaths = (state: string) => {
    let tonguePath = ''
    let lowerLipPath = ''
    let isVibrating = false
    let airFlowD = ''

    switch (state) {
      case 'long-e':
        tonguePath = 'M 98,160 Q 110,122 135,115 Q 170,118 180,220 L 98,220 Z'
        lowerLipPath = 'M 58,150 Q 82,150 92,143'
        airFlowD = 'M 175,180 Q 150,135 125,130 Q 100,128 75,128'
        break
      case 'short-i':
        tonguePath = 'M 98,160 Q 115,132 138,124 Q 170,125 180,220 L 98,220 Z'
        lowerLipPath = 'M 58,154 Q 82,154 92,146'
        airFlowD = 'M 175,180 Q 150,140 128,135 Q 100,132 75,132'
        break
      case 'flat-a':
        tonguePath = 'M 92,175 Q 120,178 145,165 Q 170,162 180,220 L 92,220 Z'
        lowerLipPath = 'M 52,174 Q 78,174 88,162'
        airFlowD = 'M 175,180 Q 145,170 120,165 Q 90,160 70,160'
        break
      case 'theta':
        tonguePath = 'M 90,132 Q 105,138 135,142 Q 170,146 180,220 L 90,220 Z'
        lowerLipPath = 'M 58,158 Q 82,158 92,150'
        airFlowD = 'M 175,180 Q 150,148 118,142 Q 88,132 70,130'
        break
      case 'eth':
        tonguePath = 'M 90,132 Q 105,138 135,142 Q 170,146 180,220 L 90,220 Z'
        lowerLipPath = 'M 58,158 Q 82,158 92,150'
        airFlowD = 'M 175,180 Q 150,148 118,142 Q 88,132 70,130'
        isVibrating = true
        break
      case 'diphthong-ei':
        tonguePath = 'M 98,160 Q 112,128 136,120 Q 170,121 180,220 L 98,220 Z'
        lowerLipPath = 'M 58,152 Q 82,152 92,145'
        airFlowD = 'M 175,180 Q 150,138 126,132 Q 100,130 75,130'
        break
      case 'sh-sound':
        tonguePath = 'M 98,160 Q 124,124 142,128 Q 170,135 180,220 L 98,220 Z'
        lowerLipPath = 'M 54,158 Q 78,158 88,148'
        airFlowD = 'M 175,180 Q 148,140 120,134 Q 95,134 72,134'
        break
      default:
        tonguePath = 'M 98,160 Q 120,160 145,150 Q 170,145 180,220 L 98,220 Z'
        lowerLipPath = 'M 58,155 Q 82,155 92,147'
        airFlowD = 'M 175,180 L 75,135'
    }

    return { tonguePath, lowerLipPath, isVibrating, airFlowD }
  }

  // Prioritize preview selections from the IPA soundboard over the active practice sound
  const activeState = previewAnatomyState || active.anatomyState
  const { tonguePath, lowerLipPath, isVibrating, airFlowD } = getAnatomyPaths(activeState)

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3 overflow-hidden">
      {/* Sound Selection Carousel/Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {PHONETIC_DATA.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={cn(
              'doodle-btn px-4 py-2 text-sm whitespace-nowrap transition-all',
              selectedIndex === idx
                ? 'bg-[var(--color-mint)] text-[var(--color-ink)] translate-x-[1px] translate-y-[1px] shadow-[2px_3px_0_0_var(--color-ink)]'
                : 'bg-white text-[var(--color-muted-warm)] doodle-shadow-sm hover:-translate-y-0.5'
            )}
          >
            <span className="font-black text-base mr-1">{item.sound}</span>
            <span className="text-xs font-bold opacity-80">{item.symbol}</span>
          </button>
        ))}
      </div>

      {/* Main Board Panel */}
      <div className="grid min-h-0 gap-4 overflow-hidden lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT PANEL: Guide & Anatomy Animator */}
        <div className="flex flex-col gap-4 overflow-y-auto rounded-[2rem] border-[3px] border-[var(--color-ink)] bg-white p-5 doodle-shadow">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-[var(--color-mint)]">{active.sound}</span>
              <span className="rounded-full bg-[var(--color-mint-soft)] px-3 py-1 text-xs font-extrabold text-[var(--color-warm-text)] doodle-outline">
                {active.symbol}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {previewLabel ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 text-xs font-black text-[var(--color-grape)] bg-[var(--color-grape-soft)] px-3 py-1 rounded-full doodle-outline w-fit flex items-center gap-1"
                >
                  <Info className="size-3" /> {t.pbPreviewLabel}: {previewLabel}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <p className="mt-3 text-sm font-bold text-[var(--color-muted-warm)] leading-relaxed">
              {active.desc}
            </p>
          </div>

          {/* SVG ANATOMY ARTWORK */}
          <div className="relative mx-auto mt-auto mb-auto flex aspect-[4/3] w-full max-w-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-ink)]/20 bg-[var(--color-cloud)] p-3">
            <svg
              viewBox="0 0 260 220"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Vocal tract outer wall (Static) */}
              <path
                d="M 120,30 Q 155,25 185,45 Q 215,65 215,110 L 215,210"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Palate roof / Back of throat (Static) */}
              <path
                d="M 98,95 Q 120,85 150,85 Q 185,90 185,130 L 185,210"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Upper Lip (Static) */}
              <path
                d="M 58,92 Q 82,92 92,100"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Upper Teeth (Static) */}
              <path
                d="M 92,100 L 92,108 L 88,108 L 88,100 Z"
                fill="white"
                stroke="var(--color-ink)"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Tongue (DYNAMICALLY MORPHED) */}
              <path
                d={tonguePath}
                fill="var(--color-peach-soft)"
                stroke="var(--color-ink)"
                strokeWidth="5"
                strokeLinejoin="round"
                style={{ transition: 'd 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Lower Teeth (Static relative to lower jaw) */}
              <path
                d="M 92,138 L 92,146 L 88,146 L 88,138 Z"
                fill="white"
                stroke="var(--color-ink)"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Lower Lip / Jaw (DYNAMICALLY MORPHED) */}
              <path
                d={lowerLipPath}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="5"
                strokeLinecap="round"
                style={{ transition: 'd 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Voice vibration waves (Only visible on voiced sounds) */}
              {isVibrating && (
                <g stroke="var(--color-bubblegum)" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M 175,190 Q 180,193 185,190" className="animate-pulse" />
                  <path d="M 172,197 Q 180,200 188,197" className="animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <path d="M 175,204 Q 180,207 185,204" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                </g>
              )}

              {/* Airflow flow line */}
              <path
                d={airFlowD}
                fill="none"
                stroke="var(--color-mint)"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-[dash_1.5s_linear_infinite]"
                style={{ transition: 'd 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>

            {/* Indicator label */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-extrabold text-[var(--color-muted-warm)] bg-white px-2 py-0.5 rounded-full doodle-outline">
              <Info className="size-3 text-[var(--color-mint)]" /> {t.pbMouthProfile}
            </div>
          </div>

          {/* DIALECT LENS */}
          <DialectLens word={active.targetWord} ipa={active.targetPhonetic} nativeLang={nativeLang} />

          {/* MISTAKE BANK */}
          <MistakeBankPanel />
        </div>

        {/* RIGHT PANEL: Practice & Pronunciation Scorer + IPA Soundboard */}
        <div className="flex flex-col gap-4 overflow-y-auto rounded-[2rem] border-[3px] border-[var(--color-ink)] bg-white p-5 doodle-shadow">

          {/* IPA KEYBOARD / SOUNDBOARD (COLLAPSIBLE) */}
          <div className="rounded-2xl border-[3px] border-[var(--color-ink)] bg-white p-3 shadow-[2px_3px_0_0_var(--color-ink)]">
            <button
              onClick={() => setShowSoundboard(!showSoundboard)}
              className="flex w-full items-center justify-between font-black text-sm text-[var(--color-ink)] outline-none"
            >
              <span className="flex items-center gap-1.5">{t.pbSoundboard}</span>
              {showSoundboard ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>

            <AnimatePresence>
              {showSoundboard && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-3 overflow-hidden border-t-2 border-dashed border-[var(--color-ink)]/10 pt-3"
                >
                  {/* Vowels */}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)] mb-1">{t.pbVowels}</h5>
                    <div className="grid grid-cols-4 gap-1.5">
                      {IPA_VOWELS.map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => {
                            setPreviewAnatomyState(item.anatomyState)
                            setPreviewLabel(`${item.symbol} ("${item.word}")`)
                            playTTS(item.word, 'en-US', false)
                          }}
                          className="px-1 py-1.5 bg-[var(--color-mint-soft)] hover:bg-[var(--color-mint)] active:translate-y-px rounded-xl border-2 border-[var(--color-ink)] text-center transition-all outline-none"
                        >
                          <div className="text-sm font-black text-[var(--color-ink)]">{item.symbol}</div>
                          <div className="text-[9px] font-bold text-[var(--color-muted-warm)] truncate">{item.word}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diphthongs */}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)] mb-1">{t.pbDiphthongs}</h5>
                    <div className="grid grid-cols-4 gap-1.5">
                      {IPA_DIPHTHONGS.map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => {
                            setPreviewAnatomyState(item.anatomyState)
                            setPreviewLabel(`${item.symbol} ("${item.word}")`)
                            playTTS(item.word, 'en-US', false)
                          }}
                          className="px-1 py-1.5 bg-[var(--color-sky-soft)] hover:bg-[var(--color-sky)] active:translate-y-px rounded-xl border-2 border-[var(--color-ink)] text-center transition-all outline-none"
                        >
                          <div className="text-sm font-black text-[var(--color-ink)]">{item.symbol}</div>
                          <div className="text-[9px] font-bold text-[var(--color-muted-warm)] truncate">{item.word}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Consonants */}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-warm)] mb-1">{t.pbConsonants}</h5>
                    <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                      {IPA_CONSONANTS.map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => {
                            setPreviewAnatomyState(item.anatomyState)
                            setPreviewLabel(`${item.symbol} ("${item.word}")`)
                            playTTS(item.word, 'en-US', false)
                          }}
                          className="px-1 py-1.5 bg-[var(--color-peach-soft)] hover:bg-[var(--color-peach)] active:translate-y-px rounded-xl border-2 border-[var(--color-ink)] text-center transition-all outline-none"
                        >
                          <div className="text-sm font-black text-[var(--color-ink)]">{item.symbol}</div>
                          <div className="text-[9px] font-bold text-[var(--color-muted-warm)] truncate">{item.word}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD: Target Word with highlights */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border-[3px] border-[var(--color-ink)] bg-[var(--color-mint-soft)] p-4 doodle-shadow-sm">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{t.pbTargetWord}</span>
              <h4 className="text-3xl font-black text-[var(--color-ink)] mt-0.5 flex gap-0.5">
                {TARGET_WORD_SEGMENTS[active.targetWord]?.map((seg, sIdx) => {
                  return (
                    <span
                      key={sIdx}
                      className={cn(
                        seg.isTargetPhonetic && "underline decoration-dashed decoration-[3px] underline-offset-4 decoration-[var(--color-grape)]"
                      )}
                    >
                      {seg.text}
                    </span>
                  )
                }) ?? active.targetWord}
              </h4>
              <p className="text-sm font-bold text-[var(--color-muted-warm)] mt-1">{active.targetPhonetic}</p>
            </div>
            <button
              onClick={() => playTTS(active.targetWord, 'en-US', true)}
              disabled={isPlayingTarget}
              className={cn(
                'doodle-btn grid size-12 place-items-center bg-white',
                isPlayingTarget && 'bg-[var(--color-mint)]'
              )}
            >
              {isPlayingTarget ? <Loader2 className="size-5 animate-spin" /> : <Volume2 className="size-5" />}
            </button>
          </div>

          {/* CARD: Contrast / Comparison Word */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border-[3px] border-[var(--color-ink)] bg-[var(--color-cloud)] p-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--color-muted-warm)]">{t.pbCompareWith}</span>
              <h4 className="text-2xl font-black text-[var(--color-ink)] mt-0.5">{active.contrastWord}</h4>
              <p className="text-sm font-bold text-[var(--color-muted-warm)] mt-1">{active.contrastPhonetic}</p>
            </div>
            <button
              onClick={() => playTTS(active.contrastWord, 'en-US', false)}
              disabled={isPlayingContrast}
              className={cn(
                'doodle-btn grid size-11 place-items-center bg-white',
                isPlayingContrast && 'bg-[var(--color-sky)]'
              )}
            >
              {isPlayingContrast ? <Loader2 className="size-4 animate-spin" /> : <Volume2 className="size-4" />}
            </button>
          </div>

          {/* RECORDING CONTROL PANEL with Visualizer */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border-[3px] border-[var(--color-ink)] p-4 bg-[var(--color-cloud)]">
            <button
              onClick={handleRecord}
              disabled={transcribing}
              className={cn(
                'doodle-btn flex items-center justify-center gap-2 px-6 py-3 font-extrabold text-white w-full transition-transform',
                recording ? 'bg-[var(--color-bubblegum)]' : 'bg-[var(--color-grape)]'
              )}
            >
              {transcribing ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> {t.pbAnalyzing}
                </>
              ) : recording ? (
                <>
                  <Square className="size-5 fill-current" /> {t.pbDoneScore}
                </>
              ) : (
                <>
                  <Mic className="size-5" /> {t.pbStartSpeaking}
                </>
              )}
            </button>

            {/* AUDIO WAVEFORM VISUALIZER */}
            {recording && (
              <div className="flex flex-col items-center gap-1.5 w-full">
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
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-[var(--color-bubblegum)] animate-pulse">● {t.pbRecordingHint} "{active.targetWord}"</p>
              </div>
            )}
          </div>

          {/* SCORING & PHONETIC ERROR HIGHLIGHTS PANEL */}
          <AnimatePresence>
            {score !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-3 rounded-2xl border-[3px] border-[var(--color-ink)] p-4 bg-white doodle-shadow-sm animate-pop"
              >
                <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--color-ink)]/15 pb-3">
                  <div>
                    <span className="text-xs font-black text-[var(--color-muted-warm)]">{t.pbDetectedWord}</span>
                    <p className="text-lg font-black text-[var(--color-ink)] mt-0.5">"{transcription}"</p>
                    {heardPhonemes && (
                      <p className="text-xs font-bold text-[var(--color-grape)] mt-0.5">
                        {heardPhonemes} <span className="text-[var(--color-muted-warm)]">vs {active.targetPhonetic}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--color-muted-warm)]">{t.pbScore}</span>
                    <div
                      className={cn(
                        'grid size-12 place-items-center rounded-full border-[3px] border-[var(--color-ink)] font-black text-lg text-white shadow-[1px_2px_0_0_var(--color-ink)]',
                        score >= 85
                          ? 'bg-[var(--color-mint)] text-[var(--color-ink)]'
                          : score >= 50
                            ? 'bg-[var(--color-lemon)] text-[var(--color-ink)]'
                            : 'bg-[var(--color-bubblegum)] text-white'
                      )}
                    >
                      {score}
                    </div>
                  </div>
                </div>

                {/* Phoneme Highlight Section */}
                <div className="flex flex-col gap-1 border-b-2 border-dashed border-[var(--color-ink)]/15 pb-3">
                  <span className="text-xs font-black text-[var(--color-muted-warm)]">{t.pbPhonemeResult}</span>
                  <div className="flex gap-1.5 text-2xl font-black mt-1">
                    {TARGET_WORD_SEGMENTS[active.targetWord]?.map((seg, sIdx) => {
                      const isWrong = wrongSegmentIdx === sIdx
                      return (
                        <span
                          key={sIdx}
                          className={cn(
                            'px-2 py-0.5 rounded-lg border-2 border-[var(--color-ink)] transition-all text-sm uppercase',
                            isWrong
                              ? 'bg-[var(--color-bubblegum-soft)] text-[var(--color-bubblegum)] border-[var(--color-bubblegum)] shadow-[1px_2px_0_0_var(--color-bubblegum)]'
                              : 'bg-[var(--color-mint-soft)] text-[var(--color-mint)] border-[var(--color-mint)] shadow-[1px_2px_0_0_var(--color-mint)]'
                          )}
                        >
                          {seg.text}
                        </span>
                      )
                    }) ?? <span className="text-red-500">{active.targetWord}</span>}
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  {score >= 85 ? (
                    <CheckCircle className="size-5 text-[var(--color-mint)] shrink-0 mt-0.5" strokeWidth={3} />
                  ) : (
                    <AlertTriangle className="size-5 text-[var(--color-bubblegum)] shrink-0 mt-0.5" strokeWidth={3} />
                  )}
                  <p className="text-sm font-bold text-[var(--color-warm-text)] leading-relaxed">
                    {feedback}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  )
}
