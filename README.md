# BISING (Bisa English) 🦕

Platform belajar bahasa Inggris virtual buat orang Indonesia. Ngobrol langsung
sama guru AI bilingual yang ngajarin pelan-pelan (spoonfeed: HOOK → EXPLAIN →
SHOW → PRACTICE → CORRECT → REINFORCE → REWARD), dikoreksi tanpa bikin malu.
CEFR B1 → C2. Gaya visual terinspirasi Doodles (pastel, outline tebal, playful).

## Stack
Next.js 16.2.6 (App Router) · React 19 · TypeScript · Tailwind v4 (`@theme` di
`app/globals.css`) · framer-motion · zustand · @tanstack/react-query ·
@supabase/ssr · AI lewat proxy OpenAI-compatible `ai.dinoiki.com`.

## Milestone 1 (selesai) — Vibe + Virtual Teacher
- `/` splash, `/onboarding` (nama + level + bahasa guru), `/karakter` (pilih buddy),
  `/room` (kelas: guru AI streaming, voice STT, TTS, ganti bahasa on the fly).
- `app/api/chat` — guru bilingual spoonfeed (streaming).
- `app/api/transcribe` — voice → teks.
- Karakter SVG original di `components/character/Buddy.tsx`.

## Setup
```bash
npm install
npm run dev   # http://localhost:3000
```
`.env.local` udah berisi kredensial Supabase + proxy AI (reuse project MedKit+).

## Supabase
Schema **terpisah** `english` (gak nyampur sama MedKit+ di `public`).
Jalanin `supabase/migrations/001_schema.sql` di SQL editor, lalu expose schema
`english` di Project Settings → API → Exposed schemas. Auth user tetap shared.

## Belum dibangun (next milestones)
Placement test · Flashcard + SRS (FSRS) · Writing Coach · Roleplay Sim ·
Progression engine (XP/streak/capstone/sertifikat) · simpan progres ke Supabase.
Spec lengkap ada di `../medkit-plus/ide sama tapi untuk bahasa inggris/`.
