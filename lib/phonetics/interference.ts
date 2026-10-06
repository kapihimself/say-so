/**
 * Contrastive-phonology engine — the "Listener / Lens" idea applied to our app.
 *
 * Given an English word's IPA and a learner's native language, we model how a
 * speaker of that language is likely to *hear* and *reproduce* the word, using
 * documented L1-interference rules. Output:
 *   - approxIpa:  the approximated pronunciation in the learner's phonology
 *   - respelling: an L1-friendly spelling we can feed to the L1 TTS voice,
 *                 producing an audible "accented" rendering
 *   - hits:       the rules that fired, for the evidence receipt
 *
 * This is an evidence-informed approximation, not a claim about any individual
 * speaker's perception. Rules are cited to standard contrastive-phonology
 * literature (e.g. Swan & Smith, "Learner English"; Avery & Ehrlich).
 */

import type { NativeLang } from '@/lib/store/appStore'

type L10n = Record<NativeLang, string>

export type InterferenceRule = {
  id: string
  name: L10n
  desc: L10n
  apply: (phones: string[]) => { phones: string[]; changed: boolean }
}

export type RuleHit = { id: string; name: L10n; desc: L10n; ref: string }

export type InterferenceResult = {
  approxIpa: string
  respelling: string
  hits: RuleHit[]
}

// ---- IPA tokenizer -------------------------------------------------------

const IPA_INVENTORY = [
  'tʃ', 'dʒ', 'iː', 'uː', 'ɑː', 'ɔː', 'ɜː', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ', 'ɪə', 'eə', 'ʊə',
  'p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'm', 'n', 'ŋ',
  'l', 'r', 'w', 'j', 'i', 'ɪ', 'e', 'æ', 'a', 'ʌ', 'ə', 'ɜ', 'ɒ', 'ɔ', 'ʊ', 'u', 'ɑ',
]

export function tokenizeIPA(ipa: string): string[] {
  // Canonicalise: the G2P lexicon uses script-g (U+0261) while our rule tables
  // use ASCII "g", so normalise to ASCII before tokenising.
  const clean = ipa.replace(/[/\[\]]/g, '').replace(/ɡ/g, 'g').trim()
  const tokens: string[] = []
  let i = 0
  while (i < clean.length) {
    let matched = ''
    for (const sym of IPA_INVENTORY) {
      if (clean.startsWith(sym, i) && sym.length > matched.length) matched = sym
    }
    if (matched) {
      tokens.push(matched)
      i += matched.length
    } else {
      tokens.push(clean[i])
      i += 1
    }
  }
  return tokens
}

// ---- Shared helpers ------------------------------------------------------

const VOWELS = new Set([
  'iː', 'i', 'ɪ', 'e', 'æ', 'a', 'ʌ', 'ə', 'ɜ', 'ɜː', 'ɒ', 'ɔ', 'ɔː', 'ʊ', 'u', 'uː', 'ɑ', 'ɑː',
  'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ', 'ɪə', 'eə', 'ʊə',
])

const isVowel = (p: string) => VOWELS.has(p)

/** Replace every token found in `map`. */
function replaceAll(phones: string[], map: Record<string, string>): { phones: string[]; changed: boolean } {
  let changed = false
  const out = phones.map((p) => {
    if (map[p] !== undefined && map[p] !== p) {
      changed = true
      return map[p]
    }
    return p
  })
  return { phones: out, changed }
}

/** Devoice the final obstruent of the word. */
function devoiceFinal(phones: string[], pairs: Record<string, string>): { phones: string[]; changed: boolean } {
  const out = [...phones]
  const last = out[out.length - 1]
  if (last && pairs[last]) {
    out[out.length - 1] = pairs[last]
    return { phones: out, changed: true }
  }
  return { phones: out, changed: false }
}

/** Insert a vowel before a word-initial s + consonant cluster. */
function prothesis(phones: string[], vowel: string): { phones: string[]; changed: boolean } {
  if (phones[0] === 's' && phones[1] && !isVowel(phones[1])) {
    return { phones: [vowel, ...phones], changed: true }
  }
  return { phones, changed: false }
}

