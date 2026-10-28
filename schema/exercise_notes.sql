create table public.exercise_notes (
 id uuid primary key,
 user_id uuid not null references public.members(user_id),
 week integer not null check (week between 1 and 10),
 day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
 exercise_id text not null check (char_length(exercise_id) between 1 and 240),
 body text not null check (char_length(btrim(body)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index exercise_notes_user_id_idx on public.exercise_notes(user_id);
alter table public.exercise_notes enable row level security;
revoke all on public.exercise_notes from anon, authenticated;
grant select, insert on public.exercise_notes to authenticated;
create policy notes_owner_read on public.exercise_notes for select to authenticated using ((select auth.uid()) = user_id);
create policy notes_owner_insert on public.exercise_notes for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.members m where m.user_id = (select auth.uid())));
comment on table public.exercise_notes is 'Append-only per-workout exercise notes. UUID retries are idempotent; no update/delete grants. Existing sets remain unchanged.';
