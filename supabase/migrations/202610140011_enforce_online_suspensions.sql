
create or replace function public.block_suspended_online_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  moderation public.player_moderation%rowtype;
begin
  if actor is null then return new; end if;
  select * into moderation from public.player_moderation where user_id = actor;
  if moderation.status = 'perma_banned' or (moderation.status = 'temp_banned' and moderation.banned_until > now()) then
    raise exception 'ACCOUNT_RESTRICTED: online play is currently suspended for this account.';
  end if;
  return new;
end;
$$;

drop trigger if exists suspended_online_rooms on public.coop_rooms;
create trigger suspended_online_rooms before insert or update on public.coop_rooms for each row execute function public.block_suspended_online_activity();
drop trigger if exists suspended_online_queue on public.coop_matchmaking_queue;
create trigger suspended_online_queue before insert or update on public.coop_matchmaking_queue for each row execute function public.block_suspended_online_activity();
drop trigger if exists suspended_online_friends on public.player_friends;
create trigger suspended_online_friends before insert or update on public.player_friends for each row execute function public.block_suspended_online_activity();
drop trigger if exists suspended_online_records on public.player_run_records;
create trigger suspended_online_records before insert or update on public.player_run_records for each row execute function public.block_suspended_online_activity();
drop trigger if exists suspended_online_rank_stats on public.player_rank_stats;
create trigger suspended_online_rank_stats before insert or update on public.player_rank_stats for each row execute function public.block_suspended_online_activity();
