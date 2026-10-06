import { LEXICON } from './lexicon'

/**
 * Offline English grapheme-to-phoneme, used for phoneme-level pronunciation
 * scoring and the "pronounce anything" input.
 *
 * Accuracy tiers:
 *  1. LEXICON (287 words) — exact, from the CMU Pronouncing Dictionary.
 *  2. Lazy-loaded full CMUdict (/cmudict-ipa.json) — exact, for any word.
 *  3. Rule-based fallback — approximate, for out-of-vocabulary words.
 */

// Non-words that appear as test items / mispronunciation targets.
const EXCEPTIONS: Record<string, string> = {
  ket: 'k e t',
  zis: 'z ɪ s',
  yob: 'j ɒ b',
  dis: 'd ɪ s',
  de: 'd e',
}

// Longest-match grapheme → IPA rules (checked longest first).
const RULES: [string, string][] = [
  ['eigh', 'eɪ'], ['ough', 'ɔː'], ['tion', 'ʃ ə n'], ['sion', 'ʒ ə n'],
  ['igh', 'aɪ'], ['air', 'eə'], ['ear', 'ɪə'], ['eer', 'ɪə'], ['oor', 'ɔː'], ['our', 'ɔː'],
  ['ure', 'ʊə'], ['tch', 'tʃ'], ['dge', 'dʒ'],
  ['sh', 'ʃ'], ['ch', 'tʃ'], ['ph', 'f'], ['wh', 'w'], ['ck', 'k'], ['ng', 'ŋ'],
  ['qu', 'k w'], ['th', 'θ'], ['gh', ''], ['ee', 'iː'], ['oo', 'uː'], ['ea', 'iː'],
  ['ai', 'eɪ'], ['ay', 'eɪ'], ['oa', 'oʊ'], ['oe', 'oʊ'], ['ou', 'aʊ'], ['ow', 'aʊ'],
  ['oi', 'ɔɪ'], ['oy', 'ɔɪ'], ['au', 'ɔː'], ['aw', 'ɔː'], ['ew', 'uː'], ['er', 'ɜː'],
  ['ir', 'ɜː'], ['ur', 'ɜː'], ['ar', 'ɑː'], ['or', 'ɔː'], ['ie', 'iː'], ['ei', 'eɪ'], ['ey', 'eɪ'],
  ['a', 'æ'], ['e', 'e'], ['i', 'ɪ'], ['o', 'ɒ'], ['u', 'ʌ'], ['y', 'i'],
  ['b', 'b'], ['c', 'k'], ['d', 'd'], ['f', 'f'], ['g', 'ɡ'], ['h', 'h'], ['j', 'dʒ'],
  ['k', 'k'], ['l', 'l'], ['m', 'm'], ['n', 'n'], ['p', 'p'], ['q', 'k'], ['r', 'r'],
  ['s', 's'], ['t', 't'], ['v', 'v'], ['w', 'w'], ['x', 'k s'], ['z', 'z'],
]
const CONSONANT_LETTERS = new Set('bcdfghjklmnpqrstvwxz')
const KEEP_FINAL_E = new Set(['he', 'she', 'be', 'the', 'me', 'we', 'ye'])

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, '').replace(/^'+|'+$/g, '')
}

function ruleG2P(word: string): string[] {
  const w = word
  const out: string[] = []
  let i = 0
  while (i < w.length) {
    // silent final "e"
    if (w[i] === 'e' && i === w.length - 1 && w.length > 3 && !KEEP_FINAL_E.has(w) && CONSONANT_LETTERS.has(w[i - 1])) {
      i += 1
      continue
    }
    let matched = false
    for (const [g, p] of RULES) {
      if (g.length > 1 && w.startsWith(g, i)) {
        if (p) out.push(...p.split(' '))
        i += g.length
        matched = true
        break
      }
    }
    if (matched) continue
    for (const [g, p] of RULES) {
      if (g.length === 1 && w[i] === g) {
        if (p) out.push(p)
        i += 1
        matched = true
        break
      }
    }
    if (!matched) i += 1
  }
  return out
}

