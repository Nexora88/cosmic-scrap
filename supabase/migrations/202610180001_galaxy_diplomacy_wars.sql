-- Persistent diplomacy, autonomous NPC incidents, and authoritative wars for the shared galaxy.
alter table public.galaxy_sectors
  add column if not exists army integer not null default 8 check (army between 0 and 1000000),
  add column if not exists stability integer not null default 80 check (stability between 0 and 100),
  add column if not exists base_level integer not null default 0 check (base_level between 0 and 10);

alter table public.galaxy_player_state
  add column if not exists last_npc_event_at timestamptz;

create table if not exists public.galaxy_events (
  id bigint generated always as identity primary key,
  player_id uuid references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('system','diplomacy','war','construction','revolt')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists galaxy_events_player_created_idx on public.galaxy_events(player_id,created_at desc);
alter table public.galaxy_events enable row level security;
drop policy if exists "Players read galaxy events" on public.galaxy_events;
create policy "Players read galaxy events" on public.galaxy_events for select to authenticated
  using (player_id is null or player_id=(select auth.uid()));
grant select on public.galaxy_events to authenticated;

create table if not exists public.galaxy_diplomacy_offers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users(id) on delete cascade,
  faction text not null check (faction in ('scrapborn','void')),
  offer_type text not null check (offer_type in ('trade','non_aggression','tribute')),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','expired')),
  message text not null,
  resource_delta integer not null default 0 check (resource_delta between -500 and 500),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '15 minutes',
  resolved_at timestamptz
);
create index if not exists galaxy_offers_player_status_idx on public.galaxy_diplomacy_offers(player_id,status,created_at desc);
alter table public.galaxy_diplomacy_offers enable row level security;
drop policy if exists "Players read their diplomacy offers" on public.galaxy_diplomacy_offers;
create policy "Players read their diplomacy offers" on public.galaxy_diplomacy_offers for select to authenticated using(player_id=(select auth.uid()));
grant select on public.galaxy_diplomacy_offers to authenticated;

create table if not exists public.galaxy_wars (
  id uuid primary key default gen_random_uuid(),
  attacker_user_id uuid references auth.users(id) on delete cascade,
  defender_user_id uuid references auth.users(id) on delete cascade,
  attacker_faction text not null check(attacker_faction in ('player','scrapborn','void')),
  defender_faction text not null check(defender_faction in ('player','scrapborn','void')),
  attacker_sector smallint not null references public.galaxy_sectors(sector_id),
  defender_sector smallint not null references public.galaxy_sectors(sector_id),
  status text not null default 'resolved' check(status in ('active','resolved')),
  outcome text not null check(outcome in ('attacker_victory','defender_victory')),
  report text not null,
  created_at timestamptz not null default now(),
  check(attacker_sector<>defender_sector)
);
alter table public.galaxy_wars enable row level security;
drop policy if exists "Players read galaxy war reports" on public.galaxy_wars;
create policy "Players read galaxy war reports" on public.galaxy_wars for select to authenticated
 using(attacker_user_id=(select auth.uid()) or defender_user_id=(select auth.uid()) or (attacker_user_id is null and defender_user_id is null));
grant select on public.galaxy_wars to authenticated;

create or replace function public.galaxy_get_diplomacy()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Sign in to access galactic diplomacy'; end if;
 update public.galaxy_diplomacy_offers set status='expired',resolved_at=now()
   where player_id=u and status='pending' and expires_at<now();
 select jsonb_build_object(
  'offers',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'faction',o.faction,'offer_type',o.offer_type,'status',o.status,'message',o.message,'resource_delta',o.resource_delta,'created_at',o.created_at,'expires_at',o.expires_at) order by o.created_at desc),'[]'::jsonb) from public.galaxy_diplomacy_offers o where o.player_id=u and o.created_at>now()-interval '7 days'),
  'events',(select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'event_type',e.event_type,'title',e.title,'body',e.body,'created_at',e.created_at) order by e.created_at desc),'[]'::jsonb) from public.galaxy_events e where (e.player_id is null or e.player_id=u) and e.created_at>now()-interval '7 days'),
  'wars',(select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'attacker_faction',w.attacker_faction,'defender_faction',w.defender_faction,'attacker_sector',w.attacker_sector,'defender_sector',w.defender_sector,'outcome',w.outcome,'report',w.report,'created_at',w.created_at) order by w.created_at desc),'[]'::jsonb) from public.galaxy_wars w where w.attacker_user_id=u or w.defender_user_id=u order by w.created_at desc limit 12)
 ) into result;
 return result;
end $$;

