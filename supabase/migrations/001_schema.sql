-- BISING (Bisa English) — isolated schema inside the shared Supabase project.
-- Everything lives in `english` so it never collides with MedKit+ (`public`).
-- Run this in the Supabase SQL editor, then expose `english` under
-- Project Settings → API → Exposed schemas.

create schema if not exists english;

-- Learner profile (1:1 with auth.users; auth stays shared at project level)
create table if not exists english.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  display_name text not null default 'Sobat',
  level        text not null default 'B1' check (level in ('B1','B2','C1','C2')),
  character_id text,
  teacher_lang text not null default 'bilingual' check (teacher_lang in ('id','en','bilingual')),
  xp_total     int  not null default 0,
  streak_days  int  not null default 0,
  last_active  timestamptz default now(),
  created_at   timestamptz default now()
);

-- Virtual Teacher conversation log
create table if not exists english.teacher_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  level        text not null,
  unit_title   text,
  transcript   jsonb not null default '[]'::jsonb,  -- [{role, content, ts}]
  created_at   timestamptz default now()
);

create index if not exists idx_profiles_user on english.profiles(user_id);
create index if not exists idx_sessions_user on english.teacher_sessions(user_id);

-- Row Level Security: each user only sees their own rows.
alter table english.profiles enable row level security;
alter table english.teacher_sessions enable row level security;

create policy "own profile"  on english.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions" on english.teacher_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