// ---- Rule sets -----------------------------------------------------------

const SPANISH_RULES: InterferenceRule[] = [
  {
    id: 'es_v_b',
    name: { id: 'V ↔ B menyatu', es: 'Fusión V/B', pt: 'Fusão V/B' },
    desc: {
      id: 'Bahasa Spanyol tidak membedakan bunyi /v/ dan /b/; keduanya diucapkan /b/.',
      es: 'El español no distingue /v/ de /b/; ambos se pronuncian /b/.',
      pt: 'O espanhol não distingue /v/ de /b/; ambos soam /b/.',
    },
    apply: (p) => replaceAll(p, { v: 'b' }),
  },
  {
    id: 'es_lax',
    name: { id: 'Vokal tegang ↔ rileks', es: 'Vocales tensas/relajadas', pt: 'Vogais tensas/relaxadas' },
    desc: {
      id: 'Spanyol hanya punya satu vokal "i" dan "u", sehingga /ɪ/→/i/ dan /ʊ/→/u/.',
      es: 'El español solo tiene una "i" y una "u", así que /ɪ/→/i/ y /ʊ/→/u/.',
      pt: 'O espanhol só tem um "i" e um "u", então /ɪ/→/i/ e /ʊ/→/u/.',
    },
    apply: (p) => replaceAll(p, { 'ɪ': 'i', 'ʊ': 'u' }),
  },
  {
    id: 'es_open_vowels',
    name: { id: 'Vokal terbuka diratakan', es: 'Vocales abiertas', pt: 'Vogais abertas' },
    desc: {
      id: 'Vokal /æ/, /ʌ/, /ə/, /ɑː/ semuanya mendekati /a/ dalam bahasa Spanyol.',
      es: 'Las vocales /æ/, /ʌ/, /ə/, /ɑː/ tienden a /a/ en español.',
      pt: 'As vogais /æ/, /ʌ/, /ə/, /ɑː/ tendem a /a/ em espanhol.',
    },
    apply: (p) => replaceAll(p, { æ: 'a', ʌ: 'a', ə: 'a', 'ɑː': 'a', ɑ: 'a' }),
  },
  {
    id: 'es_th',
    name: { id: 'TH → S / D', es: 'TH → S / D', pt: 'TH → S / D' },
    desc: {
      id: 'Bunyi "th" /θ/ menjadi /s/ dan /ð/ menjadi /d/ — "think" terdengar seperti "sink".',
      es: 'El sonido "th" /θ/ pasa a /s/ y /ð/ a /d/ — "think" suena como "sink".',
      pt: 'O "th" /θ/ vira /s/ e /ð/ vira /d/ — "think" soa como "sink".',
    },
    apply: (p) => replaceAll(p, { θ: 's', ð: 'd' }),
  },
  {
    id: 'es_sh',
    name: { id: 'SH → CH', es: 'SH → CH', pt: 'SH → CH' },
    desc: {
      id: 'Bahasa Spanyol tidak punya bunyi /ʃ/, sehingga "she" menjadi seperti "che".',
      es: 'El español no tiene /ʃ/, así que "she" suena como "che".',
      pt: 'O espanhol não tem /ʃ/, então "she" soa como "che".',
    },
    apply: (p) => replaceAll(p, { ʃ: 'tʃ', ʒ: 'tʃ' }),
  },
  {
    id: 'es_z_s',
    name: { id: 'Z → S', es: 'Z → S', pt: 'Z → S' },
    desc: {
      id: 'Bunyi /z/ menjadi /s/ karena bahasa Spanyol tidak memiliki /z/.',
      es: 'El sonido /z/ pasa a /s/ porque el español no tiene /z/.',
      pt: 'O som /z/ vira /s/ porque o espanhol não tem /z/.',
    },
    apply: (p) => replaceAll(p, { z: 's' }),
  },
  {
    id: 'es_prothesis',
    name: { id: 'Vokal di depan S-', es: 'Prótesis ante S-', pt: 'Prótese antes de S-' },
    desc: {
      id: 'Kata yang dimulai "s"+konsonan diberi vokal /e/ di depan: "speak" → "espeak".',
      es: 'Las palabras que empiezan con "s"+consonante reciben una /e/ inicial: "speak" → "espeak".',
      pt: 'Palavras que começam com "s"+consoante ganham um /e/ inicial: "speak" → "espeak".',
    },
    apply: (p) => prothesis(p, 'e'),
  },
]

