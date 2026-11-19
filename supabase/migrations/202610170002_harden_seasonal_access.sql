-- Reduce public-schema security-definer surface for the new seasonal leaderboard.
-- Seasonal rank rows are public leaderboard data for signed-in players only.
drop policy if exists "Season rank stats readable by signed-in pilots" on public.player_season_rank_stats;
create policy "Season rank stats readable by signed-in pilots"
  on public.player_season_rank_stats for select to authenticated using (true);
grant select on public.player_season_rank_stats to authenticated;
revoke insert, update, delete on public.player_season_rank_stats from anon, authenticated;

-- Presence is server-maintained only; explicit deny policy documents the boundary for advisors.
drop policy if exists "No direct client access to room presence" on public.coop_room_presence;
create policy "No direct client access to room presence"
  on public.coop_room_presence for all to anon, authenticated
  using (false) with check (false);
revoke all on public.coop_room_presence from anon, authenticated;

-- The leaderboard returns only intended public ranking/profile fields and can respect caller RLS.
alter function public.get_ranked_leaderboard(text, integer) security invoker;
revoke all on function public.get_ranked_leaderboard(text, integer) from public, anon;
grant execute on function public.get_ranked_leaderboard(text, integer) to authenticated;
