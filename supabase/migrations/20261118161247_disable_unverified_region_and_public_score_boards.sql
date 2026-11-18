-- Region captures and country points are currently submitted by the browser, not proven by the solo game simulation.
-- Hide historical client-reported score endpoints and stop accepting new region/country claims.
REVOKE EXECUTE ON FUNCTION public.capture_pilot_region(integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.award_country_galaxy_point(integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_region_player_leaderboard(integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_region_country_leaderboard(integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_player_leaderboard(integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_country_score_leaderboard(integer) FROM PUBLIC, anon, authenticated, service_role;
