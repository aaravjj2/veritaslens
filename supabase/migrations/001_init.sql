-- VeritasLens initial schema (Supabase / PostgreSQL)

create extension if not exists "pgcrypto";

create table if not exists public.users_meta (
  id uuid primary key references auth.users (id) on delete cascade,
  language_pref text default 'en',
  created_at timestamptz default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  share_token uuid not null unique,
  input_text text not null,
  result_json jsonb not null,
  language text not null,
  created_at timestamptz default now()
);

create index if not exists analyses_user_id_idx on public.analyses (user_id);
create index if not exists analyses_created_at_idx on public.analyses (created_at desc);

create table if not exists public.sources (
  id text primary key,
  org_name text not null,
  country text not null,
  language text not null,
  url text not null,
  last_verified date
);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.analyses (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  correction_text text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
