create index if not exists ranked_duel_matches_winner_user_idx
  on public.ranked_duel_matches(winner_user_id) where winner_user_id is not null;