const PORTUGUESE_RULES: InterferenceRule[] = [
  {
    id: 'pt_final_devoice',
    name: { id: 'Konsonan akhir dibaca tak bersuara', es: 'Ensordecimiento final', pt: 'Ensurdecimento final' },
    desc: {
      id: 'Konsonan bersuara di akhir kata menjadi tak bersuara: "big" → "bik".',
      es: 'Las consonantes sonoras al final se ensordecen: "big" → "bik".',
      pt: 'Consoantes sonoras no fim ficam surdas: "big" → "bik".',
    },
    apply: (p) => devoiceFinal(p, { b: 'p', d: 't', g: 'k', v: 'f', z: 's', ʒ: 'ʃ', ð: 't' }),
  },
  {
    id: 'pt_lax',
    name: { id: 'Vokal tegang ↔ rileks', es: 'Vocales tensas/relajadas', pt: 'Vogais tensas/relaxadas' },
    desc: {
      id: 'Portugis hanya punya satu "i" dan "u", sehingga /ɪ/→/i/ dan /ʊ/→/u/.',
      es: 'El portugués solo tiene una "i" y una "u", así que /ɪ/→/i/ y /ʊ/→/u/.',
      pt: 'O português só tem um "i" e um "u", então /ɪ/→/i/ e /ʊ/→/u/.',
    },
    apply: (p) => replaceAll(p, { 'ɪ': 'i', 'ʊ': 'u' }),
  },
  {
    id: 'pt_open_vowels',
    name: { id: 'Vokal terbuka diratakan', es: 'Vocales abiertas', pt: 'Vogais abertas' },
    desc: {
      id: '/æ/ menjadi /ɛ/ dan /ʌ/, /ə/, /ɑː/ mendekati /a/.',
      es: '/æ/ pasa a /ɛ/ y /ʌ/, /ə/, /ɑː/ tienden a /a/.',
      pt: '/æ/ vira /ɛ/ e /ʌ/, /ə/, /ɑː/ tendem a /a/.',
    },
    apply: (p) => replaceAll(p, { æ: 'e', ʌ: 'a', ə: 'a', 'ɑː': 'a', ɑ: 'a' }),
  },
  {
    id: 'pt_th',
    name: { id: 'TH → T / D', es: 'TH → T / D', pt: 'TH → T / D' },
    desc: {
      id: 'Bunyi "th" /θ/ menjadi /t/ dan /ð/ menjadi /d/ — "think" terdengar seperti "tink".',
      es: 'El "th" /θ/ pasa a /t/ y /ð/ a /d/ — "think" suena como "tink".',
      pt: 'O "th" /θ/ vira /t/ e /ð/ vira /d/ — "think" soa como "tink".',
    },
    apply: (p) => replaceAll(p, { θ: 't', ð: 'd' }),
  },
  {
    id: 'pt_sh',
    name: { id: 'SH → CH', es: 'SH → CH', pt: 'SH → CH' },
    desc: {
      id: 'Bunyi /ʃ/ cenderung menjadi /tʃ/: "she" seperti "che".',
      es: 'El sonido /ʃ/ tiende a /tʃ/: "she" como "che".',
      pt: 'O som /ʃ/ tende a /tʃ/: "she" como "che".',
    },
    apply: (p) => replaceAll(p, { ʃ: 'tʃ' }),
  },
  {
    id: 'pt_prothesis',
    name: { id: 'Vokal di depan S-', es: 'Prótesis ante S-', pt: 'Prótese antes de S-' },
    desc: {
      id: 'Kata yang dimulai "s"+konsonan diberi vokal /i/ di depan: "speak" → "ispeak".',
      es: 'Las palabras que empiezan con "s"+consonante reciben una /i/ inicial: "speak" → "ispeak".',
      pt: 'Palavras que começam com "s"+consoante ganham um /i/ inicial: "speak" → "ispeak".',
    },
    apply: (p) => prothesis(p, 'i'),
  },
  {
    id: 'pt_final_l',
    name: { id: 'L akhir → W', es: 'L final → W', pt: 'L final → W' },
    desc: {
      id: 'Bunyi /l/ di akhir kata menjadi vokal /w/: "feel" → "feew".',
      es: 'La /l/ final se vocaliza a /w/: "feel" → "feew".',
      pt: 'O /l/ final vocaliza para /w/: "feel" → "feew".',
    },
    apply: (p) => {
      const out = [...p]
      const last = out[out.length - 1]
      if (last === 'l') {
        out[out.length - 1] = 'w'
        return { phones: out, changed: true }
      }
      return { phones: out, changed: false }
    },
  },
  {
    id: 'pt_ti_affric',
    name: { id: 'TI / DI berubah jadi CHI / DJI', es: 'TI / DI → CHI / DJI', pt: 'TI / DI → CHI / DJI' },
    desc: {
      id: 'Di banyak dialek Brasil, /ti/ menjadi /tʃi/ dan /di/ menjadi /dʒi/.',
      es: 'En muchos dialectos brasileños, /ti/ pasa a /tʃi/ y /di/ a /dʒi/.',
      pt: 'Em muitos dialetos brasileiros, /ti/ vira /tʃi/ e /di/ vira /dʒi/.',
    },
    apply: (p) => {
      let changed = false
      const out: string[] = []
      for (let i = 0; i < p.length; i++) {
        if (p[i] === 't' && p[i + 1] === 'i') {
          out.push('tʃ', 'i')
          i++
          changed = true
        } else if (p[i] === 'd' && p[i + 1] === 'i') {
          out.push('dʒ', 'i')
          i++
          changed = true
        } else {
          out.push(p[i])
        }
      }
      return { phones: out, changed }
    },
  },
]

