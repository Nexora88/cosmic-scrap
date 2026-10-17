-- Explicit table privileges for the trusted Edge Function service role.
-- BYPASSRLS does not substitute for SQL table privileges.
grant select, update on public.coop_rooms to service_role;
grant select, insert, update, delete on public.online_simulations to service_role;
grant select, insert, update, delete on public.ranked_matchmaking_queue to service_role;
grant select on public.ranked_duel_matches to service_role;
grant insert, select on public.coop_match_stats to service_role;
