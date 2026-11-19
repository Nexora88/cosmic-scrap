ALTER TABLE public.coop_matchmaking_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.coop_matchmaking_queue FROM anon, authenticated, service_role;
