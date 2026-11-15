-- Server-authoritative daily streak points and account badges.
-- Casual career totals remain separate from Ranked match evidence.

-- The daily-streak migration exists in the hosted project history but may be
-- absent from older local checkouts. Keep this migration safe for both paths.
create table if not exists public.player_daily_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_claim_date date,
  current_streak integer not null default 0 check (current_streak >= 0 and current_streak <= 3650),
  best_streak integer not null default 0 check (best_streak >= 0 and best_streak <= 3650),
  total_claims bigint not null default 0 check (total_claims >= 0),
  reward_points bigint not null default 0 check (reward_points >= 0),
  updated_at timestamptz not null default now()
);
alter table public.player_daily_streaks
  add column if not exists last_claim_date date;
alter table public.player_daily_streaks
  add column if not exists current_streak integer not null default 0;
alter table public.player_daily_streaks
  add column if not exists best_streak integer not null default 0;
alter table public.player_daily_streaks
  add column if not exists total_claims bigint not null default 0;
alter table public.player_daily_streaks
  add column if not exists reward_points bigint not null default 0;
alter table public.player_daily_streaks
  add column if not exists updated_at timestamptz not null default now();
alter table public.player_daily_streaks enable row level security;
revoke all on public.player_daily_streaks from anon, authenticated;

create or replace function public.get_daily_reward_status()
returns table(
  current_streak integer,
  best_streak integer,
  total_claims bigint,
  reward_points bigint,
  claimed_today boolean,
  last_claim_date date
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'UTC')::date;
begin
  if v_user is null then
    raise exception 'Sign in to view daily rewards';
  end if;
  return query
    select
      coalesce(s.current_streak, 0),
      coalesce(s.best_streak, 0),
      coalesce(s.total_claims, 0),
      coalesce(s.reward_points, 0),
      coalesce(s.last_claim_date = v_today, false),
      s.last_claim_date
    from (select v_user as user_id) u
    left join public.player_daily_streaks s on s.user_id = u.user_id;
end;
$$;
revoke all on function public.get_daily_reward_status() from public, anon;
grant execute on function public.get_daily_reward_status() to authenticated;

create table if not exists public.player_badges (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null check (badge_id ~ '^[a-z0-9][a-z0-9-]{2,63}$'),
  source text not null default 'daily-streak'
    check (source in ('daily-streak','season','event','achievement')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
create index if not exists player_badges_user_earned_idx
  on public.player_badges(user_id, earned_at desc);
alter table public.player_badges enable row level security;
revoke all on public.player_badges from anon, authenticated;
grant select on public.player_badges to authenticated;
drop policy if exists "Pilots can read their own badges" on public.player_badges;
create policy "Pilots can read their own badges" on public.player_badges
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.get_player_badges()
returns table(badge_id text, source text, earned_at timestamptz)
language sql
stable
set search_path = ''
as $$
  select b.badge_id, b.source, b.earned_at
  from public.player_badges b
  where b.user_id = (select auth.uid())
  order by b.earned_at desc, b.badge_id asc;
$$;
revoke all on function public.get_player_badges() from public, anon;
grant execute on function public.get_player_badges() to authenticated;

-- Career statistics are account-synced convenience data. They are not
-- accepted as Ranked evidence; Ranked remains finalized by the trusted match server.
alter table public.player_game_progress
  add column if not exists total_playtime_seconds bigint not null default 0;
alter table public.player_game_progress
  add column if not exists best_level integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.player_game_progress'::regclass
      and conname = 'player_game_progress_total_playtime_check'
  ) then
    alter table public.player_game_progress
      add constraint player_game_progress_total_playtime_check
      check (total_playtime_seconds >= 0 and total_playtime_seconds <= 315360000);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.player_game_progress'::regclass
      and conname = 'player_game_progress_best_level_check'
  ) then
    alter table public.player_game_progress
      add constraint player_game_progress_best_level_check
      check (best_level >= 1 and best_level <= 100000);
  end if;
end;
$$;

