-- Tighten online score plausibility checks for solo and room records.
-- Browser scores remain untrusted; this is a guardrail, not authoritative simulation.
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
     OR p_level > floor(p_survival_seconds / 2.0)::integer + 5
     OR p_score > (p_survival_seconds + 30) * 2500 THEN
    RAISE EXCEPTION 'Run result is outside allowed limits';
  END IF;

  INSERT INTO public.player_run_submission_limits(user_id, window_started_at, submission_count, last_submitted_at)
  VALUES (v_user, v_now, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_limit FROM public.player_run_submission_limits WHERE user_id = v_user FOR UPDATE;
  IF v_limit.last_submitted_at IS NOT NULL AND v_now - v_limit.last_submitted_at < interval '8 seconds' THEN
    RAISE EXCEPTION 'Please wait before submitting another run';
  END IF;
  IF v_limit.window_started_at < v_now - interval '1 minute' THEN
    UPDATE public.player_run_submission_limits SET window_started_at = v_now, submission_count = 1, last_submitted_at = v_now WHERE user_id = v_user;
  ELSE
    IF v_limit.submission_count >= 8 THEN RAISE EXCEPTION 'Run submission limit reached. Try again in a minute'; END IF;
    UPDATE public.player_run_submission_limits SET submission_count = submission_count + 1, last_submitted_at = v_now WHERE user_id = v_user;
  END IF;

  INSERT INTO public.player_run_records(user_id,best_score,best_level,best_survival_seconds,updated_at)
  VALUES(v_user,p_score,p_level,p_survival_seconds,v_now)
  ON CONFLICT(user_id) DO UPDATE SET
    best_score = greatest(public.player_run_records.best_score, excluded.best_score),
    best_level = CASE WHEN excluded.best_score > public.player_run_records.best_score THEN excluded.best_level ELSE public.player_run_records.best_level END,
    best_survival_seconds = CASE WHEN excluded.best_score > public.player_run_records.best_score THEN excluded.best_survival_seconds ELSE public.player_run_records.best_survival_seconds END,
    updated_at = CASE WHEN excluded.best_score > public.player_run_records.best_score THEN v_now ELSE public.player_run_records.updated_at END
  RETURNING * INTO v_record;
  RETURN v_record;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_room_score(p_room_id uuid, p_score integer, p_level integer, p_survival_seconds integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_room public.coop_rooms;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in to submit a match result'; END IF;
  IF p_room_id IS NULL OR p_score IS NULL OR p_level IS NULL OR p_survival_seconds IS NULL
    OR p_score < 0 OR p_score > 2000000000 OR p_level < 1 OR p_level > 1000
    OR p_survival_seconds < 15 OR p_survival_seconds > 14400
    OR p_level > floor(p_survival_seconds / 2.0)::integer + 5
    OR p_score > (p_survival_seconds + 30) * 2500 THEN
    RAISE EXCEPTION 'Match result is outside allowed limits';
  END IF;
  SELECT * INTO v_room FROM public.coop_rooms WHERE id=p_room_id
    AND (host_user_id=v_user OR guest_user_id=v_user) AND expires_at>now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Match not found or access denied'; END IF;
  IF v_room.status NOT IN ('ready','playing') THEN RAISE EXCEPTION 'This match is not accepting results'; END IF;
  IF v_room.host_user_id=v_user THEN
    IF v_room.host_submitted THEN RAISE EXCEPTION 'Your score was already submitted'; END IF;
    UPDATE public.coop_rooms SET host_score=p_score,host_submitted=true,status='playing',started_at=coalesce(started_at,now())
      WHERE id=v_room.id RETURNING * INTO v_room;
  ELSE
    IF v_room.guest_submitted THEN RAISE EXCEPTION 'Your score was already submitted'; END IF;
    UPDATE public.coop_rooms SET guest_score=p_score,guest_submitted=true,status='playing',started_at=coalesce(started_at,now())
      WHERE id=v_room.id RETURNING * INTO v_room;
  END IF;
  IF v_room.host_submitted AND v_room.guest_submitted THEN
    UPDATE public.coop_rooms SET status='finished',finished_at=now(),
      winner_user_id=CASE WHEN host_score>guest_score THEN host_user_id WHEN guest_score>host_score THEN guest_user_id ELSE NULL END
      WHERE id=v_room.id RETURNING * INTO v_room;
    IF v_room.room_mode='ranked' THEN
      INSERT INTO public.player_rank_stats(user_id) VALUES(v_room.host_user_id),(v_room.guest_user_id) ON CONFLICT(user_id) DO NOTHING;
      IF v_room.host_score>v_room.guest_score THEN
        UPDATE public.player_rank_stats SET rating=least(100000,rating+25),wins=wins+1,matches=matches+1,updated_at=now() WHERE user_id=v_room.host_user_id;
        UPDATE public.player_rank_stats SET rating=greatest(100,rating-20),losses=losses+1,matches=matches+1,updated_at=now() WHERE user_id=v_room.guest_user_id;
      ELSIF v_room.guest_score>v_room.host_score THEN
        UPDATE public.player_rank_stats SET rating=least(100000,rating+25),wins=wins+1,matches=matches+1,updated_at=now() WHERE user_id=v_room.guest_user_id;
        UPDATE public.player_rank_stats SET rating=greatest(100,rating-20),losses=losses+1,matches=matches+1,updated_at=now() WHERE user_id=v_room.host_user_id;
      ELSE
        UPDATE public.player_rank_stats SET draws=draws+1,matches=matches+1,updated_at=now() WHERE user_id IN (v_room.host_user_id,v_room.guest_user_id);
      END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('status',v_room.status,'host_score',v_room.host_score,'guest_score',v_room.guest_score,
    'host_submitted',v_room.host_submitted,'guest_submitted',v_room.guest_submitted,'winner_user_id',v_room.winner_user_id);
END;
$function$;
