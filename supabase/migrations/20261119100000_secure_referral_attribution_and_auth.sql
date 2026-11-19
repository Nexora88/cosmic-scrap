-- Username collisions must never abort auth.users insertion. A conflicting requested
-- handle receives a deterministic private fallback based on the new user UUID.
-- Referral codes are server-issued; signup metadata can only reference an existing
-- code. Rewards stay disabled until server-verified gameplay and anti-abuse checks exist.
create table if not exists public.player_referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique check (code ~ '^[a-f0-9]{12}$'),
  created_at timestamptz not null default now()
);
create table if not exists public.player_referral_attributions (
  referred_user_id uuid primary key references auth.users(id) on delete cascade,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  created_at timestamptz not null default now(),
  email_verified_at timestamptz,
  reward_state text not null default 'disabled_pending_server_validation'
    check (reward_state in ('disabled_pending_server_validation','eligible','issued','rejected')),
  check (referred_user_id <> referrer_user_id)
);
alter table public.player_referral_codes enable row level security;
alter table public.player_referral_attributions enable row level security;
revoke all on public.player_referral_codes from anon, authenticated;
revoke all on public.player_referral_attributions from anon, authenticated;
grant select on public.player_referral_codes to authenticated;
drop policy if exists "Pilots can read their own referral code" on public.player_referral_codes;
create policy "Pilots can read their own referral code"
  on public.player_referral_codes for select to authenticated
  using ((select auth.uid()) = user_id);

-- Existing accounts also receive a server-issued referral code.
insert into public.player_referral_codes(user_id, code)
select u.id, lower(substr(encode(gen_random_bytes(8), 'hex'), 1, 12))
from auth.users u
on conflict (user_id) do nothing;

create or replace function public.create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
  safe_name text;
  chosen_country text;
  referrer_id uuid;
begin
  base_name := coalesce(new.raw_user_meta_data ->> 'username', 'pilot_' || substr(new.id::text, 1, 8));
  safe_name := substr(regexp_replace(base_name, '[^A-Za-z0-9_]', '', 'g'), 1, 20);
  if char_length(safe_name) < 3 then
    safe_name := 'pilot_' || substr(new.id::text, 1, 8);
  end if;
  chosen_country := upper(coalesce(new.raw_user_meta_data ->> 'country_code', ''));
  if chosen_country !~ '^[A-Z]{2}$' then chosen_country := null; end if;

  insert into public.player_profiles(user_id, username, country_code)
  values (new.id, safe_name, chosen_country)
  on conflict do nothing;

  if not exists (select 1 from public.player_profiles where user_id = new.id) then
    safe_name := 'pilot_' || substr(replace(new.id::text, '-', ''), 1, 12);
    insert into public.player_profiles(user_id, username, country_code)
    values (new.id, safe_name, chosen_country)
    on conflict do nothing;
  end if;

  insert into public.player_referral_codes(user_id, code)
  values (new.id, lower(substr(encode(gen_random_bytes(8), 'hex'), 1, 12)))
  on conflict (user_id) do nothing;

  select user_id into referrer_id
  from public.player_referral_codes
  where code = lower(coalesce(new.raw_user_meta_data ->> 'referral_code', ''))
  limit 1;

  if referrer_id is not null and referrer_id <> new.id then
    insert into public.player_referral_attributions(referred_user_id, referrer_user_id, referral_code)
    values (new.id, referrer_id, lower(new.raw_user_meta_data ->> 'referral_code'))
    on conflict (referred_user_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.capture_referral_email_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.player_referral_attributions
      set email_verified_at = new.email_confirmed_at
      where referred_user_id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists on_auth_email_verified_referral on auth.users;
create trigger on_auth_email_verified_referral
  after update of email_confirmed_at on auth.users
  for each row execute function public.capture_referral_email_verification();

-- No client-accessible reward RPC is created. Attribution is auditable, but no
-- capsule/currency reward can be issued until a trusted server validates gameplay.
