-- Server-owned simulation state and atomic Ranked matchmaking queue.
-- Clients cannot read or write these tables directly; the Edge Function uses service_role.

create table if not exists public.online_simulations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid unique references public.coop_rooms(id) on delete cascade,
  ranked_match_id uuid unique references public.ranked_duel_matches(id) on delete cascade,
  mode text not null check (mode in ('coop','ranked')),
  state jsonb not null default '{}'::jsonb,
  version bigint not null default 0 check (version >= 0),
  status text not null default 'playing' check (status in ('playing','finished','abandoned')),
  last_tick_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  check ((mode = 'coop' and room_id is not null and ranked_match_id is null)
      or (mode = 'ranked' and ranked_match_id is not null and room_id is null))
);
create index if not exists online_simulations_status_tick_idx
  on public.online_simulations(status, last_tick_at);

alter table public.online_simulations enable row level security;
drop policy if exists "No direct client access to online simulation state" on public.online_simulations;
create policy "No direct client access to online simulation state"
  on public.online_simulations for all to anon, authenticated
  using (false) with check (false);
revoke all on public.online_simulations from public, anon, authenticated;

create table if not exists public.ranked_matchmaking_queue (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating integer not null default 1000 check (rating between 100 and 100000),
  queued_at timestamptz not null default now()
);
create index if not exists ranked_matchmaking_queue_search_idx
  on public.ranked_matchmaking_queue(queued_at, rating);
alter table public.ranked_matchmaking_queue enable row level security;
drop policy if exists "No direct client access to ranked matchmaking queue" on public.ranked_matchmaking_queue;
create policy "No direct client access to ranked matchmaking queue"
  on public.ranked_matchmaking_queue for all to anon, authenticated
  using (false) with check (false);
revoke all on public.ranked_matchmaking_queue from public, anon, authenticated;

create index if not exists coop_room_presence_user_idx
  on public.coop_room_presence(user_id, last_seen_at desc);
create index if not exists ranked_duel_matches_season_finished_idx
  on public.ranked_duel_matches(season_id, finished_at desc)
  where status = 'finished';

-- Atomic queue claim: one transaction chooses at most one opponent and creates one match.
create or replace function public.claim_ranked_opponent(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := coalesce(auth.jwt() ->> 'role', '');
  v_season_id uuid;
  v_rating integer;
  v_opponent uuid;
  v_opponent_rating integer;
  v_match public.ranked_duel_matches;
  v_existing public.ranked_duel_matches;
  v_wait_seconds integer;
begin
  if v_role <> 'service_role' then
    raise exception 'Only the trusted matchmaking service may claim a ranked opponent';
  end if;
  if p_user_id is null then raise exception 'Player ID is required'; end if;

  perform pg_advisory_xact_lock(hashtext('cosmic-scrap-ranked-matchmaking'));

  select * into v_existing
  from public.ranked_duel_matches m
  where (m.player_a_id = p_user_id or m.player_b_id = p_user_id)
    and m.status in ('created','playing')
  order by m.created_at desc limit 1;
  if found then
    return jsonb_build_object('status', 'matched', 'match_id', v_existing.id,
      'player_a_id', v_existing.player_a_id, 'player_b_id', v_existing.player_b_id,
      'server_seed', v_existing.server_seed, 'started_at', v_existing.started_at);
  end if;

  select id into v_season_id
  from public.ranked_seasons
  where status = 'active' and starts_at <= now() and ends_at > now()
  order by starts_at desc limit 1;
  if v_season_id is null then raise exception 'No active ranked season'; end if;

  insert into public.player_season_rank_stats(season_id, user_id)
  values (v_season_id, p_user_id) on conflict (season_id, user_id) do nothing;
  select rating into v_rating from public.player_season_rank_stats
    where season_id = v_season_id and user_id = p_user_id;
  insert into public.ranked_matchmaking_queue(user_id, rating)
    values (p_user_id, v_rating) on conflict (user_id) do nothing;

  select greatest(0, floor(extract(epoch from (now() - queued_at)))::integer)
    into v_wait_seconds from public.ranked_matchmaking_queue where user_id = p_user_id;
  select q.user_id, q.rating into v_opponent, v_opponent_rating
  from public.ranked_matchmaking_queue q
  where q.user_id <> p_user_id
    and abs(q.rating - v_rating) <= greatest(150, least(1500, 150 + floor(v_wait_seconds / 10.0)::integer * 100))
    and not exists (
      select 1 from public.ranked_duel_matches m
      where m.status in ('created','playing')
        and (m.player_a_id = q.user_id or m.player_b_id = q.user_id)
    )
  order by abs(q.rating - v_rating), q.queued_at, q.user_id
  for update skip locked limit 1;

  if v_opponent is null then
    return jsonb_build_object('status', 'queued', 'rating', v_rating, 'queued_at', now());
  end if;

  delete from public.ranked_matchmaking_queue where user_id in (p_user_id, v_opponent);
  insert into public.ranked_duel_matches(
    season_id, player_a_id, player_b_id, status, ruleset_version,
    server_seed, started_at
  ) values (
    v_season_id, v_opponent, p_user_id, 'playing', 1,
    floor(random() * 9000000000000000000)::bigint, now()
  ) returning * into v_match;

  return jsonb_build_object('status', 'matched', 'match_id', v_match.id,
    'player_a_id', v_match.player_a_id, 'player_b_id', v_match.player_b_id,
    'server_seed', v_match.server_seed, 'started_at', v_match.started_at);
end;
$$;
revoke all on function public.claim_ranked_opponent(uuid) from public, anon, authenticated;
grant execute on function public.claim_ranked_opponent(uuid) to service_role;

-- Seed one initial season only when no active season exists. This is not a historical rating import.
insert into public.ranked_seasons(season_key, starts_at, ends_at, status)
select '2026-october-s1', now() - interval '1 day', now() + interval '34 days', 'active'
where not exists (select 1 from public.ranked_seasons where status = 'active');
