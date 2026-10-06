import type { LevelId } from '@/lib/store/appStore'

export type UnitContent = {
  unitTitle: string
  grammarFocus: string[]
  vocab: string[]
}

// Unit 1 of each level — mapped to the CEFR global scale (see lib/cefr.ts).
export const CURRICULUM: Record<LevelId, UnitContent> = {
  A1: {
    unitTitle: 'Phonetics & Diphthongs',
    grammarFocus: ['Phonetic symbols', 'Vowel length', 'Diphthong glides'],
    vocab: ['sheep vs ship', 'cat vs cut', 'thin vs tin', 'this vs dis', 'day vs de', 'she vs sea'],
  },
  A2: {
    unitTitle: 'Elementary Communication',
    grammarFocus: ['Present simple & continuous', 'There is / there are', 'Countable & uncountable nouns'],
    vocab: ['family', 'shopping', 'directions', 'daily routine', 'weather', 'food & drink'],
  },
  B1: {
    unitTitle: 'Everyday Communication',
    grammarFocus: ['Present perfect vs simple past', 'Used to / would for habits', 'Comparative adjectives'],
    vocab: ['gonna', 'wanna', 'kinda', 'no worries', 'make a decision', 'take a break'],
  },
  B2: {
    unitTitle: 'Fluent Conversation',
    grammarFocus: ['Second conditional', 'Wish / If only', 'Relative clauses'],
    vocab: ['no cap', 'lowkey', 'bet', 'raise awareness', 'take a stance', 'bite the bullet'],
  },
  C1: {
    unitTitle: 'Sophisticated Expression',
    grammarFocus: ['Cleft sentences', 'Fronting for emphasis', 'Subjunctive mood'],
    vocab: ['nuanced perspective', 'shed light on', 'call into question', 'a double-edged sword'],
  },
  C2: {
    unitTitle: 'Precision & Nuance',
    grammarFocus: ['Mixed conditionals', 'Inversion mastery', 'Complex nominalization'],
    vocab: ['imply vs infer', 'all things considered', 'it stands to reason', 'by the same token'],
  },
}
