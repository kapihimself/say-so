import { describe, it, expect } from 'vitest'
import { applyInterference, rulesFor } from './interference'

describe('applyInterference — Spanish', () => {
  it('renders "sheep" with the SH→CH rule', () => {
    const r = applyInterference('/ʃiːp/', 'es')
    expect(r.hits.map((h) => h.id)).toContain('es_sh')
    expect(r.respelling).toBe('chip')
  })

  it('renders "thin" with /θ/ → /s/', () => {
    const r = applyInterference('/θɪn/', 'es')
    expect(r.hits.map((h) => h.id)).toContain('es_th')
    expect(r.approxIpa).toContain('s')
  })

  it('merges /v/ into /b/', () => {
    const r = applyInterference('/væn/', 'es')
    expect(r.hits.map((h) => h.id)).toContain('es_v_b')
  })
})

describe('applyInterference — Brazilian Portuguese', () => {
  it('renders "thin" with /θ/ → /t/ (and BP affrication of ti)', () => {
    const r = applyInterference('/θɪn/', 'pt')
    const ids = r.hits.map((h) => h.id)
    expect(ids).toContain('pt_th')
    // θ→t then BP t-affrication before /i/ gives "tchin" — accurate for BP.
    expect(ids).toContain('pt_ti_affric')
    expect(r.respelling).toBe('tchin')
    expect(r.approxIpa).toContain('tʃ')
  })

  it('devoices a final voiced consonant', () => {
    const r = applyInterference('/bɪɡ/', 'pt')
    expect(r.hits.map((h) => h.id)).toContain('pt_final_devoice')
  })
})

describe('applyInterference — Indonesian', () => {
  it('renders "van" with /v/ → /f/', () => {
    const r = applyInterference('/væn/', 'id')
    const ids = r.hits.map((h) => h.id)
    expect(ids).toContain('id_v_f')
    expect(ids).toContain('id_open_vowels')
  })

  it('every hit carries a citation', () => {
    const r = applyInterference('/ʃiːp/', 'es')
    expect(r.hits.length).toBeGreaterThan(0)
    for (const h of r.hits) expect(h.ref.length).toBeGreaterThan(0)
  })
})

describe('rulesFor', () => {
  it('exposes rules for each language with localized names', () => {
    for (const lang of ['id', 'es', 'pt'] as const) {
      const rules = rulesFor(lang)
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.name[lang]).toBeTruthy()
        expect(rule.desc[lang]).toBeTruthy()
      }
    }
  })
})
