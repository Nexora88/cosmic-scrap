create or replace function public.delete_player_account_data(p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
 if p_user_id is null then raise exception 'user id required'; end if;
 if auth.role() <> 'service_role' then raise exception 'service role required' using errcode='42501'; end if;
 delete from public.coop_room_presence where user_id=p_user_id;
 delete from public.coop_matchmaking_queue where user_id=p_user_id;
 delete from public.ranked_matchmaking_queue where user_id=p_user_id;
 delete from public.coop_match_stats where host_user_id=p_user_id or guest_user_id=p_user_id;
 delete from public.online_simulations where room_id in (select id from public.coop_rooms where host_user_id=p_user_id or guest_user_id=p_user_id) or ranked_match_id in (select id from public.ranked_duel_matches where player_a_id=p_user_id or player_b_id=p_user_id or winner_user_id=p_user_id);
 delete from public.coop_rooms where host_user_id=p_user_id or guest_user_id=p_user_id or winner_user_id=p_user_id;
 delete from public.ranked_duel_matches where player_a_id=p_user_id or player_b_id=p_user_id or winner_user_id=p_user_id;
 delete from public.player_messages where sender_user_id=p_user_id or recipient_user_id=p_user_id;
 delete from public.player_friends where requester_user_id=p_user_id or target_user_id=p_user_id;
 delete from public.player_blocks where blocker_user_id=p_user_id or blocked_user_id=p_user_id;
 delete from public.player_reports where reporter_user_id=p_user_id or target_user_id=p_user_id;
 delete from public.galaxy_wars where attacker_user_id=p_user_id or defender_user_id=p_user_id;
 update public.galaxy_sectors set owner_user_id=null where owner_user_id=p_user_id;
 delete from public.galaxy_player_state where user_id=p_user_id;
 delete from public.player_cosmetic_inventory where user_id=p_user_id;
 delete from public.player_daily_streaks where user_id=p_user_id;
 delete from public.player_game_progress where user_id=p_user_id;
 delete from public.player_moderation where user_id=p_user_id;
 delete from public.player_rank_stats where user_id=p_user_id;
 delete from public.player_run_records where user_id=p_user_id;
 delete from public.player_run_submission_limits where user_id=p_user_id;
 delete from public.player_season_rank_stats where user_id=p_user_id;
 delete from public.player_profiles where user_id=p_user_id;
end; $$;
revoke all on function public.delete_player_account_data(uuid) from public,anon,authenticated;
grant execute on function public.delete_player_account_data(uuid) to service_role;
