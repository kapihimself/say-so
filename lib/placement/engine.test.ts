import { describe, it, expect } from 'vitest'
import { scorePlacement, itemsForLevel, ITEMS_PER_LEVEL, type Answer } from './engine'
import type { CEFRLevel } from '@/lib/cefr'

function answersFor(level: CEFRLevel, results: boolean[]): Answer[] {
  const items = itemsForLevel(level)
  return results.map((correct, i) => ({ item: items[i], correct }))
}

describe('placement engine', () => {
  it('ships two items per band', () => {
    expect(ITEMS_PER_LEVEL).toBe(2)
    for (const lv of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]) {
      expect(itemsForLevel(lv)).toHaveLength(2)
    }
  })

  it('passes A1 and fails A2 → places at A1 with high confidence', () => {
    const answers = [...answersFor('A1', [true, true]), ...answersFor('A2', [false, false])]
    const out = scorePlacement(answers)
    expect(out.level).toBe('A1')
    expect(out.confidence).toBe('high')
  })

  it('passes fractional bands → highest fully-passed band, medium confidence at the boundary', () => {
    const answers = [
      ...answersFor('A1', [true, true]),
      ...answersFor('A2', [true, false]),
      ...answersFor('B1', [false, false]),
    ]
    const out = scorePlacement(answers)
    expect(out.level).toBe('A2')
    expect(out.confidence).toBe('medium')
  })

  it('aces everything → C2 with high confidence', () => {
    const answers = (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).flatMap((lv) =>
      answersFor(lv, [true, true])
    )
    const out = scorePlacement(answers)
    expect(out.level).toBe('C2')
    expect(out.confidence).toBe('high')
    expect(out.totalCorrect).toBe(12)
  })

  it('fails A1 entirely → A1 with low confidence', () => {
    const out = scorePlacement(answersFor('A1', [false, false]))
    expect(out.level).toBe('A1')
    expect(out.confidence).toBe('low')
  })
})
