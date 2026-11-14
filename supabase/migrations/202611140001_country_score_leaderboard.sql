-- Self-selected country identity and public country score rankings.
-- Country is a two-letter ISO code chosen by the player; no location data is collected.
alter table public.player_profiles
  add column if not exists country_code text;
alter table public.player_profiles
  drop constraint if exists player_profiles_country_code_check;
alter table public.player_profiles
  add constraint player_profiles_country_code_check
  check (country_code is null or country_code ~ '^[A-Z]{2}$');

create or replace function public.create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
  safe_name text;
  chosen_country text;
begin
  base_name := coalesce(new.raw_user_meta_data ->> 'username', 'pilot_' || substr(new.id::text, 1, 8));
  safe_name := regexp_replace(base_name, '[^A-Za-z0-9_]', '', 'g');
  safe_name := substr(safe_name, 1, 20);
  if char_length(safe_name) < 3 then
    safe_name := 'pilot_' || substr(new.id::text, 1, 8);
  end if;
  chosen_country := upper(coalesce(new.raw_user_meta_data ->> 'country_code', ''));
  if chosen_country !~ '^[A-Z]{2}$' then chosen_country := null; end if;
  insert into public.player_profiles(user_id, username, country_code)
  values (new.id, safe_name, chosen_country)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function public.get_country_score_leaderboard(p_limit integer default 50)
returns table(country_code text, pilot_count bigint, total_score bigint, top_score integer)
language sql
security definer
set search_path = ''
stable
as $$
  select p.country_code,
         count(distinct r.user_id)::bigint as pilot_count,
         sum(r.best_score)::bigint as total_score,
         max(r.best_score)::integer as top_score
  from public.player_run_records r
  join public.player_profiles p on p.user_id = r.user_id
  where p.country_code is not null
  group by p.country_code
  order by sum(r.best_score) desc, count(distinct r.user_id) desc, max(r.best_score) desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;
revoke all on function public.get_country_score_leaderboard(integer) from public;
grant execute on function public.get_country_score_leaderboard(integer) to anon, authenticated;
