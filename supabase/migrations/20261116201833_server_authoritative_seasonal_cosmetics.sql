-- Server-authoritative seasonal cosmetic rewards.
-- Reward eligibility is derived only from server-maintained ranked season stats.
create table if not exists public.season_cosmetic_rewards (
  season_id uuid not null references public.ranked_seasons(id) on delete cascade,
  reward_key text not null,
  cosmetic_type text not null check (cosmetic_type in ('trail','projectile','ship','flag')),
  cosmetic_value text not null,
  display_name text not null,
  rarity text not null check (rarity in ('rare','epic','legendary')),
  min_wins integer not null check (min_wins > 0),
  min_matches integer not null check (min_matches >= min_wins),
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (season_id, reward_key),
  check (
    (cosmetic_type = 'trail' and cosmetic_value in ('rainbow','red-white')) or
    (cosmetic_type = 'projectile' and cosmetic_value in ('star','plasma')) or
    (cosmetic_type = 'ship' and cosmetic_value in ('neon-outline','comet-frame','eclipse-frame')) or
    (cosmetic_type = 'flag' and cosmetic_value in ('🇹🇷🔥','🇦🇿','🇺🇸','🇬🇧','🇩🇪','🇯🇵','🇧🇷','🇫🇷','🇮🇳'))
  )
);
create table if not exists public.player_cosmetic_inventory (
  inventory_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid not null,
  reward_key text not null,
  cosmetic_type text not null,
  cosmetic_value text not null,
  display_name text not null,
  rarity text not null,
  granted_at timestamptz not null default now(),
  unique (user_id, season_id, reward_key),
  foreign key (season_id, reward_key) references public.season_cosmetic_rewards(season_id, reward_key) on delete restrict
);
alter table public.season_cosmetic_rewards enable row level security;
alter table public.player_cosmetic_inventory enable row level security;
drop policy if exists "Signed-in pilots can read seasonal reward catalog" on public.season_cosmetic_rewards;
create policy "Signed-in pilots can read seasonal reward catalog" on public.season_cosmetic_rewards for select to authenticated using (true);
drop policy if exists "Pilots can read their own cosmetic inventory" on public.player_cosmetic_inventory;
create policy "Pilots can read their own cosmetic inventory" on public.player_cosmetic_inventory for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.season_cosmetic_rewards from anon, authenticated;
grant select on public.season_cosmetic_rewards to authenticated;
revoke all on public.player_cosmetic_inventory from anon, authenticated;
grant select on public.player_cosmetic_inventory to authenticated;
create or replace function public.claim_season_cosmetic(p_reward_key text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_season public.ranked_seasons;
  v_reward public.season_cosmetic_rewards;
  v_stats public.player_season_rank_stats;
  v_inventory public.player_cosmetic_inventory;
  v_inserted integer := 0;
begin
  if v_user is null then raise exception 'Sign in to claim seasonal cosmetics'; end if;
  if p_reward_key is null or length(p_reward_key) > 64 then raise exception 'Invalid seasonal reward'; end if;
  select * into v_season from public.ranked_seasons s
    where s.status='active' and s.starts_at<=now() and s.ends_at>now()
    order by s.starts_at desc limit 1;
  if not found then raise exception 'There is no active ranked season'; end if;
  select * into v_reward from public.season_cosmetic_rewards r
    where r.season_id=v_season.id and r.reward_key=p_reward_key and r.enabled=true;
  if not found then raise exception 'Seasonal reward is unavailable'; end if;
  select * into v_stats from public.player_season_rank_stats s
    where s.season_id=v_season.id and s.user_id=v_user;
  if not found or v_stats.wins<v_reward.min_wins or v_stats.matches<v_reward.min_matches then
    raise exception 'You have not met the ranked season requirement';
  end if;
  insert into public.player_cosmetic_inventory
    (user_id,season_id,reward_key,cosmetic_type,cosmetic_value,display_name,rarity)
  values (v_user,v_season.id,v_reward.reward_key,v_reward.cosmetic_type,v_reward.cosmetic_value,v_reward.display_name,v_reward.rarity)
  on conflict (user_id,season_id,reward_key) do nothing;
  get diagnostics v_inserted=row_count;
  select * into v_inventory from public.player_cosmetic_inventory i
    where i.user_id=v_user and i.season_id=v_season.id and i.reward_key=p_reward_key;
  return jsonb_build_object(
    'status',case when v_inserted=1 then 'claimed' else 'already_owned' end,
    'season_id',v_inventory.season_id,'reward_key',v_inventory.reward_key,
    'inventory_id',v_inventory.inventory_id,'cosmetic_type',v_inventory.cosmetic_type,
    'cosmetic_value',v_inventory.cosmetic_value,'display_name',v_inventory.display_name,
    'rarity',v_inventory.rarity,'granted_at',v_inventory.granted_at
  );
end;
$$;
revoke all on function public.claim_season_cosmetic(text) from public, anon;
grant execute on function public.claim_season_cosmetic(text) to authenticated;
insert into public.season_cosmetic_rewards
  (season_id,reward_key,cosmetic_type,cosmetic_value,display_name,rarity,min_wins,min_matches,sort_order)
select s.id,r.reward_key,r.cosmetic_type,r.cosmetic_value,r.display_name,r.rarity,r.min_wins,r.min_matches,r.sort_order
from public.ranked_seasons s
cross join (values
  ('nebula-trail','trail','rainbow','Nebula Trail','rare',3,3,10),
  ('solar-plasma','projectile','plasma','Solar Plasma','epic',10,10,20),
  ('eclipse-frame','ship','eclipse-frame','Eclipse Frame','legendary',25,25,30)
) as r(reward_key,cosmetic_type,cosmetic_value,display_name,rarity,min_wins,min_matches,sort_order)
where s.season_key in ('2026-october-s1','2026-november-s2')
on conflict (season_id,reward_key) do nothing;