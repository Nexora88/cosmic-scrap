-- Casual pilot progression and cross-device profile stats.
-- Client-submitted run summaries are convenience stats, never valid Ranked evidence.
create table if not exists public.player_game_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp bigint not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  total_runs bigint not null default 0 check (total_runs >= 0),
  best_score bigint not null default 0 check (best_score >= 0),
  total_kills bigint not null default 0 check (total_kills >= 0),
  total_scrap bigint not null default 0 check (total_scrap >= 0),
  achievements jsonb not null default '[]'::jsonb check (jsonb_typeof(achievements) = 'array'),
  recent_runs jsonb not null default '[]'::jsonb check (jsonb_typeof(recent_runs) = 'array'),
  updated_at timestamptz not null default now()
);
alter table public.player_game_progress enable row level security;
revoke all on public.player_game_progress from anon, authenticated;
drop policy if exists "Players read own progression" on public.player_game_progress;
create policy "Players read own progression" on public.player_game_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.record_player_run(
  p_score bigint,
  p_level integer,
  p_survival_seconds integer,
  p_kills integer,
  p_bosses_defeated integer,
  p_scrap_collected integer,
  p_achievements text[] default array[]::text[]
) returns jsonb
language plpgsql security definer set search_path = ''
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
    'score', p_score, 'level', p_level, 'survival_seconds', p_survival_seconds,
    'kills', p_kills, 'bosses_defeated', p_bosses_defeated,
    'scrap_collected', p_scrap_collected, 'played_at', now()
  );
  insert into public.player_game_progress(user_id) values (v_user)
    on conflict (user_id) do nothing;
  select * into v_progress from public.player_game_progress where user_id = v_user for update;
  v_xp := v_progress.xp + p_scrap_collected;
  update public.player_game_progress set
    xp = v_xp,
    level = greatest(1, floor(sqrt(v_xp::numeric / 100))::integer + 1),
    total_runs = total_runs + 1,
    best_score = greatest(best_score, p_score),
    total_kills = total_kills + p_kills,
    total_scrap = total_scrap + p_scrap_collected,
    achievements = (
      select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb)
      from (select distinct value as a from jsonb_array_elements_text(
        achievements || to_jsonb(coalesce(p_achievements, array[]::text[]))
      )) s
    ),
    recent_runs = jsonb_build_array(v_run) || recent_runs,
    updated_at = now()
  where user_id = v_user
  returning * into v_progress;
  -- Keep the newest 50 run summaries only.
  update public.player_game_progress
    set recent_runs = (select coalesce(jsonb_agg(item), '[]'::jsonb)
      from (select value as item from jsonb_array_elements(v_progress.recent_runs) with ordinality
            order by ordinality limit 50) runs)
    where user_id = v_user;
  return jsonb_build_object('xp', v_progress.xp, 'level', v_progress.level, 'total_runs', v_progress.total_runs);
end;
$$;
revoke all on function public.record_player_run(bigint, integer, integer, integer, integer, integer, text[]) from public, anon;
grant execute on function public.record_player_run(bigint, integer, integer, integer, integer, integer, text[]) to authenticated;

alter table public.player_game_progress
  add column if not exists game_save jsonb;
create or replace function public.sync_player_game_save(p_save jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_saved jsonb;
begin
  if v_user is null then raise exception 'Sign in to sync your game save'; end if;
  if p_save is null or jsonb_typeof(p_save) <> 'object'
     or octet_length(p_save::text) > 100000 then
    raise exception 'Invalid game save payload';
  end if;
  if coalesce((p_save->>'version')::integer, 0) not between 1 and 2 then
    raise exception 'Unsupported game save version';
  end if;
  insert into public.player_game_progress(user_id, game_save)
    values (v_user, p_save)
    on conflict (user_id) do update
      set game_save = excluded.game_save, updated_at = now();
  select game_save into v_saved from public.player_game_progress where user_id = v_user;
  return jsonb_build_object('game_save', v_saved, 'updated_at', now());
end;
$$;
revoke all on function public.sync_player_game_save(jsonb) from public, anon;
grant execute on function public.sync_player_game_save(jsonb) to authenticated;
create or replace function public.get_player_game_save()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_saved jsonb;
begin
  if v_user is null then raise exception 'Sign in to sync your game save'; end if;
  select game_save into v_saved from public.player_game_progress where user_id = v_user;
  return coalesce(v_saved, '{}'::jsonb);
end;
$$;
revoke all on function public.get_player_game_save() from public, anon;
grant execute on function public.get_player_game_save() to authenticated;
