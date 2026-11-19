-- Deduplicated country points for each galaxy region captured by a signed-in pilot.
-- Country is self-selected in the pilot profile; no location data is collected.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.country_galaxy_contributions (
  user_id uuid not null references auth.users(id) on delete cascade,
  region_id integer not null check (region_id between 0 and 4),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  points integer not null default 100 check (points = 100),
  created_at timestamptz not null default now(),
  primary key (user_id, region_id)
);
alter table private.country_galaxy_contributions enable row level security;
revoke all on private.country_galaxy_contributions from public, anon, authenticated;

-- This narrowly scoped RPC records at most one 100-point contribution per
-- pilot and region. The authenticated identity and country come from the DB.
create or replace function public.award_country_galaxy_point(p_region_id integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  pilot_id uuid := auth.uid();
  chosen_country text;
  inserted_count integer;
begin
  if pilot_id is null or p_region_id is null or p_region_id < 0 or p_region_id > 4 then
    return false;
  end if;
  select country_code into chosen_country
  from public.player_profiles
  where user_id = pilot_id;
  if chosen_country is null or chosen_country !~ '^[A-Z]{2}$' then
    return false;
  end if;
  insert into private.country_galaxy_contributions(user_id, region_id, country_code, points)
  values (pilot_id, p_region_id, chosen_country, 100)
  on conflict (user_id, region_id) do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;
revoke all on function public.award_country_galaxy_point(integer) from public, anon, authenticated;
grant execute on function public.award_country_galaxy_point(integer) to authenticated;

-- Public endpoint exposes aggregate country totals only, never player-level rows.
create or replace function public.get_country_score_leaderboard(p_limit integer default 50)
returns table(country_code text, pilot_count bigint, total_score bigint, top_score integer)
language sql
security definer
set search_path = ''
stable
as $$
  with per_pilot as (
    select country_code, user_id, sum(points)::integer as points
    from private.country_galaxy_contributions
    group by country_code, user_id
  )
  select country_code,
         count(*)::bigint as pilot_count,
         sum(points)::bigint as total_score,
         max(points)::integer as top_score
  from per_pilot
  group by country_code
  order by sum(points) desc, count(*) desc, max(points) desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;
revoke all on function public.get_country_score_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.get_country_score_leaderboard(integer) to anon, authenticated;
