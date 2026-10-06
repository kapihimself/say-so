/**
 * Mouth-shape model ported from the Rhubarb Lip Sync mouth taxonomy
 * (DanielSWolf/rhubarb-lip-sync, MIT). The six basic Hanna-Barbera shapes
 * (A–F) plus the three optional extended shapes (G, H, X) are the de-facto
 * standard for 2D/3D speech animation.
 *
 * Here we map IPA phonemes to those shapes and expose numeric mouth
 * parameters so a mesh can be morphed smoothly between them.
 */

export type Viseme = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X'

export type MouthParams = {
  /** vertical opening, 0 = closed */
  open: number
  /** horizontal spread, 0 = neutral, 1 = wide smile */
  wide: number
  /** lip rounding / puckering, 0 = neutral, 1 = tight O */
  round: number
  /** upper teeth visible on lower lip (F/V) */
  teethOnLip: number
  /** tongue visible (L / TH) */
  tongue: number
}

export const VISEME_PARAMS: Record<Viseme, MouthParams> = {
  // A — closed for P, B, M
  A: { open: 0.02, wide: 0.15, round: 0.05, teethOnLip: 0, tongue: 0 },
  // B — slightly open, clenched teeth (most consonants, EE)
  B: { open: 0.28, wide: 0.55, round: 0.05, teethOnLip: 0, tongue: 0 },
  // C — open (EH, AE) and the in-between from A/B to D
  C: { open: 0.55, wide: 0.4, round: 0.05, teethOnLip: 0, tongue: 0 },
  // D — wide open (AA)
  D: { open: 0.95, wide: 0.35, round: 0.05, teethOnLip: 0, tongue: 0.1 },
  // E — slightly rounded (AO, ER)
  E: { open: 0.5, wide: 0.1, round: 0.45, teethOnLip: 0, tongue: 0 },
  // F — puckered (UW, OW, W)
  F: { open: 0.35, wide: 0.05, round: 0.95, teethOnLip: 0, tongue: 0 },
  // G — F / V, upper teeth on lower lip
  G: { open: 0.25, wide: 0.35, round: 0.05, teethOnLip: 1, tongue: 0 },
  // H — long L, tongue raised
  H: { open: 0.55, wide: 0.3, round: 0.05, teethOnLip: 0, tongue: 0.9 },
  // X — rest / silence
  X: { open: 0.06, wide: 0.2, round: 0.05, teethOnLip: 0, tongue: 0 },
}

// IPA (and common ASCII approximations) -> Rhubarb mouth shape.
const IPA_TO_VISEME: Record<string, Viseme> = {
  // plosives / nasals with lip closure
  p: 'A', b: 'A', m: 'A',
  // F / V extended shape
  f: 'G', v: 'G',
  // rounded / puckered
  u: 'F', 'uː': 'F', ʊ: 'F', w: 'F', o: 'F', 'oʊ': 'F', 'ɔɪ': 'E', ɔ: 'E', 'ɔː': 'E', 'əʊ': 'E',
  // mid / open vowels
  e: 'C', 'eɪ': 'C', æ: 'C', ɛ: 'C', ə: 'C', ɜ: 'E', 'ɜː': 'E', ʌ: 'C',
  // wide open
  a: 'D', 'aɪ': 'D', 'aʊ': 'D', ɑ: 'D', 'ɑː': 'D',
  // tongue visible
  l: 'H', θ: 'H', ð: 'H',
  // close front — clenched teeth
  i: 'B', 'iː': 'B', ɪ: 'B', j: 'B',
  // everything else falls back to the clenched-teeth consonant shape
}

export function phonemeToViseme(phoneme: string): Viseme {
  const key = phoneme.toLowerCase().replace(/[/ˈˌː]/g, '')
  if (IPA_TO_VISEME[key]) return IPA_TO_VISEME[key]
  // try without the length mark
  const stripped = key.replace(/ː/g, '')
  if (IPA_TO_VISEME[stripped]) return IPA_TO_VISEME[stripped]
  return 'B'
}

// Rough grapheme->viseme for driving idle lip-flap when we only have text.
const GRAPHEME_TO_VISEME: Record<string, Viseme> = {
  a: 'D', e: 'C', i: 'B', o: 'F', u: 'F', y: 'B',
  b: 'A', p: 'A', m: 'A',
  f: 'G', v: 'G',
  w: 'F', r: 'E',
  l: 'H', t: 'H', d: 'H', n: 'H', s: 'H', z: 'H', c: 'H', k: 'H', g: 'H', j: 'H', q: 'H', x: 'H', h: 'H',
}

export function textToVisemeSequence(text: string): Viseme[] {
  const out: Viseme[] = []
  for (const ch of text.toLowerCase()) {
    if (ch === ' ') {
      out.push('X')
      continue
    }
    if (GRAPHEME_TO_VISEME[ch]) out.push(GRAPHEME_TO_VISEME[ch])
  }
  return out.length ? out : ['X']
}

/** Blend two mouth parameter sets. t=0 -> a, t=1 -> b */
export function blendMouth(a: MouthParams, b: MouthParams, t: number): MouthParams {
  const k = Math.max(0, Math.min(1, t))
  return {
    open: a.open + (b.open - a.open) * k,
    wide: a.wide + (b.wide - a.wide) * k,
    round: a.round + (b.round - a.round) * k,
    teethOnLip: a.teethOnLip + (b.teethOnLip - a.teethOnLip) * k,
    tongue: a.tongue + (b.tongue - a.tongue) * k,
  }
}
