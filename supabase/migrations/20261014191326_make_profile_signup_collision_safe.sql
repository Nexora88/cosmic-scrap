CREATE OR REPLACE FUNCTION public.create_player_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  base_name text;
  safe_name text;
BEGIN
  base_name := coalesce(new.raw_user_meta_data ->> 'username', 'pilot_' || substr(new.id::text, 1, 8));
  safe_name := regexp_replace(base_name, '[^A-Za-z0-9_]', '', 'g');
  safe_name := substr(safe_name, 1, 20);
  IF char_length(safe_name) < 3 THEN
    safe_name := 'pilot_' || substr(replace(new.id::text, '-', ''), 1, 12);
  END IF;
  BEGIN
    INSERT INTO public.player_profiles(user_id, username)
    VALUES (new.id, safe_name)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN unique_violation THEN
    safe_name := 'pilot_' || substr(replace(new.id::text, '-', ''), 1, 12);
    INSERT INTO public.player_profiles(user_id, username)
    VALUES (new.id, safe_name)
    ON CONFLICT (user_id) DO NOTHING;
  END;
  RETURN new;
END;
$function$;
