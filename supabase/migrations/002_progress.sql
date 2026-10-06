-- BISING — milestone 2: CEFR A1/A2, native language, and progress events.
-- Run after 001_schema.sql in the Supabase SQL editor.

create schema if not exists english;

-- 1. CEFR taxonomy is now A1–C2 (was B1–C2, missing the beginner bands).
alter table english.profiles drop constraint if exists profiles_level_check;
alter table english.profiles
  add constraint profiles_level_check check (level in ('A1','A2','B1','B2','C1','C2'));

-- 2. The learner's native language drives the interference engine.
alter table english.profiles
  add column if not exists native_lang text not null default 'id'
  check (native_lang in ('id','es','pt'));

-- 3. Append-only progress events (placement results, mistakes, sessions).
create table if not exists english.progress_events (
  id         uuid primary key default gen_random_uuid(),
  learner_id text not null,
  kind       text not null,
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_progress_learner on english.progress_events(learner_id);
create index if not exists idx_progress_kind    on english.progress_events(kind);
create index if not exists idx_progress_created on english.progress_events(created_at desc);

-- Written by the server route with the service-role key (bypasses RLS).
-- Enable RLS defensively so anon clients can never read other learners' rows.
alter table english.progress_events enable row level security;
