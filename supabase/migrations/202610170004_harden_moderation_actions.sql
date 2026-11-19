-- Keep moderator actions unavailable to moderators whose own account is suspended.
create or replace function public.moderate_player(
  p_target_user_id uuid,
  p_action text,
  p_duration_hours integer default null,
  p_reason text default ''
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  next_status text;
  next_until timestamptz;
begin
  if actor is null or not exists (
    select 1 from public.player_moderation m
    where m.user_id = actor
      and m.is_moderator = true
      and m.status = 'active'
      and (m.banned_until is null or m.banned_until <= now())
  ) then
    raise exception 'MODERATION_FORBIDDEN';
  end if;
  if p_target_user_id = actor then raise exception 'CANNOT_MODERATE_SELF'; end if;
  if p_action = 'unban' then
    next_status := 'active'; next_until := null;
  elsif p_action = 'temp_ban' then
    if p_duration_hours is null or p_duration_hours < 1 or p_duration_hours > 720 then
      raise exception 'INVALID_BAN_DURATION';
    end if;
    next_status := 'temp_banned';
    next_until := now() + make_interval(hours => p_duration_hours);
  elsif p_action = 'perma_ban' then
    next_status := 'perma_banned'; next_until := null;
  else
    raise exception 'INVALID_MODERATION_ACTION';
  end if;
  insert into public.player_moderation(user_id,status,banned_until,reason,updated_at)
    values (p_target_user_id,next_status,next_until,left(coalesce(p_reason,''),500),now())
  on conflict (user_id) do update set
    status=excluded.status,
    banned_until=excluded.banned_until,
    reason=excluded.reason,
    updated_at=now();
  return jsonb_build_object('user_id',p_target_user_id,'status',next_status,'banned_until',next_until);
end;
$$;
revoke all on function public.moderate_player(uuid,text,integer,text) from public, anon;
grant execute on function public.moderate_player(uuid,text,integer,text) to authenticated;
comment on function public.moderate_player(uuid,text,integer,text) is
  'Moderator actions require an active, unsuspended moderator account.';
