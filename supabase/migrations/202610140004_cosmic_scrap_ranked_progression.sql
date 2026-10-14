-- Server-owned ranked progression. The browser cannot directly edit ratings or W/L/D.
create table if not exists public.player_rank_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating integer not null default 1000 check (rating between 100 and 100000),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  matches integer not null default 0 check (matches >= 0),
  updated_at timestamptz not null default now()
);
alter table public.player_rank_stats enable row level security;
drop policy if exists "Rank stats readable by signed-in pilots" on public.player_rank_stats;
create policy "Rank stats readable by signed-in pilots" on public.player_rank_stats for select to authenticated using (true);

create or replace function public.get_rank_stats()
returns public.player_rank_stats language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_stats public.player_rank_stats;
begin
 if v_user is null then raise exception 'Sign in to view ranked progress'; end if;
 insert into public.player_rank_stats(user_id) values(v_user) on conflict(user_id) do nothing;
 select * into v_stats from public.player_rank_stats where user_id=v_user;
 return v_stats;
end; $$;
revoke all on function public.get_rank_stats() from public;
grant execute on function public.get_rank_stats() to authenticated;

create or replace function public.join_ranked_queue(p_level_bracket integer default 1,p_rating integer default 1000)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_rating integer; v_other public.coop_matchmaking_queue; v_room public.coop_rooms; v_code text;
begin
 if v_user is null then raise exception 'Sign in to find an opponent'; end if;
 if p_level_bracket is null or p_level_bracket<1 or p_level_bracket>10 then raise exception 'Invalid level bracket'; end if;
 insert into public.player_rank_stats(user_id) values(v_user) on conflict(user_id) do nothing;
 select rating into v_rating from public.player_rank_stats where user_id=v_user;
 perform pg_advisory_xact_lock(hashtext('cosmic_scrap_ranked_queue'));
 insert into public.coop_matchmaking_queue(user_id,level_bracket,rating,queued_at) values(v_user,p_level_bracket,v_rating,now())
 on conflict(user_id) do update set level_bracket=excluded.level_bracket,rating=excluded.rating;
 select * into v_other from public.coop_matchmaking_queue q where q.user_id<>v_user
  and q.level_bracket between greatest(1,p_level_bracket-1) and least(10,p_level_bracket+1)
  and abs(q.rating-v_rating)<=250 order by abs(q.level_bracket-p_level_bracket),abs(q.rating-v_rating),q.queued_at
  limit 1 for update skip locked;
 if not found then return jsonb_build_object('status','waiting','message','Searching for a similar-level pilot…'); end if;
 delete from public.coop_matchmaking_queue where user_id in (v_user,v_other.user_id);
 loop v_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); exit when not exists(select 1 from public.coop_rooms where invite_code=v_code); end loop;
 insert into public.coop_rooms(invite_code,host_user_id,guest_user_id,status,room_mode,level_bracket,expires_at)
 values(v_code,v_other.user_id,v_user,'ready','ranked',greatest(1,least(10,round((v_other.level_bracket+p_level_bracket)::numeric/2)::integer)),now()+interval '30 minutes')
 returning * into v_room;
 return jsonb_build_object('status','matched','room_id',v_room.id,'invite_code',v_room.invite_code,'level_bracket',v_room.level_bracket,
 'host_user_id',v_room.host_user_id,'guest_user_id',v_room.guest_user_id);
end; $$;
revoke all on function public.join_ranked_queue(integer,integer) from public;
grant execute on function public.join_ranked_queue(integer,integer) to authenticated;

create or replace function public.submit_room_score(p_room_id uuid,p_score integer,p_level integer,p_survival_seconds integer)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_room public.coop_rooms;
begin
 if v_user is null then raise exception 'Sign in to submit a match result'; end if;
 if p_room_id is null or p_score is null or p_level is null or p_survival_seconds is null or p_score<0 or p_score>2000000000
  or p_level<1 or p_level>1000 or p_survival_seconds<0 or p_survival_seconds>14400 or p_score>(p_survival_seconds+60)*50000
 then raise exception 'Match result is outside allowed limits'; end if;
 select * into v_room from public.coop_rooms where id=p_room_id and (host_user_id=v_user or guest_user_id=v_user) and expires_at>now() for update;
 if not found then raise exception 'Match not found or access denied'; end if;
 if v_room.status not in ('ready','playing') then raise exception 'This match is not accepting results'; end if;
 if v_room.host_user_id=v_user then
  if v_room.host_submitted then raise exception 'Your score was already submitted'; end if;
  update public.coop_rooms set host_score=p_score,host_submitted=true,status='playing',started_at=coalesce(started_at,now()) where id=v_room.id returning * into v_room;
 else
  if v_room.guest_submitted then raise exception 'Your score was already submitted'; end if;
  update public.coop_rooms set guest_score=p_score,guest_submitted=true,status='playing',started_at=coalesce(started_at,now()) where id=v_room.id returning * into v_room;
 end if;
 if v_room.host_submitted and v_room.guest_submitted then
  update public.coop_rooms set status='finished',finished_at=now(),
   winner_user_id=case when host_score>guest_score then host_user_id when guest_score>host_score then guest_user_id else null end
   where id=v_room.id returning * into v_room;
  if v_room.room_mode='ranked' then
   insert into public.player_rank_stats(user_id) values(v_room.host_user_id),(v_room.guest_user_id) on conflict(user_id) do nothing;
   if v_room.host_score>v_room.guest_score then
    update public.player_rank_stats set rating=least(100000,rating+25),wins=wins+1,matches=matches+1,updated_at=now() where user_id=v_room.host_user_id;
    update public.player_rank_stats set rating=greatest(100,rating-20),losses=losses+1,matches=matches+1,updated_at=now() where user_id=v_room.guest_user_id;
   elsif v_room.guest_score>v_room.host_score then
    update public.player_rank_stats set rating=least(100000,rating+25),wins=wins+1,matches=matches+1,updated_at=now() where user_id=v_room.guest_user_id;
    update public.player_rank_stats set rating=greatest(100,rating-20),losses=losses+1,matches=matches+1,updated_at=now() where user_id=v_room.host_user_id;
   else
    update public.player_rank_stats set draws=draws+1,matches=matches+1,updated_at=now() where user_id in (v_room.host_user_id,v_room.guest_user_id);
   end if;
  end if;
 end if;
 return jsonb_build_object('status',v_room.status,'host_score',v_room.host_score,'guest_score',v_room.guest_score,
  'host_submitted',v_room.host_submitted,'guest_submitted',v_room.guest_submitted,'winner_user_id',v_room.winner_user_id);
end; $$;
revoke all on function public.submit_room_score(uuid,integer,integer,integer) from public;
grant execute on function public.submit_room_score(uuid,integer,integer,integer) to authenticated;
