-- Refresh active queue entries and purge abandoned matchmaking requests.
create or replace function public.join_ranked_queue(p_level_bracket integer default 1,p_rating integer default 1000)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_rating integer; v_other public.coop_matchmaking_queue; v_room public.coop_rooms; v_code text;
begin
 if v_user is null then raise exception 'Sign in to find an opponent'; end if;
 if p_level_bracket is null or p_level_bracket<1 or p_level_bracket>10 then raise exception 'Invalid level bracket'; end if;
 insert into public.player_rank_stats(user_id) values(v_user) on conflict(user_id) do nothing;
 select rating into v_rating from public.player_rank_stats where user_id=v_user;
 perform pg_advisory_xact_lock(hashtext('cosmic_scrap_ranked_queue'));
 delete from public.coop_matchmaking_queue where queued_at<now()-interval '2 minutes';
 insert into public.coop_matchmaking_queue(user_id,level_bracket,rating,queued_at) values(v_user,p_level_bracket,v_rating,now())
 on conflict(user_id) do update set level_bracket=excluded.level_bracket,rating=excluded.rating,queued_at=now();
 select * into v_other from public.coop_matchmaking_queue q where q.user_id<>v_user and q.queued_at>now()-interval '2 minutes'
  and q.level_bracket between greatest(1,p_level_bracket-1) and least(10,p_level_bracket+1) and abs(q.rating-v_rating)<=250
  order by abs(q.level_bracket-p_level_bracket),abs(q.rating-v_rating),q.queued_at limit 1 for update skip locked;
 if not found then return jsonb_build_object('status','waiting','message','Searching for a similar-level pilot…'); end if;
 delete from public.coop_matchmaking_queue where user_id in (v_user,v_other.user_id);
 loop v_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); exit when not exists(select 1 from public.coop_rooms where invite_code=v_code); end loop;
 insert into public.coop_rooms(invite_code,host_user_id,guest_user_id,status,room_mode,level_bracket,expires_at)
  values(v_code,v_other.user_id,v_user,'ready','ranked',greatest(1,least(10,round((v_other.level_bracket+p_level_bracket)::numeric/2)::integer)),now()+interval '30 minutes')
  returning * into v_room;
 return jsonb_build_object('status','matched','room_id',v_room.id,'invite_code',v_room.invite_code,'level_bracket',v_room.level_bracket,
  'host_user_id',v_room.host_user_id,'guest_user_id',v_room.guest_user_id);
end; $$;
revoke all on function public.join_ranked_queue(integer,integer) from public;
grant execute on function public.join_ranked_queue(integer,integer) to authenticated;