const INDONESIAN_RULES: InterferenceRule[] = [
  {
    id: 'id_lax',
    name: { id: 'Vokal tegang ↔ rileks', es: 'Vocales tensas/relajadas', pt: 'Vogais tensas/relaxadas' },
    desc: {
      id: 'Bahasa Indonesia hanya punya satu "i" dan "u", sehingga /ɪ/→/i/ dan /ʊ/→/u/.',
      es: 'El indonesio solo tiene una "i" y una "u", así que /ɪ/→/i/ y /ʊ/→/u/.',
      pt: 'O indonésio só tem um "i" e um "u", então /ɪ/→/i/ e /ʊ/→/u/.',
    },
    apply: (p) => replaceAll(p, { 'ɪ': 'i', 'ʊ': 'u' }),
  },
  {
    id: 'id_open_vowels',
    name: { id: 'Vokal terbuka diratakan', es: 'Vocales abiertas', pt: 'Vogais abertas' },
    desc: {
      id: '/æ/ menjadi /e/ dan /ʌ/, /ə/, /ɑː/ mendekati /a/.',
      es: '/æ/ pasa a /e/ y /ʌ/, /ə/, /ɑː/ tienden a /a/.',
      pt: '/æ/ vira /e/ e /ʌ/, /ə/, /ɑː/ tendem a /a/.',
    },
    apply: (p) => replaceAll(p, { æ: 'e', ʌ: 'a', ə: 'a', 'ɑː': 'a', ɑ: 'a' }),
  },
  {
    id: 'id_th',
    name: { id: 'TH → T / D', es: 'TH → T / D', pt: 'TH → T / D' },
    desc: {
      id: 'Bunyi "th" tidak ada dalam bahasa Indonesia: /θ/→/t/ dan /ð/→/d/.',
      es: 'El "th" no existe en indonesio: /θ/→/t/ y /ð/→/d/.',
      pt: 'O "th" não existe em indonésio: /θ/→/t/ e /ð/→/d/.',
    },
    apply: (p) => replaceAll(p, { θ: 't', ð: 'd' }),
  },
  {
    id: 'id_final_devoice',
    name: { id: 'Konsonan akhir dibaca tak bersuara', es: 'Ensordecimiento final', pt: 'Ensurdecimento final' },
    desc: {
      id: 'Konsonan bersuara di akhir kata menjadi tak bersuara: "big" → "bik".',
      es: 'Las consonantes sonoras al final se ensordecen: "big" → "bik".',
      pt: 'Consoantes sonoras no fim ficam surdas: "big" → "bik".',
    },
    apply: (p) => devoiceFinal(p, { b: 'p', d: 't', g: 'k', z: 's', ʒ: 'ʃ', ð: 't' }),
  },
  {
    id: 'id_v_f',
    name: { id: 'V → F', es: 'V → F', pt: 'V → F' },
    desc: {
      id: 'Bunyi /v/ sering menjadi /f/ karena tidak ada /v/ asli dalam bahasa Indonesia.',
      es: 'El sonido /v/ suele pasar a /f/ porque el indonesio no tiene /v/.',
      pt: 'O som /v/ costuma virar /f/ porque o indonésio não tem /v/.',
    },
    apply: (p) => replaceAll(p, { v: 'f' }),
  },
  {
    id: 'id_sh_s',
    name: { id: 'SH → S', es: 'SH → S', pt: 'SH → S' },
    desc: {
      id: 'Bunyi /ʃ/ sering disederhanakan menjadi /s/: "she" seperti "see".',
      es: 'El sonido /ʃ/ suele simplificarse a /s/: "she" como "see".',
      pt: 'O som /ʃ/ costuma simplificar para /s/: "she" como "see".',
    },
    apply: (p) => replaceAll(p, { ʃ: 's', ʒ: 's' }),
  },
]

