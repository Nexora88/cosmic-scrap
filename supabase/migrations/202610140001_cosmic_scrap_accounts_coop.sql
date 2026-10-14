-- Cosmic Scrap account/profile + room foundation.
-- Applied to the dedicated Cosmic Scrap Supabase project; safe to re-run.
-- Never place service_role/secret keys in this public browser game.

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 20 and username ~ '^[A-Za-z0-9_]+$'),
  avatar_id text not null default 'core-blue' check (avatar_id in ('core-blue','core-violet','core-amber','core-mint')),
  rocket_id text not null default 'starter' check (rocket_id in ('starter','comet','wraith','nova')),
  trophies integer not null default 0 check (trophies >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coop_rooms (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  guest_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting','ready','playing','finished','closed')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  check (guest_user_id is null or guest_user_id <> host_user_id)
);

create index if not exists coop_rooms_status_created_idx on public.coop_rooms(status, created_at);
create index if not exists coop_rooms_host_idx on public.coop_rooms(host_user_id);
create index if not exists coop_rooms_guest_idx on public.coop_rooms(guest_user_id);

alter table public.player_profiles enable row level security;
alter table public.coop_rooms enable row level security;

drop policy if exists "Profiles are readable by signed-in players" on public.player_profiles;
create policy "Profiles are readable by signed-in players"
  on public.player_profiles for select to authenticated using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile"
  on public.player_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile"
  on public.player_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Room membership is visible only to its host/guest. Creation and joining should
-- be mediated by validated RPC/Edge Functions before enabling public matchmaking.
drop policy if exists "Room members can read their room" on public.coop_rooms;
create policy "Room members can read their room"
  on public.coop_rooms for select to authenticated
  using ((select auth.uid()) = host_user_id or (select auth.uid()) = guest_user_id);

-- Deliberately no direct client INSERT/UPDATE/DELETE policies for rooms yet.
-- Add server-validated functions for invite creation, atomic join, expiry and
-- host handoff before enabling matchmaking. This avoids invite-code races and
-- arbitrary room takeover from an untrusted browser.

create or replace function public.create_player_profile()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  base_name text;
  safe_name text;
begin
  base_name := coalesce(new.raw_user_meta_data ->> 'username', 'pilot_' || substr(new.id::text, 1, 8));
  safe_name := regexp_replace(base_name, '[^A-Za-z0-9_]', '', 'g');
  safe_name := substr(safe_name, 1, 20);
  if char_length(safe_name) < 3 then
    safe_name := 'pilot_' || substr(new.id::text, 1, 8);
  end if;
  insert into public.player_profiles(user_id, username)
  values (new.id, safe_name)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_cosmic_scrap on auth.users;
create trigger on_auth_user_created_cosmic_scrap
  after insert on auth.users
  for each row execute function public.create_player_profile();
