'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NativeLang } from '@/lib/store/appStore'

export type MistakeEntry = {
  word: string
  /** the sound the learner struggled with, e.g. "iː" */
  sound: string
  nativeLang: NativeLang
  /** interference rule ids that explain this error */
  ruleIds: string[]
  count: number
  lastAt: number
}

type MistakeRecordInput = {
  word: string
  sound: string
  nativeLang: NativeLang
  ruleIds: string[]
}

type MistakeBankState = {
  entries: Record<string, MistakeEntry>
  record: (input: MistakeRecordInput) => void
  clear: () => void
  list: () => MistakeEntry[]
}

const entryKey = (e: MistakeRecordInput) => `${e.nativeLang}:${e.word}:${e.sound}`

export const useMistakeBank = create<MistakeBankState>()(
  persist(
    (set, get) => ({
      entries: {},
      record: (input) =>
        set((state) => {
          const k = entryKey(input)
          const prev = state.entries[k]
          const entry: MistakeEntry = {
            word: input.word,
            sound: input.sound,
            nativeLang: input.nativeLang,
            ruleIds: input.ruleIds,
            count: (prev?.count ?? 0) + 1,
            lastAt: Date.now(),
          }
          return { entries: { ...state.entries, [k]: entry } }
        }),
      clear: () => set({ entries: {} }),
      list: () =>
        Object.values(get().entries).sort((a, b) => b.count - a.count || b.lastAt - a.lastAt),
    }),
    { name: 'lbeg-mistakes' }
  )
)
