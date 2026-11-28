-- Add a server-owned monotonic version for compare-and-swap workout sync.
-- Existing clients continue using v2 unchanged until both app releases adopt v3.
alter table public.set_logs
  add column if not exists version bigint not null default 1
  check (version > 0);

create or replace function public.bump_set_log_version()
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

drop trigger if exists bump_set_log_version on public.set_logs;
create trigger bump_set_log_version
before update on public.set_logs
for each row execute function public.bump_set_log_version();

create or replace function public.sync_set_log_v3(
  p_id text,
  p_week integer,
  p_day text,
  p_exercise_id text,
  p_set_number integer,
  p_weight numeric,
  p_reps integer,
  p_rpe numeric,
  p_done boolean,
  p_completed_at timestamptz,
  p_skipped boolean,
  p_expected_version bigint,
  p_deleted boolean default false,
  p_restore boolean default false
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
      p_day || ':' || p_exercise_id || ':' || p_set_number::text then
    raise exception 'Invalid record id';
  end if;

  if p_done and p_skipped then
    raise exception 'Cannot complete and skip a set';
  end if;
  if p_restore and p_deleted then
    raise exception 'Cannot restore and delete a set in one operation';
  end if;

  if p_deleted then
    -- A delete must target an existing row at the exact version reviewed locally.
    if p_expected_version is null then return 'conflict'; end if;
    update public.set_logs
       set deleted_at = now(), updated_at = now()
     where id = p_id and user_id = uid and version = p_expected_version
       and deleted_at is null;
    if not found then return 'conflict'; end if;
    return 'ok';
  end if;

  if p_expected_version is null then
    begin
      insert into public.set_logs(
        id,user_id,week,day,exercise_id,set_number,weight,reps,rpe,done,
        updated_at,completed_at,skipped
      ) values (
        p_id,uid,p_week,p_day,p_exercise_id,p_set_number,p_weight,p_reps,p_rpe,p_done,
        now(),p_completed_at,p_skipped
      );
      return 'ok';
    exception when unique_violation then
      return 'conflict';
    end;
  end if;

  update public.set_logs
     set weight = p_weight,
         reps = p_reps,
         rpe = p_rpe,
         done = p_done,
         completed_at = case when p_done then coalesce(completed_at,p_completed_at) else null end,
         skipped = coalesce(p_skipped,false) and not p_done,
         updated_at = now(),
         deleted_at = case when p_restore then null else deleted_at end
   where id = p_id and user_id = uid
     and version = p_expected_version and (deleted_at is null or p_restore);

  if not found then return 'conflict'; end if;
  return 'ok';
end;
$$;

revoke all on function public.sync_set_log_v3(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz,boolean,bigint,boolean,boolean) from public, anon;
grant execute on function public.sync_set_log_v3(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz,boolean,bigint,boolean,boolean) to authenticated;

notify pgrst, 'reload schema';