create or replace function public.galaxy_tick_bots()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); last_at timestamptz; roll integer; offer_id uuid; target public.galaxy_sectors%rowtype; attacker public.galaxy_sectors%rowtype; atk integer; def integer; winner text;
begin
 if u is null then raise exception 'Sign in to enter the shared galaxy'; end if;
 perform pg_advisory_xact_lock(81273391);
 insert into public.galaxy_player_state(user_id) values(u) on conflict(user_id) do nothing;
 select last_npc_event_at into last_at from public.galaxy_player_state where user_id=u for update;
 if last_at is not null and last_at>now()-interval '60 seconds' then return public.galaxy_get_diplomacy(); end if;
 update public.galaxy_player_state set last_npc_event_at=now(),updated_at=now() where user_id=u;
 -- Diplomacy is generated server-side and persisted, never fabricated by the UI.
 if not exists(select 1 from public.galaxy_diplomacy_offers where player_id=u and status='pending' and expires_at>now()) then
  roll:=floor(random()*3)::integer;
  insert into public.galaxy_diplomacy_offers(player_id,faction,offer_type,message,resource_delta)
  values(u,case when random()<0.5 then 'scrapborn' else 'void' end,
   case roll when 0 then 'trade' when 1 then 'non_aggression' else 'tribute' end,
   case roll when 0 then 'Ticaret heyeti: güvenli bir koridor karşılığında hurda paylaşalım.' when 1 then 'Diplomatik teklif: sınırlarımızda 15 dakika saldırmazlık anlaşması öneriyoruz.' else 'Ultimatom: sınır karakolumuzu tanıyın ve haraç ödemesi üzerine görüşelim.' end,
   case roll when 0 then 35 when 1 then 0 else -25 end)
  returning id into offer_id;
  insert into public.galaxy_events(player_id,event_type,title,body)
  select u,'diplomacy','Yeni diplomatik mesaj',message from public.galaxy_diplomacy_offers where id=offer_id;
 else
  insert into public.galaxy_events(player_id,event_type,title,body)
  values(u,'system','Galaktik istihbarat','Sensörler sınır bölgelerinde hareketlilik saptadı. Üslerini güçlendir ve diplomatik tekliflerini kontrol et.');
 end if;
 -- NPC forces may attack an exposed non-home colony. All results are written in the shared DB.
 select * into target from public.galaxy_sectors s
  where s.owner_user_id=u and not s.is_home
  and exists(select 1 from public.galaxy_sectors b where b.faction in ('scrapborn','void') and b.owner_user_id is null
   and abs((b.sector_id%5)-(s.sector_id%5))+abs((b.sector_id/5)-(s.sector_id/5))=1)
  order by random() limit 1 for update skip locked;
 if found and random()<0.12 then
  select * into attacker from public.galaxy_sectors b where b.faction in ('scrapborn','void') and b.owner_user_id is null
   and abs((b.sector_id%5)-(target.sector_id%5))+abs((b.sector_id/5)-(target.sector_id/5))=1 order by random() limit 1 for update;
  if found then
   atk:=attacker.army+floor(random()*10)::integer;
   def:=target.army+target.base_level*5+case when target.tower_type is not null then 12 else 0 end+floor(random()*10)::integer;
   if atk>def then
    update public.galaxy_sectors set owner_user_id=null,faction=attacker.faction,settlement_name=case attacker.faction when 'void' then 'Boşluk İşgal Bölgesi' else 'Hurda İşgal Bölgesi' end,population=greatest(0,floor(target.population*0.55)::integer),tower_type=null,army=greatest(2,atk-def),base_level=0,stability=35,updated_at=now() where sector_id=target.sector_id;
    winner:='attacker_victory';
   else
    update public.galaxy_sectors set army=greatest(1,def-floor(atk*0.25)::integer),stability=greatest(0,stability-8),updated_at=now() where sector_id=target.sector_id;
    winner:='defender_victory';
   end if;
   insert into public.galaxy_wars(attacker_user_id,defender_user_id,attacker_faction,defender_faction,attacker_sector,defender_sector,status,outcome,report)
   values(null,u,attacker.faction,'player',attacker.sector_id,target.sector_id,'resolved',winner,
    case winner when 'attacker_victory' then 'Bot orduları '||target.settlement_name||' bölgesini ele geçirdi.' else target.settlement_name||' savunması saldırıyı püskürttü.' end);
   insert into public.galaxy_events(player_id,event_type,title,body)
   values(u,'war','Sınır çatışması',case winner when 'attacker_victory' then 'UYARI: '||target.settlement_name||' bot saldırısıyla kaybedildi.' else target.settlement_name||' savunması saldırıyı püskürttü; istikrar azaldı.' end);
  end if;
 end if;
 return public.galaxy_get_diplomacy();
end $$;

