-- Moderator-only report queue and review actions for Cosmic Scrap.
-- Reports remain private to moderators; players cannot read other players' reports.
create or replace function public.get_moderation_reports(p_status text default 'open', p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare actor uuid := auth.uid(); result jsonb;
begin
  if actor is null or not exists (select 1 from public.player_moderation m where m.user_id=actor and m.is_moderator=true and m.status='active') then raise exception 'MODERATION_FORBIDDEN'; end if;
  if p_status not in ('open','reviewing','actioned','dismissed','all') then raise exception 'INVALID_REPORT_STATUS'; end if;
  select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at desc),'[]'::jsonb) into result
  from (select r.id,r.reporter_user_id,rp.username as reporter_username,r.target_user_id,tp.username as target_username,r.room_id,r.reason,r.details,r.status,r.moderator_note,r.reviewed_by,r.created_at,r.reviewed_at
    from public.player_reports r left join public.player_profiles rp on rp.user_id=r.reporter_user_id left join public.player_profiles tp on tp.user_id=r.target_user_id
    where p_status='all' or r.status=p_status order by r.created_at desc limit greatest(1,least(coalesce(p_limit,50),100))) q;
  return result;
end; $$;
revoke all on function public.get_moderation_reports(text,integer) from public,anon;
grant execute on function public.get_moderation_reports(text,integer) to authenticated;

create or replace function public.review_player_report(p_report_id uuid,p_status text,p_note text default '',p_action text default 'none',p_duration_hours integer default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare actor uuid:=auth.uid(); report_row public.player_reports%rowtype; next_status text; next_until timestamptz;
begin
  if actor is null or not exists (select 1 from public.player_moderation m where m.user_id=actor and m.is_moderator=true and m.status='active') then raise exception 'MODERATION_FORBIDDEN'; end if;
  if p_status not in ('open','reviewing','actioned','dismissed') then raise exception 'INVALID_REPORT_STATUS'; end if;
  if p_action not in ('none','temp_ban','perma_ban','unban') then raise exception 'INVALID_MODERATION_ACTION'; end if;
  select * into report_row from public.player_reports where id=p_report_id for update;
  if not found then raise exception 'REPORT_NOT_FOUND'; end if;
  if report_row.target_user_id=actor then raise exception 'CANNOT_MODERATE_SELF'; end if;
  if p_action='temp_ban' then
    if p_duration_hours is null or p_duration_hours<1 or p_duration_hours>720 then raise exception 'INVALID_BAN_DURATION'; end if;
    next_status:='temp_banned'; next_until:=now()+make_interval(hours=>p_duration_hours);
  elsif p_action='perma_ban' then next_status:='perma_banned'; next_until:=null;
  elsif p_action='unban' then next_status:='active'; next_until:=null; end if;
  if p_action<>'none' then
    insert into public.player_moderation(user_id,status,banned_until,reason,updated_at)
    values(report_row.target_user_id,next_status,next_until,left(coalesce(p_note,''),500),now())
    on conflict(user_id) do update set status=excluded.status,banned_until=excluded.banned_until,reason=excluded.reason,updated_at=now();
  end if;
  update public.player_reports set status=p_status,moderator_note=left(coalesce(p_note,''),1000),reviewed_by=actor,
    reviewed_at=case when p_status in ('actioned','dismissed') then now() else reviewed_at end where id=p_report_id;
  return jsonb_build_object('report_id',p_report_id,'status',p_status,'action',p_action,'target_user_id',report_row.target_user_id,
    'moderation_status',case when p_action='none' then null else next_status end,'banned_until',case when p_action='none' then null else next_until end);
end; $$;
revoke all on function public.review_player_report(uuid,text,text,text,integer) from public,anon;
grant execute on function public.review_player_report(uuid,text,text,text,integer) to authenticated;
