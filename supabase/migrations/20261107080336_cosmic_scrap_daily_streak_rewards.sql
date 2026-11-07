create table if not exists public.player_daily_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_claim_date date,
  current_streak integer not null default 0 check (current_streak >= 0 and current_streak <= 3650),
  best_streak integer not null default 0 check (best_streak >= 0 and best_streak <= 3650),
  total_claims bigint not null default 0 check (total_claims >= 0),
  reward_points bigint not null default 0 check (reward_points >= 0),
  updated_at timestamptz not null default now()
);
alter table public.player_daily_streaks enable row level security;
revoke all on table public.player_daily_streaks from public, anon, authenticated;

create or replace function public.get_daily_reward_status()
returns table(current_streak integer,best_streak integer,total_claims bigint,reward_points bigint,claimed_today boolean,last_claim_date date)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'UTC')::date;
begin
  if v_user is null then raise exception 'Sign in to view daily rewards'; end if;
  return query
  select coalesce(s.current_streak,0),coalesce(s.best_streak,0),
    coalesce(s.total_claims,0),coalesce(s.reward_points,0),
    coalesce(s.last_claim_date=v_today,false),s.last_claim_date
  from (select v_user as user_id) u
  left join public.player_daily_streaks s on s.user_id=u.user_id;
end;
$function$;

create or replace function public.claim_daily_reward()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'UTC')::date;
  v_row public.player_daily_streaks;
  v_streak integer;
  v_reward integer;
begin
  if v_user is null then raise exception 'Sign in to claim daily rewards'; end if;
  insert into public.player_daily_streaks(user_id) values(v_user)
    on conflict(user_id) do nothing;
  select * into v_row from public.player_daily_streaks
    where user_id=v_user for update;
  if v_row.last_claim_date=v_today then
    return jsonb_build_object('status','already_claimed','current_streak',v_row.current_streak,
      'best_streak',v_row.best_streak,'total_claims',v_row.total_claims,
      'reward_points',v_row.reward_points,'claimed_today',true);
  end if;
  if v_row.last_claim_date=v_today-1 then
    v_streak:=least(3650,v_row.current_streak+1);
  else
    v_streak:=1;
  end if;
  v_reward:=case when v_streak%7=0 then 250 else 50+((least(v_streak,6)-1)*10) end;
  update public.player_daily_streaks set
    last_claim_date=v_today,current_streak=v_streak,
    best_streak=greatest(best_streak,v_streak),
    total_claims=total_claims+1,reward_points=reward_points+v_reward,
    updated_at=now()
  where user_id=v_user returning * into v_row;
  return jsonb_build_object('status','claimed','current_streak',v_row.current_streak,
    'best_streak',v_row.best_streak,'total_claims',v_row.total_claims,
    'reward_points',v_row.reward_points,'claimed_today',true,
    'earned_points',v_reward,'claim_date',v_today);
end;
$function$;

revoke all on function public.get_daily_reward_status() from public,anon;
revoke all on function public.claim_daily_reward() from public,anon;
grant execute on function public.get_daily_reward_status() to authenticated;
grant execute on function public.claim_daily_reward() to authenticated;
