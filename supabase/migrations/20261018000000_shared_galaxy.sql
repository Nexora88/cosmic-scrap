-- Shared account-bound galaxy; all mutations pass through authenticated RPCs.
create table if not exists public.galaxy_sectors (
 sector_id smallint primary key check (sector_id between 0 and 24),
 owner_user_id uuid references auth.users(id) on delete set null,
 faction text not null default 'neutral' check (faction in ('neutral','player','scrapborn','void')),
 settlement_name text not null default '',
 population integer not null default 0 check (population between 0 and 100000000),
 tower_type text check (tower_type is null or tower_type in ('pulse','rail','shield')),
 is_home boolean not null default false,
 updated_at timestamptz not null default now(),
 check (not is_home or (owner_user_id is not null and faction='player'))
);
create unique index if not exists galaxy_one_home_per_player on public.galaxy_sectors(owner_user_id) where is_home;
create table if not exists public.galaxy_player_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 resources integer not null default 260 check(resources between 0 and 100000000),
 updated_at timestamptz not null default now()
);
create table if not exists public.galaxy_alliances (
 id uuid primary key default gen_random_uuid(),
 player_a uuid not null references auth.users(id) on delete cascade,
 player_b uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted')),
 created_at timestamptz not null default now(), accepted_at timestamptz,
 check(player_a <> player_b), unique(player_a,player_b)
);
create index if not exists galaxy_alliance_a_idx on public.galaxy_alliances(player_a);
create index if not exists galaxy_alliance_b_idx on public.galaxy_alliances(player_b);

alter table public.galaxy_sectors enable row level security;
alter table public.galaxy_player_state enable row level security;
alter table public.galaxy_alliances enable row level security;
drop policy if exists "Authenticated players can view shared galaxy" on public.galaxy_sectors;
create policy "Authenticated players can view shared galaxy" on public.galaxy_sectors for select to authenticated using(true);
drop policy if exists "Players can read own galaxy resources" on public.galaxy_player_state;
create policy "Players can read own galaxy resources" on public.galaxy_player_state for select to authenticated using((select auth.uid())=user_id);
drop policy if exists "Players can read their own alliances" on public.galaxy_alliances;
create policy "Players can read their own alliances" on public.galaxy_alliances for select to authenticated using((select auth.uid())=player_a or (select auth.uid())=player_b);
revoke insert,update,delete on public.galaxy_sectors,public.galaxy_player_state,public.galaxy_alliances from anon,authenticated;
grant select on public.galaxy_sectors,public.galaxy_player_state,public.galaxy_alliances to authenticated;

create or replace function public.galaxy_get_state() returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); sid smallint; uname text; result jsonb;
begin
 if u is null then raise exception 'Sign in to enter the shared galaxy'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,91027));
 insert into public.galaxy_sectors(sector_id,faction,settlement_name,population)
 select i,case when i in(0,4,20,24) then 'void' when i in(2,7,17,22) then 'scrapborn' else 'neutral' end,
 case when i in(0,4,20,24) then 'Boşluk Karakolu' when i in(2,7,17,22) then 'Hurda Karakolu' else '' end,
 case when i in(0,4,20,24,2,7,17,22) then 8 else 0 end
 from generate_series(0,24) as g(i) on conflict(sector_id) do nothing;
 insert into public.galaxy_player_state(user_id) values(u) on conflict(user_id) do nothing;
 if not exists(select 1 from public.galaxy_sectors where owner_user_id=u and is_home) then
  select sector_id into sid from public.galaxy_sectors where faction='neutral' and owner_user_id is null and not is_home
  order by abs((sector_id%5)-2)+abs((sector_id/5)-2),sector_id for update skip locked limit 1;
  if sid is null then raise exception 'No unclaimed home sector is available'; end if;
  select username into uname from public.player_profiles where user_id=u;
  update public.galaxy_sectors set owner_user_id=u,faction='player',is_home=true,
   settlement_name=coalesce(uname,'Yeni Koloni')||' Üssü',population=24,updated_at=now() where sector_id=sid;
 end if;
 select jsonb_build_object(
  'sectors',(select coalesce(jsonb_agg(jsonb_build_object('sector_id',s.sector_id,'owner_user_id',s.owner_user_id,'faction',s.faction,
   'owner_name',coalesce(p.username,case s.faction when 'scrapborn' then 'Hurda Doğanlar' when 'void' then 'Boşluk Hanedanı' when 'neutral' then 'Tarafsız Sektör' else 'Koloni Pilotu' end),
   'settlement_name',s.settlement_name,'population',s.population,'tower_type',s.tower_type,'is_home',s.is_home) order by s.sector_id),'[]'::jsonb)
   from public.galaxy_sectors s left join public.player_profiles p on p.user_id=s.owner_user_id),
  'resources',(select resources from public.galaxy_player_state where user_id=u),
  'alliances',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'status',a.status,'other_user_id',case when a.player_a=u then a.player_b else a.player_a end,
   'other_name',coalesce(p.username,'Koloni Pilotu'))),'[]'::jsonb) from public.galaxy_alliances a
   left join public.player_profiles p on p.user_id=case when a.player_a=u then a.player_b else a.player_a end where a.player_a=u or a.player_b=u)
 ) into result;
 return result;