let fullDict: Record<string, string> | null = null

/** Lazily load the full CMUdict (IPA) for "pronounce anything". Cached. */
export async function loadFullDict(): Promise<void> {
  if (fullDict || typeof window === 'undefined') return
  try {
    const res = await fetch('/cmudict-ipa.json')
    if (res.ok) fullDict = (await res.json()) as Record<string, string>
  } catch {
    /* offline: rule fallback still works */
  }
}

export function wordToPhonemes(word: string): string[] {
  const w = normalizeWord(word)
  if (!w) return []
  const hit = fullDict?.[w] ?? LEXICON[w] ?? EXCEPTIONS[w]
  if (hit) return hit.split(' ')
  return ruleG2P(w)
}

export function phonemesToString(phones: string[]): string {
  return `/${phones.join('')}/`
}

/** Levenshtein distance over phoneme tokens. */
export function phonemeDistance(a: string[], b: string[]): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j])
    }
  }
  return dp[m][n]
}

export type PhonemeOp = { type: 'match' | 'sub' | 'ins' | 'del'; a?: number; b?: number }

/** Alignment ops between target (a) and hypothesis (b) phonemes. */
export function alignPhonemes(a: string[], b: string[]): PhonemeOp[] {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j])
    }
  }
  const ops: PhonemeOp[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      ops.unshift({ type: 'match', a: i - 1, b: j - 1 })
      i--; j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.unshift({ type: 'sub', a: i - 1, b: j - 1 })
      i--; j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.unshift({ type: 'del', a: i - 1 })
      i--
    } else {
      ops.unshift({ type: 'ins', b: j - 1 })
      j--
    }
  }
  return ops
}

export type PhraseScore = {
  score: number
  targetPhonemes: string[]
  heardPhonemes: string[]
  /** index in the heard transcript that was used */
  matchedWord: string
  ops: PhonemeOp[]
}

/** Pick the transcript word whose phonemes are closest to the target word. */
function bestTranscriptWord(transcript: string, targetPhones: string[]): { word: string; phones: string[]; dist: number } {
  const candidates = transcript.split(/\s+/).map(normalizeWord).filter(Boolean)
  let best = { word: '', phones: [] as string[], dist: Infinity }
  for (const c of candidates) {
    const ph = wordToPhonemes(c)
    const d = phonemeDistance(targetPhones, ph)
    if (d < best.dist) best = { word: c, phones: ph, dist: d }
  }
  return best
}

/**
 * Phoneme-level pronunciation score for a target word against a transcript.
 * This replaces orthographic word-matching: it actually compares the sounds.
 */
export function scorePronunciation(targetWord: string, transcript: string): PhraseScore {
  const targetPhonemes = wordToPhonemes(targetWord)
  const best = bestTranscriptWord(transcript, targetPhonemes)
  const heardPhonemes = best.phones
  const ops = alignPhonemes(targetPhonemes, heardPhonemes)
  const maxLen = Math.max(targetPhonemes.length, heardPhonemes.length) || 1
  const dist = best.dist === Infinity ? maxLen : best.dist
  let score = Math.round((1 - dist / maxLen) * 100)
  if (targetPhonemes.length && heardPhonemes.length && dist === 0) score = 100
  return {
    score: Math.max(0, Math.min(100, score)),
    targetPhonemes,
    heardPhonemes,
    matchedWord: best.word,
    ops,
  }
}

/** Map a mismatching target-phoneme index to an orthographic segment index. */
export function phonemeIndexToSegment(
  phonemeIndex: number,
  phonemeCount: number,
  segmentCount: number
): number {
  if (segmentCount <= 1 || phonemeCount <= 0) return 0
  const per = phonemeCount / segmentCount
  return Math.min(segmentCount - 1, Math.floor(phonemeIndex / per))
}
