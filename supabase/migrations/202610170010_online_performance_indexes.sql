-- Cover foreign keys and common reverse lookups flagged by the Supabase performance advisor.
create index if not exists coop_rooms_winner_user_idx on public.coop_rooms(winner_user_id) where winner_user_id is not null;
create index if not exists player_blocks_blocked_user_idx on public.player_blocks(blocked_user_id);
create index if not exists player_messages_recipient_user_idx on public.player_messages(recipient_user_id) where recipient_user_id is not null;
create index if not exists player_reports_reporter_user_idx on public.player_reports(reporter_user_id);
create index if not exists player_reports_reviewed_by_idx on public.player_reports(reviewed_by) where reviewed_by is not null;
create index if not exists player_reports_room_idx on public.player_reports(room_id) where room_id is not null;
create index if not exists player_reports_target_user_idx on public.player_reports(target_user_id);
create index if not exists player_season_rank_stats_user_idx on public.player_season_rank_stats(user_id);
create index if not exists ranked_duel_matches_season_idx on public.ranked_duel_matches(season_id);