end $$;

create or replace function public.galaxy_claim_sector(p_sector_id integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); target public.galaxy_sectors%rowtype; remaining integer;
begin
 if u is null then raise exception 'Sign in first'; end if;
 if p_sector_id<0 or p_sector_id>24 then raise exception 'Invalid sector'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,91027));
 select * into target from public.galaxy_sectors where sector_id=p_sector_id for update;
 if not found or target.faction<>'neutral' or target.owner_user_id is not null or target.is_home then raise exception 'Only neutral sectors can be settled'; end if;
 if not exists(select 1 from public.galaxy_sectors s where s.owner_user_id=u and abs((s.sector_id%5)-(p_sector_id%5))+abs((s.sector_id/5)-(p_sector_id/5))=1) then raise exception 'Expand only to an adjacent sector'; end if;
 update public.galaxy_player_state set resources=resources-80,updated_at=now() where user_id=u and resources>=80 returning resources into remaining;
 if remaining is null then raise exception 'Not enough scrap (80 required)'; end if;
 update public.galaxy_sectors set owner_user_id=u,faction='player',settlement_name='Yeni Yerleşim',population=5,updated_at=now() where sector_id=p_sector_id;
 return public.galaxy_get_state();
end $$;

create or replace function public.galaxy_build(p_sector_id integer,p_action text,p_tower text default null) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); cost integer; remaining integer;
begin
 if u is null then raise exception 'Sign in first'; end if;
 if p_sector_id<0 or p_sector_id>24 then raise exception 'Invalid sector'; end if;
 if p_action='settlement' then cost:=160;
 elsif p_action='tower' and p_tower in('pulse','rail','shield') then cost:=case p_tower when 'pulse' then 90 when 'rail' then 130 else 110 end;
 else raise exception 'Invalid construction order'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,91027));
 if not exists(select 1 from public.galaxy_sectors where sector_id=p_sector_id and owner_user_id=u) then raise exception 'Build only in your own sector'; end if;
 if p_action='settlement' and exists(select 1 from public.galaxy_sectors where sector_id=p_sector_id and settlement_name<>'') then raise exception 'A settlement already exists'; end if;
 if p_action='tower' and exists(select 1 from public.galaxy_sectors where sector_id=p_sector_id and tower_type is not null) then raise exception 'A tower already exists'; end if;
 update public.galaxy_player_state set resources=resources-cost,updated_at=now() where user_id=u and resources>=cost returning resources into remaining;
 if remaining is null then raise exception 'Not enough scrap'; end if;
 update public.galaxy_sectors set tower_type=case when p_action='tower' then p_tower else tower_type end,
 settlement_name=case when p_action='settlement' then 'Yeni Yerleşim' else settlement_name end,
 population=case when p_action='settlement' then greatest(population,5) else population end,updated_at=now() where sector_id=p_sector_id;
 return public.galaxy_get_state();
end $$;

create or replace function public.galaxy_alliance_request(p_target_user_id uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); aid uuid; st text; a uuid; b uuid;
begin
 if u is null then raise exception 'Sign in first'; end if;
 if p_target_user_id is null or p_target_user_id=u then raise exception 'Invalid alliance target'; end if;
 if not exists(select 1 from public.galaxy_sectors where owner_user_id=p_target_user_id) then raise exception 'That pilot has no colony in this galaxy'; end if;
 if exists(select 1 from public.galaxy_alliances where status='accepted' and ((player_a=u and player_b=p_target_user_id) or (player_a=p_target_user_id and player_b=u))) then
  delete from public.galaxy_alliances where (player_a=u and player_b=p_target_user_id) or (player_a=p_target_user_id and player_b=u);
  return public.galaxy_get_state();
 end if;
 select id,status,player_a,player_b into aid,st,a,b from public.galaxy_alliances
 where (player_a=u and player_b=p_target_user_id) or (player_a=p_target_user_id and player_b=u) for update;
 if aid is not null and st='pending' and a=p_target_user_id and b=u then
  update public.galaxy_alliances set status='accepted',accepted_at=now() where id=aid;
 elsif aid is null then insert into public.galaxy_alliances(player_a,player_b) values(u,p_target_user_id);
 else raise exception 'Alliance request already exists or awaits a response'; end if;
 return public.galaxy_get_state();
end $$;

revoke all on function public.galaxy_get_state() from public,anon;
revoke all on function public.galaxy_claim_sector(integer) from public,anon;
revoke all on function public.galaxy_build(integer,text,text) from public,anon;
revoke all on function public.galaxy_alliance_request(uuid) from public,anon;
grant execute on function public.galaxy_get_state() to authenticated;
grant execute on function public.galaxy_claim_sector(integer) to authenticated;
grant execute on function public.galaxy_build(integer,text,text) to authenticated;
grant execute on function public.galaxy_alliance_request(uuid) to authenticated;

do $$
begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='galaxy_sectors') then alter publication supabase_realtime add table public.galaxy_sectors; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='galaxy_alliances') then alter publication supabase_realtime add table public.galaxy_alliances; end if;
 end if;
end $$;
