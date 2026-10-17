-- Persist shared Co-op outcomes for the two room participants only; no ranked rating is touched.
create table if not exists public.coop_match_stats (
  room_id uuid primary key references public.coop_rooms(id) on delete cascade,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  guest_user_id uuid not null references auth.users(id) on delete cascade,
  shared_score integer not null default 0 check (shared_score >= 0),
  shared_kills integer not null default 0 check (shared_kills >= 0),
  survival_seconds integer not null default 0 check (survival_seconds between 0 and 14400),
  team_lives_remaining integer not null default 0 check (team_lives_remaining between 0 and 3),
  finish_reason text not null check (finish_reason in ('team_eliminated','time_limit','abandoned')),
  finished_at timestamptz not null default now(),
  check (host_user_id <> guest_user_id)
);
create index if not exists coop_match_stats_host_finished_idx on public.coop_match_stats(host_user_id,finished_at desc);
create index if not exists coop_match_stats_guest_finished_idx on public.coop_match_stats(guest_user_id,finished_at desc);
alter table public.coop_match_stats enable row level security;
drop policy if exists "Room participants can read co-op stats" on public.coop_match_stats;
create policy "Room participants can read co-op stats" on public.coop_match_stats
  for select to authenticated using (
    (select auth.uid()) = host_user_id or (select auth.uid()) = guest_user_id
  );
revoke all on public.coop_match_stats from public, anon, authenticated;
grant select on public.coop_match_stats to authenticated;
