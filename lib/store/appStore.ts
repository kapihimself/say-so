'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BuddyLook } from '@/components/character/Buddy'
import { CEFR_LEVELS, type CEFRLevel } from '@/lib/cefr'

export type LevelId = CEFRLevel
export type TeacherLang = 'id' | 'en' | 'bilingual'
export type NativeLang = 'id' | 'es' | 'pt'

export type CharacterPreset = {
  id: string
  name: string
  look: BuddyLook
}

export const CHARACTERS: CharacterPreset[] = [
  {
    id: 'rama',
    name: 'Rama',
    look: { skin: '#E8B88A', hair: '#7BC8A4', hairStyle: 'puff', outfit: '#7BB8E8', cheeks: '#F4A8C0' },
  },
  {
    id: 'sasa',
    name: 'Sasa',
    look: { skin: '#F1C9A5', hair: '#F4A8C0', hairStyle: 'bun', outfit: '#C8B0E8', cheeks: '#F4A8C0' },
  },
  {
    id: 'deni',
    name: 'Deni',
    look: { skin: '#B07D56', hair: '#2b2238', hairStyle: 'curly', outfit: '#9BD89B', cheeks: '#E89B9B' },
  },
  {
    id: 'mira',
    name: 'Mira',
    look: { skin: '#F1C9A5', hair: '#9FB0F0', hairStyle: 'swoop', outfit: '#F4C06A', cheeks: '#F4A8C0' },
  },
  {
    id: 'bayu',
    name: 'Bayu',
    look: { skin: '#E8B88A', hair: '#F4C06A', hairStyle: 'buzz', outfit: '#7BC8A4' },
  },
  {
    id: 'nala',
    name: 'Nala',
    look: { skin: '#8C5A3C', hair: '#C8B0E8', hairStyle: 'puff', outfit: '#F4A8C0', cheeks: '#E89B9B' },
  },
]

export const LEVELS: Record<
  LevelId,
  {
    id: LevelId
    name: string
    tagline: string
    color: string
    soft: string
    unit: string
    descriptor: string
    band: string
  }
> = {
  A1: {
    id: 'A1',
    name: CEFR_LEVELS.A1.name,
    tagline: 'Belajar bunyi dasar, ejaan phonetic, & diphthong biar gak medok.',
    color: 'var(--color-mint)',
    soft: 'var(--color-mint-soft)',
    unit: 'Phonetics & Diphthongs',
    descriptor: CEFR_LEVELS.A1.descriptor,
    band: CEFR_LEVELS.A1.band,
  },
  A2: {
    id: 'A2',
    name: CEFR_LEVELS.A2.name,
    tagline: 'Kalimat sederhana & tugas rutin sehari-hari.',
    color: 'var(--color-sky)',
    soft: 'var(--color-sky-soft)',
    unit: 'Elementary Communication',
    descriptor: CEFR_LEVELS.A2.descriptor,
    band: CEFR_LEVELS.A2.band,
  },
  B1: {
    id: 'B1',
    name: CEFR_LEVELS.B1.name,
    tagline: 'Udah ngerti dasar, tinggal lancarin ngobrol sehari-hari.',
    color: 'var(--color-grape)',
    soft: 'var(--color-grape-soft)',
    unit: 'Everyday Communication',
    descriptor: CEFR_LEVELS.B1.descriptor,
    band: CEFR_LEVELS.B1.band,
  },
  B2: {
    id: 'B2',
    name: CEFR_LEVELS.B2.name,
    tagline: 'Bisa ngobrol sama native dengan lumayan lancar & spontan.',
    color: 'var(--color-peach)',
    soft: 'var(--color-peach-soft)',
    unit: 'Fluent Conversation',
    descriptor: CEFR_LEVELS.B2.descriptor,
    band: CEFR_LEVELS.B2.band,
  },
  C1: {
    id: 'C1',
    name: CEFR_LEVELS.C1.name,
    tagline: 'Ekspresi ide kompleks, fleksibel, hampir kayak native.',
    color: 'var(--color-bubblegum)',
    soft: 'var(--color-bubblegum-soft)',
    unit: 'Sophisticated Expression',
    descriptor: CEFR_LEVELS.C1.descriptor,
    band: CEFR_LEVELS.C1.band,
  },
  C2: {
    id: 'C2',
    name: CEFR_LEVELS.C2.name,
    tagline: 'Level dewa. Paham apapun, ngomong presisi tanpa mikir.',
    color: 'var(--color-lemon)',
    soft: 'var(--color-lemon-soft)',
    unit: 'Precision & Nuance',
    descriptor: CEFR_LEVELS.C2.descriptor,
    band: CEFR_LEVELS.C2.band,
  },
}

type AppState = {
  name: string
  level: LevelId | null
  characterId: string | null
  teacherLang: TeacherLang
  nativeLang: NativeLang
  setName: (n: string) => void
  setLevel: (l: LevelId) => void
  setCharacter: (id: string) => void
  setTeacherLang: (t: TeacherLang) => void
  setNativeLang: (n: NativeLang) => void
  character: () => CharacterPreset | null
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      name: '',
      level: null,
      characterId: null,
      teacherLang: 'bilingual',
      nativeLang: 'id',
      setName: (n) => set({ name: n }),
      setLevel: (l) => set({ level: l }),
      setCharacter: (id) => set({ characterId: id }),
      setTeacherLang: (t) => set({ teacherLang: t }),
      setNativeLang: (n) => set({ nativeLang: n }),
      character: () => CHARACTERS.find((c) => c.id === get().characterId) ?? null,
    }),
    { name: 'lbeg-store' }
  )
)
