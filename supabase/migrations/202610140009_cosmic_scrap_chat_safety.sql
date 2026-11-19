
create table if not exists public.player_moderation (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','temp_banned','perma_banned')),
  banned_until timestamptz,
  reason text,
  is_moderator boolean not null default false,
  updated_at timestamptz not null default now(),
  check (status <> 'temp_banned' or banned_until is not null)
);
alter table public.player_moderation enable row level security;
drop policy if exists "players read own moderation status" on public.player_moderation;
create policy "players read own moderation status" on public.player_moderation for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.player_moderation from anon, authenticated;
grant select on public.player_moderation to authenticated;

create table if not exists public.player_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  check (blocker_user_id <> blocked_user_id)
);
alter table public.player_blocks enable row level security;
drop policy if exists "players view blocks involving themselves" on public.player_blocks;
create policy "players view blocks involving themselves" on public.player_blocks for select to authenticated using ((select auth.uid()) in (blocker_user_id, blocked_user_id));
drop policy if exists "players block others" on public.player_blocks;
create policy "players block others" on public.player_blocks for insert to authenticated with check ((select auth.uid()) = blocker_user_id);
drop policy if exists "players unblock others" on public.player_blocks;
create policy "players unblock others" on public.player_blocks for delete to authenticated using ((select auth.uid()) = blocker_user_id);
grant select, insert, delete on public.player_blocks to authenticated;

create table if not exists public.player_messages (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  room_id uuid references public.coop_rooms(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  check ((recipient_user_id is not null and room_id is null) or (recipient_user_id is null and room_id is not null)),
  check (recipient_user_id is null or recipient_user_id <> sender_user_id)
);
create index if not exists player_messages_dm_idx on public.player_messages(sender_user_id, recipient_user_id, created_at desc);
create index if not exists player_messages_room_idx on public.player_messages(room_id, created_at desc);
alter table public.player_messages enable row level security;
drop policy if exists "participants read messages" on public.player_messages;
create policy "participants read messages" on public.player_messages for select to authenticated using (
  (
    room_id is null and (sender_user_id = (select auth.uid()) or recipient_user_id = (select auth.uid()))
    and not exists (select 1 from public.player_blocks b where
      (b.blocker_user_id = sender_user_id and b.blocked_user_id = recipient_user_id)
      or (b.blocker_user_id = recipient_user_id and b.blocked_user_id = sender_user_id))
  )
  or
  (room_id is not null and exists (select 1 from public.coop_rooms r where r.id = room_id and (r.host_user_id = (select auth.uid()) or r.guest_user_id = (select auth.uid()))))
);
drop policy if exists "friends or room members send messages" on public.player_messages;
create policy "friends or room members send messages" on public.player_messages for insert to authenticated with check (
  sender_user_id = (select auth.uid())
  and (
    (room_id is null and recipient_user_id is not null
      and exists (select 1 from public.player_friends f where f.status = 'accepted'
        and ((f.requester_user_id = sender_user_id and f.target_user_id = recipient_user_id)
          or (f.requester_user_id = recipient_user_id and f.target_user_id = sender_user_id)))
      and not exists (select 1 from public.player_blocks b where
        (b.blocker_user_id = sender_user_id and b.blocked_user_id = recipient_user_id)
        or (b.blocker_user_id = recipient_user_id and b.blocked_user_id = sender_user_id))
    )
    or
    (room_id is not null and exists (select 1 from public.coop_rooms r where r.id = room_id and (r.host_user_id = sender_user_id or r.guest_user_id = sender_user_id) and r.guest_user_id is not null and r.status in ('ready','playing')))
  )
);
grant select, insert on public.player_messages to authenticated;

create table if not exists public.player_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid references public.coop_rooms(id) on delete set null,
  reason text not null check (reason in ('harassment','hate','profanity','spam','cheating','inappropriate_name','other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','reviewing','actioned','dismissed')),
  moderator_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check (reporter_user_id <> target_user_id)
);
create index if not exists player_reports_open_idx on public.player_reports(status, created_at desc);
alter table public.player_reports enable row level security;
drop policy if exists "players submit reports about others" on public.player_reports;
create policy "players submit reports about others" on public.player_reports for insert to authenticated with check (
  reporter_user_id = (select auth.uid()) and target_user_id <> (select auth.uid())
  and (select count(*) from public.player_reports r where r.reporter_user_id = (select auth.uid()) and r.created_at > now() - interval '1 hour') < 10
);
drop policy if exists "players read their own reports" on public.player_reports;
create policy "players read their own reports" on public.player_reports for select to authenticated using (reporter_user_id = (select auth.uid()));
revoke update, delete on public.player_reports from anon, authenticated;
grant select, insert on public.player_reports to authenticated;

create or replace function public.enforce_player_chat_safety()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  moderation public.player_moderation%rowtype;
  normalized text;
begin
  select * into moderation from public.player_moderation where user_id = new.sender_user_id;
  if moderation.status = 'perma_banned' or (moderation.status = 'temp_banned' and moderation.banned_until > now()) then
    raise exception 'CHAT_RESTRICTED: this account is currently suspended.';
  end if;
  normalized := lower(new.body);
  if normalized ~ '(^|[^[:alnum:]_])(amk|aq|siktir|orospu|pi[cç]|yarrak|ibne|fuck|fucking|shit|bitch|cunt|nigger|retard)([^[:alnum:]_]|$)' then
    raise exception 'CHAT_FILTER: please remove profanity and send a respectful message.';
  end if;
  if char_length(btrim(new.body)) = 0 then
    raise exception 'CHAT_EMPTY: message cannot be empty.';
  end if;
  return new;
end;
$$;
drop trigger if exists player_messages_safety_trigger on public.player_messages;
create trigger player_messages_safety_trigger before insert on public.player_messages for each row execute function public.enforce_player_chat_safety();

create or replace function public.moderate_player(
  p_target_user_id uuid,
  p_action text,
  p_duration_hours integer default null,
  p_reason text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  next_status text;
  next_until timestamptz;
begin
  if actor is null or not exists (select 1 from public.player_moderation m where m.user_id = actor and m.is_moderator) then
    raise exception 'MODERATION_FORBIDDEN';
  end if;
  if p_target_user_id = actor then raise exception 'CANNOT_MODERATE_SELF'; end if;
  if p_action = 'unban' then
    next_status := 'active'; next_until := null;
  elsif p_action = 'temp_ban' then
    if p_duration_hours is null or p_duration_hours < 1 or p_duration_hours > 720 then raise exception 'INVALID_BAN_DURATION'; end if;
    next_status := 'temp_banned'; next_until := now() + make_interval(hours => p_duration_hours);
  elsif p_action = 'perma_ban' then
    next_status := 'perma_banned'; next_until := null;
  else
    raise exception 'INVALID_MODERATION_ACTION';
  end if;
  insert into public.player_moderation(user_id,status,banned_until,reason,updated_at)
    values (p_target_user_id,next_status,next_until,left(coalesce(p_reason,''),500),now())
  on conflict (user_id) do update set status=excluded.status,banned_until=excluded.banned_until,reason=excluded.reason,updated_at=now();
  return jsonb_build_object('user_id',p_target_user_id,'status',next_status,'banned_until',next_until);
end;
$$;
revoke all on function public.moderate_player(uuid,text,integer,text) from public, anon;
grant execute on function public.moderate_player(uuid,text,integer,text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'player_messages'
  ) then
    alter publication supabase_realtime add table public.player_messages;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication is unavailable; enable it in Supabase Realtime settings.';
end $$;
