-- Cosmic Scrap online security gate + seasonal ranked data foundation.
-- This migration intentionally disables the legacy browser-score Ranked queue.
-- It does NOT claim to ship a trusted simulation; ranked stays locked until one is deployed.

alter table public.player_profiles
  add column if not exists country_code text;
alter table public.player_profiles
  drop constraint if exists player_profiles_country_code_check;
alter table public.player_profiles
  add constraint player_profiles_country_code_check
  check (country_code is null or country_code ~ '^[A-Z]{2}$');

-- Presence is advisory only; it is never used as proof of a match result.
create table if not exists public.coop_room_presence (
  room_id uuid not null references public.coop_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
alter table public.coop_room_presence enable row level security;
revoke all on public.coop_room_presence from anon, authenticated;

create or replace function public.heartbeat_coop_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_room public.coop_rooms;
begin
  if v_user is null then raise exception 'Sign in to reconnect to an online room'; end if;
  if p_room_id is null then raise exception 'Room ID is required'; end if;

  select * into v_room
  from public.coop_rooms
  where id = p_room_id
    and (host_user_id = v_user or guest_user_id = v_user)
    and expires_at > now()
    and status in ('waiting','ready','playing')
  for update;

  if not found then raise exception 'Room not found, expired, closed, or access denied'; end if;

  insert into public.coop_room_presence(room_id, user_id, last_seen_at)
  values (p_room_id, v_user, now())
  on conflict (room_id, user_id) do update set last_seen_at = excluded.last_seen_at;

  return jsonb_build_object('room_id', p_room_id, 'user_id', v_user, 'last_seen_at', now());
end;
$$;
revoke all on function public.heartbeat_coop_room(uuid) from public, anon;
grant execute on function public.heartbeat_coop_room(uuid) to authenticated;

-- Extend the existing membership-checked state response with connection freshness.
create or replace function public.get_room_state(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user uuid := auth.uid();
  v_room public.coop_rooms;
  v_host_seen timestamptz;
  v_guest_seen timestamptz;
begin
  if v_user is null then raise exception 'Sign in to view a room'; end if;

  select * into v_room
  from public.coop_rooms
  where id = p_room_id
    and (host_user_id = v_user or guest_user_id = v_user)
    and expires_at > now();

  if not found then raise exception 'Room not found, expired, or access denied'; end if;

  select last_seen_at into v_host_seen from public.coop_room_presence
    where room_id = v_room.id and user_id = v_room.host_user_id;
  if v_room.guest_user_id is not null then
    select last_seen_at into v_guest_seen from public.coop_room_presence
      where room_id = v_room.id and user_id = v_room.guest_user_id;
  end if;

  return jsonb_build_object(
    'id', v_room.id,
    'invite_code', v_room.invite_code,
    'status', v_room.status,
    'room_mode', v_room.room_mode,
    'level_bracket', v_room.level_bracket,
    'host_user_id', v_room.host_user_id,
    'guest_user_id', v_room.guest_user_id,
    'host_score', v_room.host_score,
    'guest_score', v_room.guest_score,
    'host_submitted', v_room.host_submitted,
    'guest_submitted', v_room.guest_submitted,
    'winner_user_id', v_room.winner_user_id,
    'expires_at', v_room.expires_at,
    'host_connected', coalesce(v_host_seen > now() - interval '20 seconds', false),
    'guest_connected', coalesce(v_guest_seen > now() - interval '20 seconds', false)
  );
end;
$$;
revoke all on function public.get_room_state(uuid) from public, anon;
grant execute on function public.get_room_state(uuid) to authenticated;

-- Dedicated season data: legacy async records and legacy rating never seed this table.
create table if not exists public.ranked_seasons (
  id uuid primary key default gen_random_uuid(),
  season_key text not null unique check (char_length(season_key) between 3 and 40),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','active','completed')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create unique index if not exists ranked_seasons_one_active_idx
  on public.ranked_seasons ((status)) where status = 'active';
alter table public.ranked_seasons enable row level security;
drop policy if exists "Season calendar is readable" on public.ranked_seasons;
create policy "Season calendar is readable" on public.ranked_seasons
  for select to anon, authenticated using (true);

create table if not exists public.player_season_rank_stats (
  season_id uuid not null references public.ranked_seasons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null default 1000 check (rating between 100 and 100000),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  matches integer not null default 0 check (matches >= 0),
  updated_at timestamptz not null default now(),
  primary key (season_id, user_id)
);
create index if not exists player_season_rank_leaderboard_idx
  on public.player_season_rank_stats(season_id, rating desc, wins desc, matches asc);
alter table public.player_season_rank_stats enable row level security;
revoke all on public.player_season_rank_stats from anon, authenticated;

create table if not exists public.ranked_duel_matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.ranked_seasons(id),
  player_a_id uuid not null references auth.users(id) on delete cascade,
  player_b_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'created' check (status in ('created','playing','finished','abandoned')),
  ruleset_version integer not null default 1 check (ruleset_version > 0),
  server_seed bigint not null,
  started_at timestamptz,
  finished_at timestamptz,
  outcome text check (outcome in ('a_win','b_win','draw','a_forfeit','b_forfeit')),
  winner_user_id uuid references auth.users(id) on delete set null,
  score_a integer check (score_a is null or score_a between 0 and 2000000000),
  score_b integer check (score_b is null or score_b between 0 and 2000000000),
  damage_a integer check (damage_a is null or damage_a between 0 and 2000000000),
  damage_b integer check (damage_b is null or damage_b between 0 and 2000000000),
  rating_a_before integer,
  rating_b_before integer,
  rating_a_after integer,
  rating_b_after integer,
  rating_delta_a integer,
  rating_delta_b integer,
  provisional_a boolean,
  provisional_b boolean,
  created_at timestamptz not null default now(),
  check (player_a_id <> player_b_id),
  check (winner_user_id is null or winner_user_id in (player_a_id, player_b_id))
);
create index if not exists ranked_duel_player_a_history_idx
  on public.ranked_duel_matches(player_a_id, finished_at desc);
create index if not exists ranked_duel_player_b_history_idx
  on public.ranked_duel_matches(player_b_id, finished_at desc);
alter table public.ranked_duel_matches enable row level security;
drop policy if exists "Players can read their own ranked match history" on public.ranked_duel_matches;
create policy "Players can read their own ranked match history"
  on public.ranked_duel_matches for select to authenticated
  using ((select auth.uid()) = player_a_id or (select auth.uid()) = player_b_id);
revoke insert, update, delete on public.ranked_duel_matches from anon, authenticated;
revoke insert, update, delete on public.player_season_rank_stats from anon, authenticated;

-- Critical fail-closed change: client-supplied solo scores cannot create Ranked matches.
create or replace function public.join_ranked_queue(
  p_level_bracket integer default 1,
  p_rating integer default 1000
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Sign in to find an opponent'; end if;
  raise exception 'Ranked is temporarily locked until trusted server simulation is deployed';
end;
$$;
revoke all on function public.join_ranked_queue(integer, integer) from public, anon;
grant execute on function public.join_ranked_queue(integer, integer) to authenticated;

-- Existing legacy rooms are allowed to finish friendly async challenges, but never Ranked.
create or replace function public.block_legacy_ranked_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.room_mode = 'ranked'
     and new.status = 'finished'
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Legacy client-score Ranked results are disabled; trusted match validation is required';
  end if;
  return new;
end;
$$;
drop trigger if exists block_legacy_ranked_completion_trigger on public.coop_rooms;
create trigger block_legacy_ranked_completion_trigger
  before update on public.coop_rooms
  for each row execute function public.block_legacy_ranked_completion();
revoke all on function public.block_legacy_ranked_completion() from public, anon, authenticated;

-- Only a trusted backend using the service-role JWT can atomically finalize a ranked result.
-- Match creation and simulation must also be implemented by that backend before the queue is enabled.
create or replace function public.finalize_ranked_duel(
  p_match_id uuid,
  p_outcome text,
  p_score_a integer,
  p_score_b integer,
  p_damage_a integer,
  p_damage_b integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.ranked_duel_matches;
  v_a public.player_season_rank_stats;
  v_b public.player_season_rank_stats;
  v_delta_a integer := 0;
  v_delta_b integer := 0;
  v_factor_a numeric;
  v_factor_b numeric;
  v_winner uuid;
  v_season public.ranked_seasons;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Only the trusted match server may finalize Ranked results';
  end if;
  if p_match_id is null
     or p_outcome not in ('a_win','b_win','draw','a_forfeit','b_forfeit')
     or p_score_a is null or p_score_b is null or p_damage_a is null or p_damage_b is null
     or p_score_a < 0 or p_score_a > 2000000000
     or p_score_b < 0 or p_score_b > 2000000000
     or p_damage_a < 0 or p_damage_a > 2000000000
     or p_damage_b < 0 or p_damage_b > 2000000000 then
    raise exception 'Invalid trusted match result';
  end if;

  select * into v_match from public.ranked_duel_matches where id = p_match_id for update;
  if not found or v_match.status <> 'playing' then
    raise exception 'Match not found, not active, or already finalized';
  end if;
  select * into v_season from public.ranked_seasons where id = v_match.season_id for update;
  if not found or v_season.status <> 'active' or now() < v_season.starts_at or now() >= v_season.ends_at then
    raise exception 'Match season is not active';
  end if;

  insert into public.player_season_rank_stats(season_id, user_id)
    values (v_match.season_id, v_match.player_a_id), (v_match.season_id, v_match.player_b_id)
    on conflict (season_id, user_id) do nothing;
  select * into v_a from public.player_season_rank_stats
    where season_id = v_match.season_id and user_id = v_match.player_a_id for update;
  select * into v_b from public.player_season_rank_stats
    where season_id = v_match.season_id and user_id = v_match.player_b_id for update;

  if p_outcome in ('a_win','b_forfeit') then
    v_winner := v_match.player_a_id;
    v_factor_a := greatest(0.5, least(1.5, 1 + ((v_b.rating - v_a.rating)::numeric / 1000)));
    v_factor_b := greatest(0.5, least(1.5, 1 + ((v_a.rating - v_b.rating)::numeric / 1000)));
    v_delta_a := round(25 * v_factor_a)::integer;
    v_delta_b := -round(18 * v_factor_b)::integer;
  elsif p_outcome in ('b_win','a_forfeit') then
    v_winner := v_match.player_b_id;
    v_factor_a := greatest(0.5, least(1.5, 1 + ((v_b.rating - v_a.rating)::numeric / 1000)));
    v_factor_b := greatest(0.5, least(1.5, 1 + ((v_a.rating - v_b.rating)::numeric / 1000)));
    v_delta_a := -round(18 * v_factor_a)::integer;
    v_delta_b := round(25 * v_factor_b)::integer;
  else
    v_winner := null;
  end if;

  update public.player_season_rank_stats
    set rating = greatest(100, least(100000, rating + v_delta_a)),
        wins = wins + case when p_outcome in ('a_win','b_forfeit') then 1 else 0 end,
        losses = losses + case when p_outcome in ('b_win','a_forfeit') then 1 else 0 end,
        draws = draws + case when p_outcome = 'draw' then 1 else 0 end,
        matches = matches + 1, updated_at = now()
    where season_id = v_match.season_id and user_id = v_match.player_a_id;
  update public.player_season_rank_stats
    set rating = greatest(100, least(100000, rating + v_delta_b)),
        wins = wins + case when p_outcome in ('b_win','a_forfeit') then 1 else 0 end,
        losses = losses + case when p_outcome in ('a_win','b_forfeit') then 1 else 0 end,
        draws = draws + case when p_outcome = 'draw' then 1 else 0 end,
        matches = matches + 1, updated_at = now()
    where season_id = v_match.season_id and user_id = v_match.player_b_id;

  update public.ranked_duel_matches set
    status = 'finished', finished_at = now(), outcome = p_outcome, winner_user_id = v_winner,
    score_a = p_score_a, score_b = p_score_b, damage_a = p_damage_a, damage_b = p_damage_b,
    rating_a_before = v_a.rating, rating_b_before = v_b.rating,
    rating_a_after = greatest(100, least(100000, v_a.rating + v_delta_a)),
    rating_b_after = greatest(100, least(100000, v_b.rating + v_delta_b)),
    rating_delta_a = v_delta_a, rating_delta_b = v_delta_b,
    provisional_a = v_a.matches < 10, provisional_b = v_b.matches < 10
    where id = p_match_id returning * into v_match;

  return jsonb_build_object(
    'match_id', v_match.id, 'status', v_match.status, 'outcome', v_match.outcome,
    'winner_user_id', v_match.winner_user_id,
    'rating_a_before', v_match.rating_a_before, 'rating_a_after', v_match.rating_a_after,
    'rating_delta_a', v_match.rating_delta_a,
    'rating_b_before', v_match.rating_b_before, 'rating_b_after', v_match.rating_b_after,
    'rating_delta_b', v_match.rating_delta_b,
    'provisional_a', v_match.provisional_a, 'provisional_b', v_match.provisional_b
  );
end;
$$;
revoke all on function public.finalize_ranked_duel(uuid, text, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.finalize_ranked_duel(uuid, text, integer, integer, integer, integer) to service_role;

create or replace function public.start_ranked_season(
  p_season_key text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season_id uuid;
  v_previous public.ranked_seasons;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Only trusted server operations may roll seasons';
  end if;
  if p_season_key is null or p_season_key !~ '^[A-Za-z0-9_-]{3,40}$'
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Invalid season configuration';
  end if;
  if exists(select 1 from public.ranked_seasons where season_key = p_season_key) then
    raise exception 'Season key already exists';
  end if;

  select * into v_previous from public.ranked_seasons
    where status = 'active' for update;
  if found then
    if now() < v_previous.ends_at then raise exception 'Current season has not ended'; end if;
    update public.ranked_seasons set status = 'completed' where id = v_previous.id;
  end if;

  insert into public.ranked_seasons(season_key, starts_at, ends_at, status)
    values (p_season_key, p_starts_at, p_ends_at, case when now() >= p_starts_at and now() < p_ends_at then 'active' else 'scheduled' end)
    returning id into v_season_id;

  if v_previous.id is not null then
    insert into public.player_season_rank_stats(season_id, user_id, rating)
      select v_season_id, user_id, greatest(100, least(100000, 1000 + round((rating - 1000) * 0.70)::integer))
      from public.player_season_rank_stats where season_id = v_previous.id
    on conflict (season_id, user_id) do nothing;
  end if;
  return v_season_id;
end;
$$;
revoke all on function public.start_ranked_season(text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.start_ranked_season(text, timestamptz, timestamptz) to service_role;

create or replace function public.get_ranked_leaderboard(
  p_scope text default 'global',
  p_limit integer default 50
)
returns table (
  rank_position bigint,
  user_id uuid,
  username text,
  avatar_id text,
  country_code text,
  rating integer,
  wins integer,
  losses integer,
  draws integer,
  matches integer,
  league text,
  provisional boolean
)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user uuid := auth.uid();
  v_season_id uuid;
  v_country text;
begin
  if p_scope not in ('global','country','friends') then raise exception 'Invalid leaderboard scope'; end if;
  if p_scope = 'friends' and v_user is null then raise exception 'Sign in to view friends leaderboard'; end if;
  select id into v_season_id from public.ranked_seasons
    where status = 'active' and starts_at <= now() and ends_at > now() limit 1;
  if v_season_id is null then return; end if;

  if p_scope = 'country' then
    select country_code into v_country from public.player_profiles where player_profiles.user_id = v_user;
    if v_country is null then return; end if;
  end if;

  return query
  with eligible as (
    select s.user_id, p.username, p.avatar_id, p.country_code, s.rating, s.wins, s.losses, s.draws, s.matches,
      case when s.rating >= 1900 then 'Void'
           when s.rating >= 1500 then 'Gold'
           when s.rating >= 1200 then 'Silver'
           else 'Bronze' end as league,
      (s.matches < 10) as provisional
    from public.player_season_rank_stats s
    join public.player_profiles p on p.user_id = s.user_id
    where s.season_id = v_season_id
      and (p_scope <> 'country' or p.country_code = v_country)
      and (p_scope <> 'friends' or s.user_id = v_user or exists (
        select 1 from public.player_friends f
        where f.status = 'accepted'
          and ((f.requester_user_id = v_user and f.target_user_id = s.user_id)
            or (f.target_user_id = v_user and f.requester_user_id = s.user_id))
      ))
  ), ranked as (
    select row_number() over (order by rating desc, wins desc, matches asc, username asc) as pos, eligible.*
    from eligible
  )
  select ranked.pos, ranked.user_id, ranked.username, ranked.avatar_id, ranked.country_code,
    ranked.rating, ranked.wins, ranked.losses, ranked.draws, ranked.matches, ranked.league, ranked.provisional
  from ranked order by ranked.pos limit greatest(1, least(coalesce(p_limit, 50), 100));
end;
$$;
revoke all on function public.get_ranked_leaderboard(text, integer) from public;
grant execute on function public.get_ranked_leaderboard(text, integer) to anon, authenticated;

-- Users may update only their own country through their existing profile RLS policy.
-- The CHECK constraint enforces ISO-style two-letter uppercase codes; null means not selected.
