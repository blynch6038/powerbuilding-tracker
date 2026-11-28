alter function public.sync_set_log(text,integer,text,text,integer,numeric,integer,numeric,boolean,timestamptz) security invoker;
create policy "member can insert own logs" on public.set_logs for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.members m where m.user_id=(select auth.uid())));
create policy "member can update own logs" on public.set_logs for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant insert,update on public.set_logs to authenticated;
