alter table public.set_logs add column if not exists completed_at timestamptz, add column if not exists skipped boolean not null default false;
create or replace function public.sync_set_log_v2(p_id text,p_week integer,p_day text,p_exercise_id text,p_set_number integer,p_weight numeric,p_reps integer,p_rpe numeric,p_done boolean,p_updated_at timestamptz,p_completed_at timestamptz,p_skipped boolean)
returns text language plpgsql security invoker set search_path to '' as $$
declare uid uuid := (select auth.uid()); outcome text;
begin
 if uid is null or not exists(select 1 from public.members where user_id=uid) then raise exception 'Unauthorized'; end if;
 if p_id is distinct from uid::text||':'||p_week::text||':'||p_day||':'||p_exercise_id||':'||p_set_number::text then raise exception 'Invalid record id'; end if;
 if p_done and p_skipped then raise exception 'Cannot complete and skip a set'; end if;
 if exists(select 1 from public.set_logs where id=p_id and user_id=uid and deleted_at is not null) then return 'conflict'; end if;
 outcome:=public.sync_set_log(p_id,p_week,p_day,p_exercise_id,p_set_number,p_weight,p_reps,p_rpe,p_done,p_updated_at);
 if outcome='ok' then
 update public.set_logs set completed_at=case when p_done then coalesce(completed_at,p_completed_at) else null end,skipped=coalesce(p_skipped,false) and not p_done where id=p_id and user_id=uid and updated_at=p_updated_at;
 end if;
 return outcome;
end $$;
revoke all on function public.sync_set_log_v2(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz,timestamptz,boolean) from public,anon;
grant execute on function public.sync_set_log_v2(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz,timestamptz,boolean) to authenticated;
create or replace function public.normalize_set_completion() returns trigger language plpgsql security invoker set search_path to '' as $$
begin
 if new.done then
  new.skipped:=false;
  if tg_op='UPDATE' and old.done then new.completed_at:=coalesce(old.completed_at,new.completed_at); end if;
 else new.completed_at:=null; end if;
 return new;
end $$;
create trigger normalize_set_completion before insert or update on public.set_logs for each row execute function public.normalize_set_completion();
notify pgrst,'reload schema';
