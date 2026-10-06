import type { CEFRLevel } from '@/lib/cefr'

export type PlacementCategory = 'grammar' | 'vocabulary'

export type PlacementItem = {
  id: string
  level: CEFRLevel
  category: PlacementCategory
  /** English sentence with a ___ gap */
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

/**
 * A compact 12-item CEFR placement bank — two items per band, A1 → C2.
 * Methodology: the learner ascends band by band; a band is passed when at
 * least one of its two items is correct, and the test stops at the first band
 * both of whose items are missed. This is a quick, transparent screening test,
 * not a certified examination.
 */
export const PLACEMENT_ITEMS: PlacementItem[] = [
  {
    id: 'a1-1',
    level: 'A1',
    category: 'grammar',
    prompt: 'I ___ a student.',
    options: ['am', 'is', 'are', 'be'],
    answer: 0,
    explanation: 'With “I”, the verb “to be” is “am”.',
  },
  {
    id: 'a1-2',
    level: 'A1',
    category: 'grammar',
    prompt: '___ you like coffee?',
    options: ['Do', 'Does', 'Is', 'Are'],
    answer: 0,
    explanation: 'Questions in the present simple with “you” begin with “Do”.',
  },
  {
    id: 'a2-1',
    level: 'A2',
    category: 'grammar',
    prompt: 'I ___ to the gym yesterday.',
    options: ['go', 'went', 'goes', 'going'],
    answer: 1,
    explanation: '“Yesterday” needs the past simple: “went”.',
  },
  {
    id: 'a2-2',
    level: 'A2',
    category: 'grammar',
    prompt: 'She is taller ___ her sister.',
    options: ['then', 'than', 'as', 'that'],
    answer: 1,
    explanation: 'Comparatives use “than” (not “then”).',
  },
  {
    id: 'b1-1',
    level: 'B1',
    category: 'grammar',
    prompt: 'I have lived here ___ 2015.',
    options: ['for', 'since', 'from', 'at'],
    answer: 1,
    explanation: '“Since” marks a starting point in time.',
  },
  {
    id: 'b1-2',
    level: 'B1',
    category: 'grammar',
    prompt: "If it ___ tomorrow, we'll stay home.",
    options: ['will rain', 'rains', 'rained', 'raining'],
    answer: 1,
    explanation: 'In the first conditional, use the present simple after “if”.',
  },
  {
    id: 'b2-1',
    level: 'B2',
    category: 'grammar',
    prompt: 'If I ___ you, I would apologize.',
    options: ['was', 'were', 'am', 'be'],
    answer: 1,
    explanation: 'The second conditional uses “were” for all persons.',
  },
  {
    id: 'b2-2',
    level: 'B2',
    category: 'grammar',
    prompt: 'The report ___ by the team last week.',
    options: ['wrote', 'was written', 'written', 'is writing'],
    answer: 1,
    explanation: 'Passive voice in the past simple: “was written”.',
  },
  {
    id: 'c1-1',
    level: 'C1',
    category: 'grammar',
    prompt: 'Not only ___ the deadline, but she also improved the design.',
    options: ['she met', 'did she meet', 'she did meet', 'she meets'],
    answer: 1,
    explanation: 'After “Not only” at the start, the auxiliary inverts: “did she meet”.',
  },
  {
    id: 'c1-2',
    level: 'C1',
    category: 'grammar',
    prompt: '___ for his help, we would have failed.',
    options: ['If it were not', 'Had it not been', 'Were it not', 'Should it not be'],
    answer: 1,
    explanation: 'A past unreal conditional can invert: “Had it not been for…”.',
  },
  {
    id: 'c2-1',
    level: 'C2',
    category: 'grammar',
    prompt: 'It is imperative that the report ___ submitted by Friday.',
    options: ['is', 'be', 'was', 'will be'],
    answer: 1,
    explanation: 'After “imperative that”, use the subjunctive: “be submitted”.',
  },
  {
    id: 'c2-2',
    level: 'C2',
    category: 'grammar',
    prompt: 'Such ___ his influence that few dared object.',
    options: ['is', 'was', 'were', 'be'],
    answer: 1,
    explanation: 'Fronted “Such was…” agreement with the singular “his influence”.',
  },
]
