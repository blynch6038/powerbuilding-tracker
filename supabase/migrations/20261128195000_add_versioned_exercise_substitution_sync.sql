-- Monotonic versions let offline clients compare-and-swap substitutions instead of
-- relying on device clocks. Existing upsert clients remain compatible while v3 rolls out.
alter table public.exercise_substitutions
  add column if not exists version bigint not null default 1
  check (version > 0);

create or replace function public.bump_exercise_substitution_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  return new;
end;
$$;

drop trigger if exists bump_exercise_substitution_version on public.exercise_substitutions;
create trigger bump_exercise_substitution_version
before update on public.exercise_substitutions
for each row execute function public.bump_exercise_substitution_version();

create or replace function public.sync_exercise_substitution_v2(
  p_id text,
  p_week integer,
  p_day text,
  p_exercise_id text,
  p_replacement text,
  p_expected_version bigint
) returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null or not exists (
    select 1 from public.members where user_id = uid
  ) then
    raise exception 'Unauthorized';
  end if;

  if p_id is distinct from uid::text || ':' || p_week::text || ':' ||
      p_day || ':' || p_exercise_id then
    raise exception 'Invalid substitution id';
  end if;

  if p_week not between 1 and 10
     or p_day not in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
     or length(btrim(p_replacement)) not between 1 and 120 then
    raise exception 'Invalid substitution';
  end if;

  if p_expected_version is null then
    begin
      insert into public.exercise_substitutions(
        id,user_id,week,day,exercise_id,replacement,updated_at
      ) values (
        p_id,uid,p_week,p_day,p_exercise_id,btrim(p_replacement),clock_timestamp()
      );
      return 'ok';
    exception when unique_violation then
      return 'conflict';
    end;
  end if;

  update public.exercise_substitutions
     set replacement = btrim(p_replacement),
         updated_at = greatest(clock_timestamp(), updated_at + interval '1 microsecond')
   where id = p_id
     and user_id = uid
     and version = p_expected_version;

  if not found then return 'conflict'; end if;
  return 'ok';
end;
$$;

revoke all on function public.sync_exercise_substitution_v2(text,integer,text,text,text,bigint) from public, anon;
grant execute on function public.sync_exercise_substitution_v2(text,integer,text,text,text,bigint) to authenticated;

notify pgrst, 'reload schema';