const RULES: Record<NativeLang, InterferenceRule[]> = {
  id: INDONESIAN_RULES,
  es: SPANISH_RULES,
  pt: PORTUGUESE_RULES,
}

// Per-rule literature citations for the Evidence Receipt.
const DEFAULT_REF = 'Swan & Smith, Learner English (2nd ed.); Avery & Ehrlich (1992)'
const RULE_REFS: Record<string, string> = {
  es_v_b: 'Swan & Smith, Learner English — Spanish: /b/–/v/ merger',
  es_lax: 'Swan & Smith — Spanish: no tense/lax vowel contrast',
  es_open_vowels: 'Swan & Smith — Spanish vowel inventory',
  es_th: 'Swan & Smith — Spanish: /θ, ð/ substitutions',
  es_sh: 'Swan & Smith — Spanish: /ʃ/ → /tʃ/',
  es_z_s: 'Swan & Smith — Spanish: /z/ → /s/',
  es_prothesis: 'Swan & Smith — Spanish: prothetic /e/ before s + C',
  pt_final_devoice: 'Swan & Smith — Portuguese: final obstruent devoicing',
  pt_lax: 'Swan & Smith — Portuguese: no tense/lax vowel contrast',
  pt_open_vowels: 'Swan & Smith — Portuguese vowel inventory',
  pt_th: 'Swan & Smith — Portuguese: /θ, ð/ substitutions',
  pt_sh: 'Swan & Smith — Portuguese: /ʃ/ → /tʃ/',
  pt_prothesis: 'Swan & Smith — Portuguese: prothetic /i/ before s + C',
  pt_final_l: 'Swan & Smith — Portuguese: L-vocalization',
  pt_ti_affric: 'Swan & Smith — Brazilian Portuguese: /t, d/ affrication before /i/',
  id_lax: 'Swan & Smith — Indonesian: no tense/lax vowel contrast',
  id_open_vowels: 'Swan & Smith — Indonesian vowel inventory',
  id_th: 'Swan & Smith — Indonesian: /θ, ð/ substitutions',
  id_final_devoice: 'Swan & Smith — Indonesian: final obstruent devoicing',
  id_v_f: 'Swan & Smith — Indonesian: /v/ → /f/',
  id_sh_s: 'Swan & Smith — Indonesian: /ʃ/ → /s/',
}

