-- ============================================================
-- JaPerPo — initial schema (idempotent)
-- ============================================================
-- Sprachlern-App fuer Luca, Darian, Tobi (Japanisch/Persisch/Portugiesisch).
-- 3-Personen-Privat-App: anon-Rolle hat vollen Zugriff (RLS aktiv, Policies offen).
-- App-seitig wird per user_id gefiltert.
--
-- Idempotent: kann mehrfach laufen ohne Fehler (CREATE IF NOT EXISTS / DO-Blocks).
-- UUIDs via gen_random_uuid() (Postgres 13+ built-in, keine Extension noetig).

-- ============================================================
-- Enums
-- ============================================================
do $$ begin
  create type language_code as enum ('ja', 'fa', 'pt');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type test_type as enum ('multiple_choice', 'cloze', 'grammar', 'conversation', 'mixed');
exception when duplicate_object then null; end $$;

-- ============================================================
-- Tabellen
-- ============================================================

create table if not exists users (
  id text primary key check (id in ('luca', 'darian', 'tobi')),
  display_name text not null,
  avatar_color text not null,
  primary_language language_code not null,
  current_level cefr_level not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id text primary key references users(id) on delete cascade,
  avatar_url text,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  language language_code not null,
  word text not null,
  translation text not null,
  transcription text,
  context_sentence text,
  example_sentence text,
  difficulty smallint not null default 0,
  level cefr_level not null,
  category text,
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists vocabulary_items_lang_level_idx
  on vocabulary_items (language, level);

create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  vocabulary_id uuid not null references vocabulary_items(id) on delete cascade,
  language language_code not null,
  srs jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, vocabulary_id)
);
create index if not exists progress_user_lang_idx on progress (user_id, language);
create index if not exists progress_next_review_idx
  on progress (user_id, ((srs ->> 'nextReview')));

