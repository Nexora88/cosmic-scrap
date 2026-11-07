drop function if exists public.get_player_leaderboard(integer);
create function public.get_player_leaderboard(p_limit integer default 50)
returns table(user_id uuid,username text,avatar_id text,avatar_path text,country_code text,
 best_score integer,best_level integer,best_survival_seconds integer,updated_at timestamptz)
language sql stable security definer set search_path=''
as $function$
 select p.user_id,p.username,p.avatar_id,p.avatar_path,p.country_code,
  r.best_score,r.best_level,r.best_survival_seconds,r.updated_at
 from public.player_run_records r
 join public.player_profiles p on p.user_id=r.user_id
 order by r.best_score desc,r.best_level desc,r.best_survival_seconds desc
 limit greatest(1,least(coalesce(p_limit,50),100));
$function$;
revoke all on function public.get_player_leaderboard(integer) from public;
grant execute on function public.get_player_leaderboard(integer) to anon,authenticated;

drop function if exists public.get_friends_leaderboard(integer);
create function public.get_friends_leaderboard(p_limit integer default 50)
returns table(user_id uuid,username text,avatar_id text,avatar_path text,country_code text,
 best_score integer,best_level integer,best_survival_seconds integer,updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $function$
declare v_user uuid:=auth.uid();
begin
 if v_user is null then raise exception 'Sign in to view friends leaderboard'; end if;
 return query
 with friend_ids as (
  select v_user as user_id
  union
  select case when f.requester_user_id=v_user then f.target_user_id else f.requester_user_id end
  from public.player_friends f
  where f.status='accepted' and (f.requester_user_id=v_user or f.target_user_id=v_user)
 )
 select p.user_id,p.username,p.avatar_id,p.avatar_path,p.country_code,
  r.best_score,r.best_level,r.best_survival_seconds,r.updated_at
 from friend_ids f
 join public.player_run_records r on r.user_id=f.user_id
 join public.player_profiles p on p.user_id=r.user_id
 order by r.best_score desc,r.best_level desc,r.best_survival_seconds desc
 limit greatest(1,least(coalesce(p_limit,50),100));
end;
$function$;
revoke all on function public.get_friends_leaderboard(integer) from public,anon;
grant execute on function public.get_friends_leaderboard(integer) to authenticated;