// ---- Respelling maps (approx IPA -> L1-friendly spelling) ----------------

const RESPELL: Record<NativeLang, Record<string, string>> = {
  es: {
    'iː': 'i', i: 'i', 'ɪ': 'i', e: 'e', 'eɪ': 'ei', æ: 'a', a: 'a', 'ɑː': 'a', ʌ: 'a', ə: 'a',
    'ɜː': 'er', ɒ: 'o', ɔ: 'o', 'ɔː': 'o', oʊ: 'ou', 'uː': 'u', ʊ: 'u', 'aɪ': 'ai', 'aʊ': 'au', 'ɔɪ': 'oi',
    p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', f: 'f', v: 'b', θ: 'z', ð: 'd', s: 's', z: 's',
    ʃ: 'ch', ʒ: 'ch', tʃ: 'ch', dʒ: 'y', m: 'm', n: 'n', ŋ: 'n', l: 'l', r: 'r', h: 'j', w: 'u', j: 'y',
  },
  pt: {
    'iː': 'i', i: 'i', 'ɪ': 'i', e: 'ê', 'eɪ': 'ei', æ: 'é', a: 'a', 'ɑː': 'a', ʌ: 'a', ə: 'a',
    'ɜː': 'ér', ɒ: 'ó', ɔ: 'ó', 'ɔː': 'ó', oʊ: 'ou', 'uː': 'u', ʊ: 'u', 'aɪ': 'ai', 'aʊ': 'au', 'ɔɪ': 'ói',
    p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', f: 'f', v: 'v', θ: 't', ð: 'd', s: 's', z: 's',
    ʃ: 'ch', ʒ: 'j', tʃ: 'tch', dʒ: 'dj', m: 'm', n: 'n', ŋ: 'ng', l: 'l', r: 'r', h: 'r', w: 'u', j: 'i',
  },
  id: {
    'iː': 'i', i: 'i', 'ɪ': 'i', e: 'e', 'eɪ': 'ei', æ: 'e', a: 'a', 'ɑː': 'a', ʌ: 'a', ə: 'e',
    'ɜː': 'er', ɒ: 'o', ɔ: 'o', 'ɔː': 'o', oʊ: 'ou', 'uː': 'u', ʊ: 'u', 'aɪ': 'ai', 'aʊ': 'au', 'ɔɪ': 'oi',
    p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', f: 'f', v: 'f', θ: 't', ð: 'd', s: 's', z: 's',
    ʃ: 's', ʒ: 's', tʃ: 'c', dʒ: 'j', m: 'm', n: 'n', ŋ: 'ng', l: 'l', r: 'r', h: 'h', w: 'w', j: 'y',
  },
}

function respell(phones: string[], lang: NativeLang): string {
  const map = RESPELL[lang]
  return phones.map((p) => map[p] ?? p).join('')
}

// ---- Public API ----------------------------------------------------------

export function applyInterference(ipa: string, lang: NativeLang): InterferenceResult {
  let phones = tokenizeIPA(ipa)
  const hits: RuleHit[] = []

  for (const rule of RULES[lang]) {
    const res = rule.apply(phones)
    if (res.changed) {
      phones = res.phones
      hits.push({ id: rule.id, name: rule.name, desc: rule.desc, ref: RULE_REFS[rule.id] ?? DEFAULT_REF })
    }
  }

  return {
    approxIpa: `/${phones.join('')}/`,
    respelling: respell(phones, lang),
    hits,
  }
}

/** List every rule available for a language (for the "why" panel). */
export function rulesFor(lang: NativeLang): InterferenceRule[] {
  return RULES[lang]
}
