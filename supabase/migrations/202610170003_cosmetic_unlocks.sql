-- Enforce cosmetic unlock levels on the server, not only in the browser.
-- Run after 202610170002_player_progress_sync.sql and the player profile migrations.
create or replace function public.enforce_cosmic_cosmetic_unlocks()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_level integer := 1;
  v_required integer;
begin
  select coalesce(p.level, 1) into v_level
  from public.player_game_progress p
  where p.user_id = new.user_id;
  v_level := coalesce(v_level, 1);

  if tg_op = 'INSERT' or new.avatar_id is distinct from old.avatar_id then
    v_required := case new.avatar_id
      when 'core-blue' then 1
      when 'core-mint' then 2
      when 'core-violet' then 3
      when 'core-amber' then 5
      when 'ataturk' then 8
      else null
    end;
    if v_required is null then raise exception 'Unknown avatar style'; end if;
    if v_level < v_required then
      raise exception 'Avatar locked: reach career level % first', v_required;
    end if;
  end if;

  if tg_op = 'INSERT' or new.rocket_id is distinct from old.rocket_id then
    v_required := case new.rocket_id
      when 'starter' then 1
      when 'comet' then 2
      when 'wraith' then 4
      when 'nova' then 6
      else null
    end;
    if v_required is null then raise exception 'Unknown rocket style'; end if;
    if v_level < v_required then
      raise exception 'Rocket locked: reach career level % first', v_required;
    end if;
  end if;

  return new;
end;
$$;
revoke all on function public.enforce_cosmic_cosmetic_unlocks() from public, anon, authenticated;
drop trigger if exists enforce_cosmic_cosmetic_unlocks on public.player_profiles;
create trigger enforce_cosmic_cosmetic_unlocks
before insert or update of avatar_id, rocket_id
on public.player_profiles
for each row execute function public.enforce_cosmic_cosmetic_unlocks();

comment on function public.enforce_cosmic_cosmetic_unlocks() is
  'Enforces career-level cosmetic unlocks for Cosmic Scrap pilot profiles.';
