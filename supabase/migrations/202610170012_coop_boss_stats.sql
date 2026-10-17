alter table public.coop_match_stats
  add column if not exists bosses_defeated integer not null default 0 check (bosses_defeated >= 0);
