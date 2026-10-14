-- The UI exposes an Ataturk tribute avatar; permit the matching stored ID.
ALTER TABLE public.player_profiles
  DROP CONSTRAINT IF EXISTS player_profiles_avatar_id_check;
ALTER TABLE public.player_profiles
  ADD CONSTRAINT player_profiles_avatar_id_check
  CHECK (avatar_id IN ('core-blue','core-violet','core-amber','core-mint','ataturk'));

-- Private per-user submission throttle. Clients cannot read or write this table.
CREATE TABLE IF NOT EXISTS public.player_run_submission_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  submission_count integer NOT NULL DEFAULT 0 CHECK (submission_count >= 0),
  last_submitted_at timestamptz
);
ALTER TABLE public.player_run_submission_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.player_run_submission_limits FROM anon, authenticated;

-- Bound score submissions to plausible numeric ranges, reject instant records,
-- and throttle repeated attempts server-side. This reduces abuse; it does not
-- replace a server-authoritative simulation for fully cheat-proof competitive play.
CREATE OR REPLACE FUNCTION public.submit_run_record(p_score integer, p_level integer, p_survival_seconds integer)
RETURNS public.player_run_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_record public.player_run_records;
  v_limit public.player_run_submission_limits;
  v_now timestamptz := now();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Sign in is required to submit an online record';
  END IF;
  IF p_score IS NULL OR p_level IS NULL OR p_survival_seconds IS NULL
     OR p_score < 0 OR p_score > 2000000000
     OR p_level < 1 OR p_level > 1000
     OR p_survival_seconds < 15 OR p_survival_seconds > 14400
     OR p_score > (p_survival_seconds + 60) * 50000 THEN
    RAISE EXCEPTION 'Run result is outside allowed limits';
  END IF;

  INSERT INTO public.player_run_submission_limits(user_id, window_started_at, submission_count, last_submitted_at)
  VALUES (v_user, v_now, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_limit
  FROM public.player_run_submission_limits
  WHERE user_id = v_user
  FOR UPDATE;

  IF v_limit.last_submitted_at IS NOT NULL
     AND v_now - v_limit.last_submitted_at < interval '8 seconds' THEN
    RAISE EXCEPTION 'Please wait before submitting another run';
  END IF;

  IF v_limit.window_started_at < v_now - interval '1 minute' THEN
    UPDATE public.player_run_submission_limits
    SET window_started_at = v_now, submission_count = 1, last_submitted_at = v_now
    WHERE user_id = v_user;
  ELSE
    IF v_limit.submission_count >= 8 THEN
      RAISE EXCEPTION 'Run submission limit reached. Try again in a minute';
    END IF;
    UPDATE public.player_run_submission_limits
    SET submission_count = submission_count + 1, last_submitted_at = v_now
    WHERE user_id = v_user;
  END IF;

  INSERT INTO public.player_run_records(user_id,best_score,best_level,best_survival_seconds,updated_at)
  VALUES(v_user,p_score,p_level,p_survival_seconds,v_now)
  ON CONFLICT(user_id) DO UPDATE SET
    best_score = greatest(public.player_run_records.best_score, excluded.best_score),
    best_level = CASE WHEN excluded.best_score > public.player_run_records.best_score
                      THEN excluded.best_level ELSE public.player_run_records.best_level END,
    best_survival_seconds = CASE WHEN excluded.best_score > public.player_run_records.best_score
                                 THEN excluded.best_survival_seconds ELSE public.player_run_records.best_survival_seconds END,
    updated_at = CASE WHEN excluded.best_score > public.player_run_records.best_score
                      THEN v_now ELSE public.player_run_records.updated_at END
  RETURNING * INTO v_record;
  RETURN v_record;
END;
$function$;
