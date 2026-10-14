-- Keep profile reads and updates available to signed-in clients, while RLS limits
-- each player to the rows/actions allowed by their own policies.
REVOKE ALL ON TABLE public.player_profiles FROM anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.player_profiles TO authenticated;