create or replace function public.galaxy_resolve_offer(p_offer_id uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); o public.galaxy_diplomacy_offers%rowtype; new_status text;
begin
 if u is null then raise exception 'Sign in first'; end if;
 select * into o from public.galaxy_diplomacy_offers where id=p_offer_id and player_id=u for update;
 if not found or o.status<>'pending' or o.expires_at<now() then raise exception 'Offer expired or already resolved'; end if;
 if p_accept and o.resource_delta<>0 then
  update public.galaxy_player_state set resources=greatest(0,least(100000000,resources+o.resource_delta)),updated_at=now()
   where user_id=u and (o.resource_delta>0 or resources>=abs(o.resource_delta));
  if not found then raise exception 'Not enough scrap to accept this tribute'; end if;
 end if;
 new_status:=case when p_accept then 'accepted' else 'rejected' end;
 update public.galaxy_diplomacy_offers set status=new_status,resolved_at=now() where id=o.id;
 insert into public.galaxy_events(player_id,event_type,title,body)
 values(u,'diplomacy',case when p_accept then 'Teklif kabul edildi' else 'Teklif reddedildi' end,
  case when p_accept then 'Diplomatik teklif yanıtlandı; anlaşma galaktik kayda işlendi.' else 'Diplomatik teklif reddedildi; sınır ilişkileri gergin kalıyor.' end);
 return public.galaxy_get_state();
end $$;

create or replace function public.galaxy_declare_war(p_sector_id integer)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); target public.galaxy_sectors%rowtype; source public.galaxy_sectors%rowtype; atk integer; def integer; win boolean; losses integer; outcome text;
begin
 if u is null then raise exception 'Sign in first'; end if;
 if p_sector_id<0 or p_sector_id>24 then raise exception 'Invalid sector'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,91027));
 select * into target from public.galaxy_sectors where sector_id=p_sector_id for update;
 if not found or target.owner_user_id is not null or target.faction not in ('scrapborn','void') then raise exception 'Only bot-held sectors can be attacked'; end if;
 select * into source from public.galaxy_sectors s where s.owner_user_id=u
  and abs((s.sector_id%5)-(p_sector_id%5))+abs((s.sector_id/5)-(p_sector_id/5))=1
 order by s.army desc limit 1 for update;
 if not found then raise exception 'War requires an adjacent friendly base'; end if;
 if source.army<6 then raise exception 'At least 6 units are required to declare an attack'; end if;
 atk:=source.army+source.base_level*4+floor(random()*10)::integer;
 def:=target.army+target.base_level*4+case when target.tower_type is not null then 12 else 0 end+floor(random()*10)::integer;
 win:=atk>def;
 losses:=greatest(1,ceil(source.army*(case when win then 0.25 else 0.5 end))::integer);
 update public.galaxy_sectors set army=greatest(0,army-losses),updated_at=now() where sector_id=source.sector_id;
 if win then
  update public.galaxy_sectors set owner_user_id=u,faction='player',settlement_name='Fethedilen Üs',population=greatest(3,population),tower_type=null,army=greatest(2,atk-def),base_level=0,stability=55,updated_at=now() where sector_id=target.sector_id;
  update public.galaxy_player_state set resources=least(100000000,resources+35),updated_at=now() where user_id=u;
  outcome:='attacker_victory';
 else
  update public.galaxy_sectors set army=greatest(1,army-ceil(army*0.25)::integer),updated_at=now() where sector_id=target.sector_id;
  outcome:='defender_victory';
 end if;
 insert into public.galaxy_wars(attacker_user_id,defender_user_id,attacker_faction,defender_faction,attacker_sector,defender_sector,status,outcome,report)
 values(u,null,'player',target.faction,source.sector_id,target.sector_id,'resolved',outcome,
  case when win then 'Zafer! Bot üssü ele geçirildi; +35 hurda.' else 'Saldırı püskürtüldü. Birlikler kayıp verdi.' end);
 insert into public.galaxy_events(player_id,event_type,title,body)
 values(u,'war',case when win then 'Savaş zaferle sonuçlandı' else 'Saldırı püskürtüldü' end,
  case when win then 'Sektör '|| (p_sector_id+1)::text ||' ele geçirildi. +35 hurda.' else 'Sektör '||(p_sector_id+1)::text||' savunmada kaldı.' end);
 return public.galaxy_get_state();
end $$;

revoke all on function public.galaxy_get_diplomacy() from public,anon;
revoke all on function public.galaxy_tick_bots() from public,anon;
revoke all on function public.galaxy_resolve_offer(uuid,boolean) from public,anon;
revoke all on function public.galaxy_declare_war(integer) from public,anon;
grant execute on function public.galaxy_get_diplomacy() to authenticated;
grant execute on function public.galaxy_tick_bots() to authenticated;
grant execute on function public.galaxy_resolve_offer(uuid,boolean) to authenticated;
grant execute on function public.galaxy_declare_war(integer) to authenticated;

do $$
begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='galaxy_events') then alter publication supabase_realtime add table public.galaxy_events; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='galaxy_diplomacy_offers') then alter publication supabase_realtime add table public.galaxy_diplomacy_offers; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='galaxy_wars') then alter publication supabase_realtime add table public.galaxy_wars; end if;
 end if;
end $$;