create or replace function public.record_player_run(
  p_score bigint,
  p_level integer,
  p_survival_seconds integer,
  p_kills integer,
  p_bosses_defeated integer,
  p_scrap_collected integer,
  p_achievements text[] default array[]::text[]
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_run jsonb;
  v_progress public.player_game_progress;
  v_xp bigint;
begin
  if v_user is null then raise exception 'Sign in to sync pilot progress'; end if;
  if p_score is null or p_score < 0 or p_score > 2000000000
     or p_level is null or p_level < 1 or p_level > 100000
     or p_survival_seconds is null or p_survival_seconds < 0 or p_survival_seconds > 86400
     or p_kills is null or p_kills < 0 or p_kills > 10000000
     or p_bosses_defeated is null or p_bosses_defeated < 0 or p_bosses_defeated > 100000
     or p_scrap_collected is null or p_scrap_collected < 0 or p_scrap_collected > 2000000000 then
    raise exception 'Invalid run summary';
  end if;

  v_run := jsonb_build_object(
    'score', p_score,
    'level', p_level,
    'survival_seconds', p_survival_seconds,
    'kills', p_kills,
    'bosses_defeated', p_bosses_defeated,
    'scrap_collected', p_scrap_collected,
    'played_at', now()
  );

  insert into public.player_game_progress(user_id)
    values (v_user)
    on conflict (user_id) do nothing;

  select * into v_progress
    from public.player_game_progress
    where user_id = v_user
    for update;

  v_xp := v_progress.xp + p_scrap_collected;

  update public.player_game_progress set
    xp = v_xp,
    level = greatest(1, floor(sqrt(v_xp::numeric / 100))::integer + 1),
    total_runs = total_runs + 1,
    best_score = greatest(best_score, p_score),
    best_level = greatest(best_level, p_level),
    total_playtime_seconds = total_playtime_seconds + p_survival_seconds,
    total_kills = total_kills + p_kills,
    total_scrap = total_scrap + p_scrap_collected,
    achievements = (
      select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb)
      from (
        select distinct value as a
        from jsonb_array_elements_text(
          achievements || to_jsonb(coalesce(p_achievements, array[]::text[]))
        )
      ) s
    ),
    recent_runs = jsonb_build_array(v_run) || recent_runs,
    updated_at = now()
  where user_id = v_user
  returning * into v_progress;

  update public.player_game_progress
    set recent_runs = (
      select coalesce(jsonb_agg(item), '[]'::jsonb)
      from (
        select value as item
        from jsonb_array_elements(v_progress.recent_runs) with ordinality
        order by ordinality
        limit 50
      ) runs
    )
    where user_id = v_user;

  return jsonb_build_object(
    'xp', v_progress.xp,
    'level', v_progress.level,
    'total_runs', v_progress.total_runs,
    'best_level', v_progress.best_level,
    'total_playtime_seconds', v_progress.total_playtime_seconds
  );
end;
$$;
revoke all on function public.record_player_run(bigint, integer, integer, integer, integer, integer, text[]) from public, anon;
grant execute on function public.record_player_run(bigint, integer, integer, integer, integer, integer, text[]) to authenticated;

-- The database clock (UTC) decides the claim date. FOR UPDATE makes claims
-- idempotent under simultaneous requests from multiple devices.
create or replace function public.claim_daily_reward()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'UTC')::date;
  v_row public.player_daily_streaks;
  v_streak integer;
  v_reward integer;
  v_badges text[] := array[]::text[];
  v_inserted integer;
begin
  if v_user is null then
    raise exception 'Sign in to claim daily rewards';
  end if;

  insert into public.player_daily_streaks(user_id)
    values (v_user)
    on conflict (user_id) do nothing;

  select * into v_row
    from public.player_daily_streaks
    where user_id = v_user
    for update;

  if v_row.last_claim_date = v_today then
    return jsonb_build_object(
      'status', 'already_claimed',
      'current_streak', v_row.current_streak,
      'best_streak', v_row.best_streak,
      'total_claims', v_row.total_claims,
      'reward_points', v_row.reward_points,
      'claimed_today', true,
      'earned_points', 0,
      'badge_awarded', to_jsonb(v_badges)
    );
  end if;

  if v_row.last_claim_date = v_today - 1 then
    v_streak := least(3650, v_row.current_streak + 1);
  else
    v_streak := 1;
  end if;

  v_reward := case
    when v_streak % 7 = 0 then 250
    else 50 + ((least(v_streak, 6) - 1) * 10)
  end;

  update public.player_daily_streaks set
    last_claim_date = v_today,
    current_streak = v_streak,
    best_streak = greatest(best_streak, v_streak),
    total_claims = total_claims + 1,
    reward_points = reward_points + v_reward,
    updated_at = now()
  where user_id = v_user
  returning * into v_row;

  if v_streak >= 7 then
    insert into public.player_badges(user_id, badge_id, source, metadata)
      values (v_user, 'signal-streak-7', 'daily-streak', jsonb_build_object('streak', v_streak))
      on conflict (user_id, badge_id) do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted > 0 then
      v_badges := array_append(v_badges, 'signal-streak-7');
    end if;
  end if;

  if v_streak >= 30 then
    insert into public.player_badges(user_id, badge_id, source, metadata)
      values (v_user, 'signal-streak-30', 'daily-streak', jsonb_build_object('streak', v_streak))
      on conflict (user_id, badge_id) do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted > 0 then
      v_badges := array_append(v_badges, 'signal-streak-30');
    end if;
  end if;

  return jsonb_build_object(
    'status', 'claimed',
    'current_streak', v_row.current_streak,
    'best_streak', v_row.best_streak,
    'total_claims', v_row.total_claims,
    'reward_points', v_row.reward_points,
    'claimed_today', true,
    'earned_points', v_reward,
    'claim_date', v_today,
    'badge_awarded', to_jsonb(v_badges)
  );
end;
$$;
revoke all on function public.claim_daily_reward() from public, anon;
grant execute on function public.claim_daily_reward() to authenticated;
