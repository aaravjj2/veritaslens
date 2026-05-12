-- Return digest opt-in users with email (service_role only; not exposed to anon API clients)

create or replace function public.get_digest_subscribers()
returns table (user_id uuid, email text)
language sql
security definer
set search_path = public
as $$
  select u.id as user_id, u.email::text as email
  from auth.users u
  inner join public.users_meta m on m.id = u.id
  where m.digest_weekly = true
    and u.email is not null
    and length(trim(u.email::text)) > 0;
$$;

revoke all on function public.get_digest_subscribers() from public;
grant execute on function public.get_digest_subscribers() to service_role;
