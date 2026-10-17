-- The legacy best-run board is no longer needed anonymously by the online hub.
-- Keep it available to signed-in users only; seasonal Ranked has its own RPC.
revoke all on function public.get_player_leaderboard(integer) from public, anon;
grant execute on function public.get_player_leaderboard(integer) to authenticated;
