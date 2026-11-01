-- Versioned, conflict-safe cloud saves for cross-device career progression.
-- The browser remains playable offline; this RPC only syncs authenticated pilot saves.
alter table public.player_game_progress
  add column if not exists game_save_revision bigint not null default 0
  check (game_save_revision >= 0);

create or replace function public.get_player_game_save_v2()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_save jsonb;
  v_revision bigint;
begin
  if v_user is null then
    raise exception 'Sign in to sync your game save';
  end if;

  select game_save, game_save_revision
    into v_save, v_revision
    from public.player_game_progress
    where user_id = v_user;

  return jsonb_build_object(
    'game_save', coalesce(v_save, '{}'::jsonb),
    'revision', coalesce(v_revision, 0)
  );
end;
$$;

create or replace function public.sync_player_game_save_v2(
  p_save jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_save jsonb;
  v_revision bigint;
begin
  if v_user is null then
    raise exception 'Sign in to sync your game save';
  end if;
  if p_save is null
     or jsonb_typeof(p_save) <> 'object'
     or octet_length(p_save::text) > 100000
     or coalesce((p_save->>'version')::integer, 0) not between 1 and 2
     or p_expected_revision is null
     or p_expected_revision < 0 then
    raise exception 'Invalid game save payload';
  end if;

  insert into public.player_game_progress(user_id)
    values (v_user)
    on conflict (user_id) do nothing;

  select game_save, game_save_revision
    into v_save, v_revision
    from public.player_game_progress
    where user_id = v_user
    for update;

  if v_revision <> p_expected_revision then
    return jsonb_build_object(
      'ok', false,
      'revision', v_revision,
      'game_save', coalesce(v_save, '{}'::jsonb)
    );
  end if;

  update public.player_game_progress
    set game_save = p_save,
        game_save_revision = v_revision + 1,
        updated_at = now()
    where user_id = v_user;

  return jsonb_build_object(
    'ok', true,
    'revision', v_revision + 1,
    'game_save', p_save
  );
end;
$$;

revoke all on function public.get_player_game_save_v2() from public, anon;
revoke all on function public.sync_player_game_save_v2(jsonb, bigint) from public, anon;
grant execute on function public.get_player_game_save_v2() to authenticated;
grant execute on function public.sync_player_game_save_v2(jsonb, bigint) to authenticated;
