-- Preferences column + RLS for authenticated self-service (service role still bypasses RLS for API routes)

alter table public.users_meta
  add column if not exists digest_weekly boolean not null default false;

alter table public.analyses enable row level security;
alter table public.corrections enable row level security;
alter table public.users_meta enable row level security;

drop policy if exists users_meta_select_own on public.users_meta;
drop policy if exists users_meta_update_own on public.users_meta;
drop policy if exists analyses_select_own on public.analyses;
drop policy if exists corrections_select_own on public.corrections;
drop policy if exists corrections_insert_own on public.corrections;

create policy users_meta_select_own on public.users_meta
  for select to authenticated using (auth.uid() = id);

create policy users_meta_update_own on public.users_meta
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy analyses_select_own on public.analyses
  for select to authenticated using (auth.uid() = user_id);

create policy corrections_select_own on public.corrections
  for select to authenticated using (auth.uid() = user_id);

create policy corrections_insert_own on public.corrections
  for insert to authenticated with check (auth.uid() = user_id);
