create table if not exists public.members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.set_logs (
 id text primary key,
 user_id uuid not null references public.members(user_id) on delete cascade,
 week integer not null check (week between 1 and 10),
 day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
 exercise_id text not null,
 set_number integer not null check (set_number between 1 and 30),
 weight numeric check (weight is null or (weight>=0 and weight<=3000)),
 reps integer check (reps is null or (reps>=0 and reps<=1000)),
 rpe numeric check (rpe is null or (rpe>=1 and rpe<=10)),
 done boolean not null default false,
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,week,day,exercise_id,set_number)
);
create index if not exists set_logs_user_time on public.set_logs(user_id,updated_at);
alter table public.members enable row level security;
alter table public.set_logs enable row level security;
create policy "member can read own membership" on public.members for select to authenticated using ((select auth.uid())=user_id);
create policy "member can read own logs" on public.set_logs for select to authenticated using ((select auth.uid())=user_id);
create or replace function public.register_invited_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.members(user_id) values(new.id) on conflict do nothing;
 return new;
end $$;
revoke all on function public.register_invited_user() from public,anon,authenticated;
create trigger on_auth_user_created_powerbuilding after insert on auth.users for each row execute function public.register_invited_user();
create or replace function public.sync_set_log(
 p_id text,p_week integer,p_day text,p_exercise_id text,p_set_number integer,
 p_weight numeric,p_reps integer,p_rpe numeric,p_done boolean,p_updated_at timestamptz
) returns text language plpgsql security definer set search_path='' as $$
declare existing public.set_logs%rowtype; uid uuid;
begin
 uid := (select auth.uid());
 if uid is null or not exists(select 1 from public.members where user_id=uid) then raise exception 'Unauthorized'; end if;
 if p_id <> uid::text||':'||p_week::text||':'||p_day||':'||p_exercise_id||':'||p_set_number::text then raise exception 'Invalid record id';end if;
 select * into existing from public.set_logs where id=p_id and user_id=uid;
 if found then
   if existing.updated_at > p_updated_at then return 'conflict'; end if;
   update public.set_logs set weight=p_weight,reps=p_reps,rpe=p_rpe,done=p_done,updated_at=p_updated_at where id=p_id and user_id=uid;
 else
   insert into public.set_logs(id,user_id,week,day,exercise_id,set_number,weight,reps,rpe,done,updated_at)
   values(p_id,uid,p_week,p_day,p_exercise_id,p_set_number,p_weight,p_reps,p_rpe,p_done,p_updated_at);
 end if;
 return 'ok';
end $$;
revoke all on function public.sync_set_log(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz) from public,anon;
grant execute on function public.sync_set_log(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz) to authenticated;
grant select on public.set_logs,public.members to authenticated;
