-- Allow advance scheduling and automatically activate seasons with a 70% soft reset.
create or replace function public.start_ranked_season(
  p_season_key text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season_id uuid;
  v_previous public.ranked_seasons;
  v_new_status text;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Only trusted server operations may schedule seasons';
  end if;
  if p_season_key is null or p_season_key !~ '^[A-Za-z0-9_-]{3,40}$'
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'Invalid season configuration';
  end if;
  if exists(select 1 from public.ranked_seasons where season_key = p_season_key) then
    raise exception 'Season key already exists';
  end if;
  if exists(
    select 1 from public.ranked_seasons
    where status in ('active','scheduled')
      and starts_at < p_ends_at and ends_at > p_starts_at
  ) then
    raise exception 'Season dates overlap an active or scheduled season';
  end if;

  select * into v_previous from public.ranked_seasons
    where status = 'active' for update;
  if found and v_previous.ends_at <= now() then
    update public.ranked_seasons set status = 'completed' where id = v_previous.id;
    v_previous.status := 'completed';
  end if;

  v_new_status := case when p_starts_at <= now() and p_ends_at > now() then 'active' else 'scheduled' end;
  if v_new_status = 'active' and exists(select 1 from public.ranked_seasons where status='active') then
    raise exception 'Another season is currently active';
  end if;

  insert into public.ranked_seasons(season_key,starts_at,ends_at,status)
    values(p_season_key,p_starts_at,p_ends_at,v_new_status)
    returning id into v_season_id;

  if v_new_status='active' then
    select * into v_previous from public.ranked_seasons
      where status='completed' and ends_at <= p_starts_at
      order by ends_at desc limit 1;
    if found then
      insert into public.player_season_rank_stats(season_id,user_id,rating)
        select v_season_id,user_id,greatest(100,least(100000,1000+round((rating-1000)*0.70)::integer))
        from public.player_season_rank_stats where season_id=v_previous.id
      on conflict(season_id,user_id) do nothing;
    end if;
  end if;
  return v_season_id;
end;
$$;
revoke all on function public.start_ranked_season(text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.start_ranked_season(text,timestamptz,timestamptz) to service_role;

create or replace function public.activate_ranked_seasons()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := coalesce(auth.jwt() ->> 'role','');
  v_next public.ranked_seasons;
  v_previous public.ranked_seasons;
begin
  if v_role not in ('','service_role') then
    raise exception 'Season activation is restricted to trusted operations';
  end if;
  perform pg_advisory_xact_lock(hashtext('cosmic-scrap-ranked-season-rollover'));

  update public.ranked_seasons set status='completed'
    where status='active' and ends_at <= now();
  update public.ranked_seasons set status='completed'
    where status='scheduled' and ends_at <= now();

  if exists(select 1 from public.ranked_seasons where status='active') then
    return jsonb_build_object('status','active','season_id',
      (select id from public.ranked_seasons where status='active' limit 1));
  end if;

  select * into v_next from public.ranked_seasons
    where status='scheduled' and starts_at <= now() and ends_at > now()
    order by starts_at limit 1 for update;
  if not found then return jsonb_build_object('status','no_current_season'); end if;

  select * into v_previous from public.ranked_seasons
    where status='completed' and ends_at <= v_next.starts_at
    order by ends_at desc limit 1;
  update public.ranked_seasons set status='active' where id=v_next.id;

  if found and v_previous.id is not null then
    insert into public.player_season_rank_stats(season_id,user_id,rating)
      select v_next.id,user_id,greatest(100,least(100000,1000+round((rating-1000)*0.70)::integer))
      from public.player_season_rank_stats where season_id=v_previous.id
    on conflict(season_id,user_id) do nothing;
  end if;

  return jsonb_build_object('status','activated','season_id',v_next.id,
    'previous_season_id',v_previous.id,'carried_rating',v_previous.id is not null);
end;
$$;
revoke all on function public.activate_ranked_seasons() from public,anon,authenticated;
grant execute on function public.activate_ranked_seasons() to service_role;

-- Schedule the next season before the current one expires; the rollover job applies the soft reset.
insert into public.ranked_seasons(season_key,starts_at,ends_at,status)
select '2026-november-s2', ends_at, ends_at + interval '35 days', 'scheduled'
from public.ranked_seasons
where season_key='2026-october-s1'
  and not exists(select 1 from public.ranked_seasons where season_key='2026-november-s2');

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'cosmic-scrap-ranked-season-rollover',
  '*/5 * * * *',
  'select public.activate_ranked_seasons();'
);
