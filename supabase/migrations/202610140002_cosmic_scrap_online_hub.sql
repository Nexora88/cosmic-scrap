-- Online hub: invite rooms, level-banded matchmaking and personal-best leaderboard.
-- Run after 202610140001_cosmic_scrap_accounts_coop.sql.
alter table public.coop_rooms
  add column if not exists room_mode text not null default 'friend' check (room_mode in ('friend','ranked')),
  add column if not exists level_bracket integer not null default 1 check (level_bracket between 1 and 10),
  add column if not exists host_score integer not null default 0 check (host_score >= 0),
  add column if not exists guest_score integer not null default 0 check (guest_score >= 0),
  add column if not exists winner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists host_submitted boolean not null default false,
  add column if not exists guest_submitted boolean not null default false;

create table if not exists public.coop_matchmaking_queue (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level_bracket integer not null default 1 check (level_bracket between 1 and 10),
  rating integer not null default 1000 check (rating between 0 and 100000),
  queued_at timestamptz not null default now()
);
create index if not exists coop_queue_match_idx on public.coop_matchmaking_queue(level_bracket,rating,queued_at);

create table if not exists public.player_run_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  best_score integer not null default 0 check (best_score >= 0),
  best_level integer not null default 1 check (best_level between 1 and 1000),
  best_survival_seconds integer not null default 0 check (best_survival_seconds between 0 and 14400),
  updated_at timestamptz not null default now()
);
alter table public.player_run_records enable row level security;
drop policy if exists "Leaderboard records are publicly readable" on public.player_run_records;
create policy "Leaderboard records are publicly readable" on public.player_run_records
  for select to anon,authenticated using (true);

create or replace function public.submit_run_record(p_score integer,p_level integer,p_survival_seconds integer)
returns public.player_run_records language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_record public.player_run_records;
begin
  if v_user is null then raise exception 'Sign in is required to submit an online record'; end if;
  if p_score is null or p_level is null or p_survival_seconds is null or p_score<0 or p_score>2000000000
    or p_level<1 or p_level>1000 or p_survival_seconds<0 or p_survival_seconds>14400
    or p_score>(p_survival_seconds+60)*50000 then raise exception 'Run result is outside allowed limits'; end if;
  insert into public.player_run_records(user_id,best_score,best_level,best_survival_seconds,updated_at)
    values(v_user,p_score,p_level,p_survival_seconds,now())
  on conflict(user_id) do update set
    best_score=greatest(public.player_run_records.best_score,excluded.best_score),
    best_level=case when excluded.best_score>public.player_run_records.best_score then excluded.best_level else public.player_run_records.best_level end,
    best_survival_seconds=case when excluded.best_score>public.player_run_records.best_score then excluded.best_survival_seconds else public.player_run_records.best_survival_seconds end,
    updated_at=case when excluded.best_score>public.player_run_records.best_score then now() else public.player_run_records.updated_at end
  returning * into v_record;
  return v_record;
end; $$;
revoke all on function public.submit_run_record(integer,integer,integer) from public;
grant execute on function public.submit_run_record(integer,integer,integer) to authenticated;

create or replace function public.create_invite_room(p_level_bracket integer default 1)
returns public.coop_rooms language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_code text; v_room public.coop_rooms;
begin
  if v_user is null then raise exception 'Sign in to create an invite room'; end if;
  if p_level_bracket is null or p_level_bracket<1 or p_level_bracket>10 then raise exception 'Invalid level bracket'; end if;
  select * into v_room from public.coop_rooms where host_user_id=v_user and status in ('waiting','ready','playing') and expires_at>now() order by created_at desc limit 1;
  if found then return v_room; end if;
  delete from public.coop_rooms where expires_at<now() or status in ('closed','finished');
  loop v_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); exit when not exists(select 1 from public.coop_rooms where invite_code=v_code); end loop;
  insert into public.coop_rooms(invite_code,host_user_id,status,room_mode,level_bracket)
    values(v_code,v_user,'waiting','friend',p_level_bracket) returning * into v_room;
  return v_room;
end; $$;
revoke all on function public.create_invite_room(integer) from public;
grant execute on function public.create_invite_room(integer) to authenticated;

create or replace function public.join_invite_room(p_invite_code text)
returns public.coop_rooms language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_room public.coop_rooms;
begin
  if v_user is null then raise exception 'Sign in to join a room'; end if;
  if p_invite_code is null or p_invite_code !~ '^[A-Za-z0-9]{8}$' then raise exception 'Invite code is invalid'; end if;
  select * into v_room from public.coop_rooms where invite_code=upper(p_invite_code) and expires_at>now() for update;
  if not found then raise exception 'Invite not found or expired'; end if;
  if v_room.host_user_id=v_user then return v_room; end if;
  if v_room.guest_user_id is not null and v_room.guest_user_id<>v_user then raise exception 'This room is already full'; end if;
  if v_room.status not in ('waiting','ready') then raise exception 'This room is no longer accepting players'; end if;
  update public.coop_rooms set guest_user_id=v_user,status='ready' where id=v_room.id returning * into v_room;
  return v_room;
end; $$;
revoke all on function public.join_invite_room(text) from public;
grant execute on function public.join_invite_room(text) to authenticated;

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
    and abs(q.rating-p_rating)<=250 order by abs(q.level_bracket-p_level_bracket),abs(q.rating-p_rating),q.queued_at
    limit 1 for update skip locked;
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

create or replace function public.leave_ranked_queue()
returns boolean language plpgsql security definer set search_path=''
as $$ begin if auth.uid() is null then raise exception 'Sign in to leave matchmaking'; end if; delete from public.coop_matchmaking_queue where user_id=auth.uid(); return true; end; $$;
revoke all on function public.leave_ranked_queue() from public;
grant execute on function public.leave_ranked_queue() to authenticated;

create or replace function public.get_player_leaderboard(p_limit integer default 50)
returns table(username text,avatar_id text,best_score integer,best_level integer,best_survival_seconds integer,updated_at timestamptz)
language sql security definer set search_path='' stable
as $$ select p.username,p.avatar_id,r.best_score,r.best_level,r.best_survival_seconds,r.updated_at
 from public.player_run_records r join public.player_profiles p on p.user_id=r.user_id
 order by r.best_score desc,r.best_level desc,r.best_survival_seconds desc limit greatest(1,least(coalesce(p_limit,50),100)); $$;
revoke all on function public.get_player_leaderboard(integer) from public;
grant execute on function public.get_player_leaderboard(integer) to anon,authenticated;

create or replace function public.get_room_state(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path='' stable
as $$
declare v_user uuid:=auth.uid(); v_room public.coop_rooms;
begin
 if v_user is null then raise exception 'Sign in to view a room'; end if;
 select * into v_room from public.coop_rooms where id=p_room_id and (host_user_id=v_user or guest_user_id=v_user) and expires_at>now();
 if not found then raise exception 'Room not found, expired, or access denied'; end if;
 return jsonb_build_object('id',v_room.id,'invite_code',v_room.invite_code,'status',v_room.status,'room_mode',v_room.room_mode,
  'level_bracket',v_room.level_bracket,'host_user_id',v_room.host_user_id,'guest_user_id',v_room.guest_user_id,
  'host_score',v_room.host_score,'guest_score',v_room.guest_score,'host_submitted',v_room.host_submitted,
  'guest_submitted',v_room.guest_submitted,'winner_user_id',v_room.winner_user_id,'expires_at',v_room.expires_at);
end; $$;
revoke all on function public.get_room_state(uuid) from public;
grant execute on function public.get_room_state(uuid) to authenticated;
