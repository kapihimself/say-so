import { describe, it, expect } from 'vitest'
import {
  wordToPhonemes,
  phonemeDistance,
  scorePronunciation,
  phonemeIndexToSegment,
  alignPhonemes,
} from './g2p'

describe('wordToPhonemes', () => {
  it('uses the exact CMU lexicon for known words', () => {
    expect(wordToPhonemes('sheep')).toEqual(['ʃ', 'iː', 'p'])
    expect(wordToPhonemes('ship')).toEqual(['ʃ', 'ɪ', 'p'])
    expect(wordToPhonemes('thin')).toEqual(['θ', 'ɪ', 'n'])
  })

  it('handles capitalisation and punctuation', () => {
    expect(wordToPhonemes('Sheep!')).toEqual(wordToPhonemes('sheep'))
  })

  it('falls back to rules for out-of-vocabulary words', () => {
    const ph = wordToPhonemes('zzqwitzz')
    expect(Array.isArray(ph)).toBe(true)
  })
})

describe('phonemeDistance', () => {
  it('is zero for identical sequences', () => {
    expect(phonemeDistance(['ʃ', 'iː', 'p'], ['ʃ', 'iː', 'p'])).toBe(0)
  })

  it('counts a single vowel substitution', () => {
    expect(phonemeDistance(['ʃ', 'iː', 'p'], ['ʃ', 'ɪ', 'p'])).toBe(1)
  })
})

describe('scorePronunciation', () => {
  it('scores an exact match 100', () => {
    expect(scorePronunciation('sheep', 'sheep').score).toBe(100)
  })

  it('penalises the ship/sheep vowel confusion', () => {
    const s = scorePronunciation('sheep', 'ship').score
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThan(85)
  })

  it('scores a totally different word low', () => {
    expect(scorePronunciation('sheep', 'banana').score).toBeLessThan(50)
  })

  it('finds the target inside a longer transcript', () => {
    const r = scorePronunciation('sheep', 'a sheep')
    expect(r.score).toBe(100)
    expect(r.matchedWord).toBe('sheep')
  })
})

describe('alignPhonemes / phonemeIndexToSegment', () => {
  it('reports a substitution at the right target index', () => {
    const ops = alignPhonemes(['ʃ', 'iː', 'p'], ['ʃ', 'ɪ', 'p'])
    const bad = ops.find((o) => o.type !== 'match')
    expect(bad?.a).toBe(1)
  })

  it('maps a mismatch to the vowel segment of "sheep"', () => {
    expect(phonemeIndexToSegment(1, 3, 3)).toBe(1)
    expect(phonemeIndexToSegment(0, 3, 3)).toBe(0)
    expect(phonemeIndexToSegment(2, 3, 3)).toBe(2)
  })
})
