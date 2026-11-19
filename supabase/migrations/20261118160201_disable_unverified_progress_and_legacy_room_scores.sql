-- Career totals, achievements and legacy room results are browser-reported.
-- Keep local/offline progression, but do not accept these claims as trusted online records.
REVOKE EXECUTE ON FUNCTION public.record_player_run(bigint, integer, integer, integer, integer, integer, text[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.submit_room_score(uuid, integer, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
