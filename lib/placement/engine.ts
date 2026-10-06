import { CEFR_ORDER, type CEFRLevel } from '@/lib/cefr'
import { PLACEMENT_ITEMS, type PlacementItem } from './items'

export const ITEMS_PER_LEVEL = 2

export function itemsForLevel(level: CEFRLevel): PlacementItem[] {
  return PLACEMENT_ITEMS.filter((i) => i.level === level).slice(0, ITEMS_PER_LEVEL)
}

export type Answer = { item: PlacementItem; correct: boolean }

export type PlacementOutcome = {
  level: CEFRLevel
  confidence: 'high' | 'medium' | 'low'
  totalCorrect: number
  totalAsked: number
}

/**
 * Score a placement run. The learner ascends A1 → C2; a band is passed when at
 * least one of its two items is correct. The estimate is the highest band the
 * learner passed. Confidence is high when both items of that band were correct,
 * medium when only one was, low when even A1 was not passed.
 */
export function scorePlacement(answers: Answer[]): PlacementOutcome {
  const byLevel = new Map<CEFRLevel, { correct: number; asked: number }>()
  for (const a of answers) {
    const e = byLevel.get(a.item.level) ?? { correct: 0, asked: 0 }
    e.asked += 1
    if (a.correct) e.correct += 1
    byLevel.set(a.item.level, e)
  }

  let level: CEFRLevel = 'A1'
  let confidence: PlacementOutcome['confidence'] = 'low'

  for (const lv of CEFR_ORDER) {
    const e = byLevel.get(lv)
    if (!e) break
    if (e.correct === 0) break
    level = lv
    confidence = e.correct === e.asked ? 'high' : 'medium'
  }

  const a1 = byLevel.get('A1')
  if (a1 && a1.correct === 0) confidence = 'low'

  return {
    level,
    confidence,
    totalCorrect: answers.filter((a) => a.correct).length,
    totalAsked: answers.length,
  }
}
