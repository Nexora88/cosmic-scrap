-- Auth inserts into auth.users run under a restricted role. Use a tightly scoped,
-- fixed-search-path definer trigger to create the corresponding profile.
create or replace function public.create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
  safe_name text;
begin
  base_name := coalesce(new.raw_user_meta_data ->> 'username', 'pilot_' || substr(new.id::text, 1, 8));
  safe_name := regexp_replace(base_name, '[^A-Za-z0-9_]', '', 'g');
  safe_name := substr(safe_name, 1, 20);
  if char_length(safe_name) < 3 then
    safe_name := 'pilot_' || substr(new.id::text, 1, 8);
  end if;
  insert into public.player_profiles(user_id, username)
  values (new.id, safe_name)
  on conflict (user_id) do nothing;
  return new;
end;
$$;