-- Friend requests and asynchronous challenge results.
-- Run after 202610140002_cosmic_scrap_online_hub.sql.
create table if not exists public.player_friends (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  check (requester_user_id<>target_user_id),
  unique(requester_user_id,target_user_id)
);
create index if not exists player_friends_target_status_idx on public.player_friends(target_user_id,status);
alter table public.player_friends enable row level security;
drop policy if exists "Players can see their own friend requests" on public.player_friends;
create policy "Players can see their own friend requests" on public.player_friends
  for select to authenticated using ((select auth.uid())=requester_user_id or (select auth.uid())=target_user_id);

create or replace function public.send_friend_request(p_username text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_target uuid; v_friend public.player_friends;
begin
 if v_user is null then raise exception 'Sign in to add friends'; end if;
 if p_username is null or p_username !~ '^[A-Za-z0-9_]{3,20}$' then raise exception 'Enter a valid pilot name'; end if;
 select user_id into v_target from public.player_profiles where lower(username)=lower(p_username);
 if v_target is null then raise exception 'Pilot not found'; end if;
 if v_target=v_user then raise exception 'You are already the pilot you are looking for'; end if;
 select * into v_friend from public.player_friends where (requester_user_id=v_user and target_user_id=v_target) or (requester_user_id=v_target and target_user_id=v_user) limit 1;
 if found and v_friend.status='accepted' then return jsonb_build_object('status','accepted'); end if;
 if found and v_friend.target_user_id=v_user then
   update public.player_friends set status='accepted',accepted_at=now() where id=v_friend.id returning * into v_friend;
   return jsonb_build_object('status','accepted');
 end if;
 if found then return jsonb_build_object('status','pending'); end if;
 insert into public.player_friends(requester_user_id,target_user_id) values(v_user,v_target) returning * into v_friend;
 return jsonb_build_object('status','sent');
end; $$;
revoke all on function public.send_friend_request(text) from public;
grant execute on function public.send_friend_request(text) to authenticated;

create or replace function public.accept_friend_request(p_request_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$ begin
 if auth.uid() is null then raise exception 'Sign in to accept friend requests'; end if;
 update public.player_friends set status='accepted',accepted_at=now() where id=p_request_id and target_user_id=auth.uid() and status='pending';
 return found;
end; $$;
revoke all on function public.accept_friend_request(uuid) from public;
grant execute on function public.accept_friend_request(uuid) to authenticated;

create or replace function public.get_friends_leaderboard(p_limit integer default 50)
returns table(username text,avatar_id text,best_score integer,best_level integer,best_survival_seconds integer,updated_at timestamptz)
language sql security definer set search_path='' stable
as $$
 with friend_ids as (
   select auth.uid() as user_id
   union
   select case when f.requester_user_id=auth.uid() then f.target_user_id else f.requester_user_id end
   from public.player_friends f where f.status='accepted' and (f.requester_user_id=auth.uid() or f.target_user_id=auth.uid())
 )
 select p.username,p.avatar_id,r.best_score,r.best_level,r.best_survival_seconds,r.updated_at
 from friend_ids f join public.player_run_records r on r.user_id=f.user_id join public.player_profiles p on p.user_id=r.user_id
 order by r.best_score desc,r.best_level desc,r.best_survival_seconds desc limit greatest(1,least(coalesce(p_limit,50),100));
$$;
revoke all on function public.get_friends_leaderboard(integer) from public;
grant execute on function public.get_friends_leaderboard(integer) to authenticated;

create or replace function public.submit_room_score(p_room_id uuid,p_score integer,p_level integer,p_survival_seconds integer)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_room public.coop_rooms;
begin
 if v_user is null then raise exception 'Sign in to submit a match result'; end if;
 if p_room_id is null or p_score is null or p_level is null or p_survival_seconds is null
   or p_score<0 or p_score>2000000000 or p_level<1 or p_level>1000
   or p_survival_seconds<0 or p_survival_seconds>14400 or p_score>(p_survival_seconds+60)*50000
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
 end if;
 return jsonb_build_object('status',v_room.status,'host_score',v_room.host_score,'guest_score',v_room.guest_score,
  'host_submitted',v_room.host_submitted,'guest_submitted',v_room.guest_submitted,'winner_user_id',v_room.winner_user_id);
end; $$;
revoke all on function public.submit_room_score(uuid,integer,integer,integer) from public;
grant execute on function public.submit_room_score(uuid,integer,integer,integer) to authenticated;

create or replace function public.join_ranked_queue(p_level_bracket integer default 1,p_rating integer default 1000)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_other public.coop_matchmaking_queue; v_room public.coop_rooms; v_code text;
begin
 if v_user is null then raise exception 'Sign in to find an opponent'; end if;
 if p_level_bracket is null or p_level_bracket<1 or p_level_bracket>10 or p_rating is null or p_rating<0 or p_rating>100000 then raise exception 'Invalid matchmaking parameters'; end if;
 perform pg_advisory_xact_lock(hashtext('cosmic_scrap_ranked_queue'));
 insert into public.coop_matchmaking_queue(user_id,level_bracket,rating,queued_at) values(v_user,p_level_bracket,p_rating,now())
 on conflict(user_id) do update set level_bracket=excluded.level_bracket,rating=excluded.rating;
 select * into v_other from public.coop_matchmaking_queue q where q.user_id<>v_user
   and q.level_bracket between greatest(1,p_level_bracket-1) and least(10,p_level_bracket+1)
   and abs(q.rating-p_rating)<=250 order by abs(q.level_bracket-p_level_bracket),abs(q.rating-p_rating),q.queued_at limit 1 for update skip locked;
 if not found then return jsonb_build_object('status','waiting','message','Searching for a similar-level pilot…'); end if;
 delete from public.coop_matchmaking_queue where user_id in (v_user,v_other.user_id);
 loop v_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); exit when not exists(select 1 from public.coop_rooms where invite_code=v_code); end loop;
 insert into public.coop_rooms(invite_code,host_user_id,guest_user_id,status,room_mode,level_bracket,expires_at)
  values(v_code,v_other.user_id,v_user,'ready','ranked',greatest(1,least(10,round((v_other.level_bracket+p_level_bracket)::numeric/2)::integer)),now()+interval '30 minutes')
  returning * into v_room;
 return jsonb_build_object('status','matched','room_id',v_room.id,'invite_code',v_room.invite_code,'level_bracket',v_room.level_bracket,'host_user_id',v_room.host_user_id,'guest_user_id',v_room.guest_user_id);
end; $$;
revoke all on function public.join_ranked_queue(integer,integer) from public;
grant execute on function public.join_ranked_queue(integer,integer) to authenticated;
