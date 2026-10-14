revoke all on function public.get_player_leaderboard(integer) from public, anon;
grant execute on function public.get_player_leaderboard(integer) to authenticated;