-- Client-reported solo totals are not proof that a run happened.
-- Disable the browser-callable write path until the solo simulation is authoritative on the server.
REVOKE EXECUTE ON FUNCTION public.submit_run_record(integer, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
