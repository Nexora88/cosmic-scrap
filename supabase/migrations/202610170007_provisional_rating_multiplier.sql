-- Provisional players move through rating faster during their first 10 completed matches.
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
  v_multiplier_a numeric := 1;
  v_multiplier_b numeric := 1;
  v_winner uuid;
  v_season public.ranked_seasons;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Only the trusted match server may finalize Ranked results';
  end if;
  if p_match_id is null
     or p_outcome is null
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

  v_multiplier_a := case when v_a.matches < 10 then 1.5 else 1 end;
  v_multiplier_b := case when v_b.matches < 10 then 1.5 else 1 end;

  if p_outcome in ('a_win','b_forfeit') then
    v_winner := v_match.player_a_id;
    v_factor_a := greatest(0.5, least(1.5, 1 + ((v_b.rating - v_a.rating)::numeric / 1000)));
    v_factor_b := greatest(0.5, least(1.5, 1 + ((v_a.rating - v_b.rating)::numeric / 1000)));
    v_delta_a := round(25 * v_factor_a * v_multiplier_a)::integer;
    v_delta_b := -round(18 * v_factor_b * v_multiplier_b)::integer;
  elsif p_outcome in ('b_win','a_forfeit') then
    v_winner := v_match.player_b_id;
    v_factor_a := greatest(0.5, least(1.5, 1 + ((v_b.rating - v_a.rating)::numeric / 1000)));
    v_factor_b := greatest(0.5, least(1.5, 1 + ((v_a.rating - v_b.rating)::numeric / 1000)));
    v_delta_a := -round(18 * v_factor_a * v_multiplier_a)::integer;
    v_delta_b := round(25 * v_factor_b * v_multiplier_b)::integer;
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

