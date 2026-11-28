create table if not exists public.exercise_substitutions(
 id text primary key,
 user_id uuid not null references public.members(user_id) on delete cascade,
 week integer not null check(week between 1 and 10),
 day text not null check(day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
 exercise_id text not null,
 replacement text not null check(length(replacement) between 1 and 120),
 updated_at timestamptz not null default now(),
 unique(user_id,week,day,exercise_id)
);
alter table public.exercise_substitutions enable row level security;
create policy "read own exercise substitutions" on public.exercise_substitutions for select to authenticated using ((select auth.uid())=user_id);
create policy "insert own exercise substitutions" on public.exercise_substitutions for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.members m where m.user_id=(select auth.uid())));
create policy "update own exercise substitutions" on public.exercise_substitutions for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update on public.exercise_substitutions to authenticated;
