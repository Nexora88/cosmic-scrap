-- Include the optional public profile photo path in leaderboard RPC output.
drop function if exists public.get_player_leaderboard(integer);
create function public.get_player_leaderboard(p_limit integer default 50)
returns table(username text,avatar_id text,avatar_path text,best_score integer,best_level integer,best_survival_seconds integer,updated_at timestamptz)
language sql security definer set search_path='' stable
as $$
 select p.username,p.avatar_id,p.avatar_path,r.best_score,r.best_level,r.best_survival_seconds,r.updated_at
 from public.player_run_records r join public.player_profiles p on p.user_id=r.user_id
 order by r.best_score desc,r.best_level desc,r.best_survival_seconds desc
 limit greatest(1,least(coalesce(p_limit,50),100));
$$;
revoke all on function public.get_player_leaderboard(integer) from public;
grant execute on function public.get_player_leaderboard(integer) to anon,authenticated;

drop function if exists public.get_friends_leaderboard(integer);
create function public.get_friends_leaderboard(p_limit integer default 50)
returns table(username text,avatar_id text,avatar_path text,best_score integer,best_level integer,best_survival_seconds integer,updated_at timestamptz)
language sql security definer set search_path='' stable
as $$
 with friend_ids as (
  select auth.uid() as user_id
  union
  select case when f.requester_user_id=auth.uid() then f.target_user_id else f.requester_user_id end
  from public.player_friends f where f.status='accepted' and (f.requester_user_id=auth.uid() or f.target_user_id=auth.uid())
 )
 select p.username,p.avatar_id,p.avatar_path,r.best_score,r.best_level,r.best_survival_seconds,r.updated_at
 from friend_ids f join public.player_run_records r on r.user_id=f.user_id join public.player_profiles p on p.user_id=r.user_id
 order by r.best_score desc,r.best_level desc,r.best_survival_seconds desc
 limit greatest(1,least(coalesce(p_limit,50),100));
$$;
revoke all on function public.get_friends_leaderboard(integer) from public;
grant execute on function public.get_friends_leaderboard(integer) to authenticated;