create table if not exists dialogues (
  id uuid primary key default gen_random_uuid(),
  language language_code not null,
  title text not null,
  scenario text not null,
  steps jsonb not null,
  level cefr_level not null,
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists dialogues_lang_level_idx on dialogues (language, level);

create table if not exists reading_texts (
  id uuid primary key default gen_random_uuid(),
  language language_code not null,
  title text not null,
  content text not null,
  level cefr_level not null,
  word_count integer not null,
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists reading_texts_lang_level_idx
  on reading_texts (language, level);

create table if not exists cloze_texts (
  id uuid primary key default gen_random_uuid(),
  language language_code not null,
  title text not null,
  content_text text not null,
  positions jsonb not null,
  level cefr_level not null,
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists cloze_texts_lang_level_idx
  on cloze_texts (language, level);

create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  language language_code not null,
  title text not null,
  type test_type not null,
  questions jsonb not null,
  attempts_allowed smallint not null default 3,
  attempts_used smallint not null default 0,
  completed boolean not null default false,
  score real,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tests_user_lang_idx on tests (user_id, language);

create table if not exists sentence_of_the_day (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  texts jsonb not null,
  selected_by_user_id text references users(id),
  explanation text,
  highlighted_words jsonb
);
create index if not exists sentence_of_the_day_date_idx
  on sentence_of_the_day (date desc);

create table if not exists statistics (
  user_id text primary key references users(id) on delete cascade,
  streak_days integer not null default 0,
  last_study_date date,
  total_words_learned integer not null default 0,
  total_conversations_completed integer not null default 0,
  total_reading_texts_completed integer not null default 0,
  total_tests_completed integer not null default 0,
  achievements jsonb not null default '[]'::jsonb,
  weekly_progress jsonb not null default '[]'::jsonb,
  stats_by_language jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists leaderboard (
  user_id text primary key references users(id) on delete cascade,
  rank smallint not null,
  xp integer not null default 0,
  streak_days integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  endpoint text not null,
  tokens_in integer,
  tokens_out integer,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time_idx
  on ai_usage (user_id, created_at desc);

-- ============================================================
-- Seed: feste 3 Nutzer
-- ============================================================

insert into users (id, display_name, avatar_color, primary_language, current_level) values
  ('luca',   'Luca',   '#1f9c9d', 'fa', 'B1'),
  ('darian', 'Darian', '#7a1f2b', 'pt', 'A1'),
  ('tobi',   'Tobi',   '#ed1d59', 'ja', 'A1')
on conflict (id) do nothing;

insert into profiles (user_id, settings) values
  ('luca',   '{"themeMode":"system","uiLanguage":"de","persianTransliteration":true,"dailyGoalMinutes":10,"notificationsEnabled":false}'::jsonb),
  ('darian', '{"themeMode":"system","uiLanguage":"de","persianTransliteration":false,"dailyGoalMinutes":10,"notificationsEnabled":false}'::jsonb),
  ('tobi',   '{"themeMode":"system","uiLanguage":"de","persianTransliteration":false,"dailyGoalMinutes":10,"notificationsEnabled":false}'::jsonb)
on conflict (user_id) do nothing;

insert into statistics (user_id) values ('luca'), ('darian'), ('tobi')
on conflict (user_id) do nothing;

insert into leaderboard (user_id, rank) values
  ('luca', 1), ('darian', 2), ('tobi', 3)
on conflict (user_id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table users enable row level security;
alter table profiles enable row level security;
alter table vocabulary_items enable row level security;
alter table progress enable row level security;
alter table dialogues enable row level security;
alter table reading_texts enable row level security;
alter table cloze_texts enable row level security;
alter table tests enable row level security;
alter table sentence_of_the_day enable row level security;
alter table statistics enable row level security;
alter table leaderboard enable row level security;
alter table ai_usage enable row level security;

-- Policies: drop-then-create damit Re-Runs sauber laufen
drop policy if exists "anon all users" on users;
create policy "anon all users" on users for all using (true) with check (true);

drop policy if exists "anon all profiles" on profiles;
create policy "anon all profiles" on profiles for all using (true) with check (true);

drop policy if exists "anon all vocabulary_items" on vocabulary_items;
create policy "anon all vocabulary_items" on vocabulary_items for all using (true) with check (true);

drop policy if exists "anon all progress" on progress;
create policy "anon all progress" on progress for all using (true) with check (true);

drop policy if exists "anon all dialogues" on dialogues;
create policy "anon all dialogues" on dialogues for all using (true) with check (true);

drop policy if exists "anon all reading_texts" on reading_texts;
create policy "anon all reading_texts" on reading_texts for all using (true) with check (true);

drop policy if exists "anon all cloze_texts" on cloze_texts;
create policy "anon all cloze_texts" on cloze_texts for all using (true) with check (true);

drop policy if exists "anon all tests" on tests;
create policy "anon all tests" on tests for all using (true) with check (true);

drop policy if exists "anon all sentence_of_the_day" on sentence_of_the_day;
create policy "anon all sentence_of_the_day" on sentence_of_the_day for all using (true) with check (true);

drop policy if exists "anon all statistics" on statistics;
create policy "anon all statistics" on statistics for all using (true) with check (true);

drop policy if exists "anon all leaderboard" on leaderboard;
create policy "anon all leaderboard" on leaderboard for all using (true) with check (true);

-- ai_usage: nur Read + Insert von anon — kein Update/Delete (Rate-Limit-Manipulation verhindern).
drop policy if exists "anon read ai_usage" on ai_usage;
create policy "anon read ai_usage" on ai_usage for select using (true);

drop policy if exists "anon insert ai_usage" on ai_usage;
create policy "anon insert ai_usage" on ai_usage for insert with check (true);

-- ============================================================
-- Realtime (idempotent ueber DO-Block)
-- ============================================================

do $$ begin
  alter publication supabase_realtime add table leaderboard;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table sentence_of_the_day;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table statistics;
exception when duplicate_object then null; end $$;
