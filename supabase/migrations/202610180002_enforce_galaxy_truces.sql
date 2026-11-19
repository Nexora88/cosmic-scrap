-- Accepted non-aggression offers create a real server-enforced temporary truce.
create table if not exists public.galaxy_truces (
 player_id uuid not null references auth.users(id) on delete cascade,
 faction text not null check(faction in ('scrapborn','void')),
 expires_at timestamptz not null,
 source_offer_id uuid references public.galaxy_diplomacy_offers(id) on delete set null,
 created_at timestamptz not null default now(),
 primary key(player_id,faction)
);
alter table public.galaxy_truces enable row level security;
drop policy if exists "Players read their own truces" on public.galaxy_truces;
create policy "Players read their own truces" on public.galaxy_truces for select to authenticated using(player_id=(select auth.uid()));
grant select on public.galaxy_truces to authenticated;

create or replace function public.galaxy_tick_bots()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $body$
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
  and not exists(select 1 from public.galaxy_truces t where t.player_id=u and t.faction in (select b.faction from public.galaxy_sectors b where b.faction in ('scrapborn','void') and b.owner_user_id is null and abs((b.sector_id%5)-(s.sector_id%5))+abs((b.sector_id/5)-(s.sector_id/5))=1) and t.expires_at>now())
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
end $body$;
create or replace function public.galaxy_resolve_offer(p_offer_id uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $body$
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
 if p_accept and o.offer_type='non_aggression' then
  insert into public.galaxy_truces(player_id,faction,expires_at,source_offer_id)
  values(u,o.faction,now()+interval '15 minutes',o.id)
  on conflict(player_id,faction) do update set expires_at=excluded.expires_at,source_offer_id=excluded.source_offer_id;
 end if;
 insert into public.galaxy_events(player_id,event_type,title,body)
 values(u,'diplomacy',case when p_accept then 'Teklif kabul edildi' else 'Teklif reddedildi' end,
  case when p_accept then 'Diplomatik teklif yanıtlandı; anlaşma galaktik kayda işlendi.' else 'Diplomatik teklif reddedildi; sınır ilişkileri gergin kalıyor.' end);
 return public.galaxy_get_state();
end $body$;
revoke all on function public.galaxy_tick_bots() from public,anon;
revoke all on function public.galaxy_resolve_offer(uuid,boolean) from public,anon;
grant execute on function public.galaxy_tick_bots() to authenticated;
grant execute on function public.galaxy_resolve_offer(uuid,boolean) to authenticated;
