
create or replace function public.enforce_player_chat_safety()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  moderation public.player_moderation%rowtype;
  normalized text;
  recent_count integer;
begin
  select * into moderation from public.player_moderation where user_id = new.sender_user_id;
  if moderation.status = 'perma_banned' or (moderation.status = 'temp_banned' and moderation.banned_until > now()) then
    raise exception 'CHAT_RESTRICTED: this account is currently suspended.';
  end if;
  select count(*) into recent_count from public.player_messages
    where sender_user_id = new.sender_user_id and created_at > now() - interval '10 seconds';
  if recent_count >= 5 then raise exception 'CHAT_RATE_LIMIT: slow down before sending another message.'; end if;
  new.created_at := now();
  normalized := lower(new.body);
  if normalized ~ '(^|[^[:alnum:]_])(amk|aq|siktir|orospu|pi[cç]|yarrak|ibne|fuck|fucking|shit|bitch|cunt|nigger|retard)([^[:alnum:]_]|$)' then
    raise exception 'CHAT_FILTER: please remove profanity and send a respectful message.';
  end if;
  if char_length(btrim(new.body)) = 0 then
    raise exception 'CHAT_EMPTY: message cannot be empty.';
  end if;
  return new;
end;
$$;

drop policy if exists "players submit reports about others" on public.player_reports;
create policy "players submit reports about others" on public.player_reports for insert to authenticated with check (
  reporter_user_id = (select auth.uid()) and target_user_id <> (select auth.uid())
);

create or replace function public.limit_player_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare report_count integer;
begin
  select count(*) into report_count from public.player_reports
    where reporter_user_id = new.reporter_user_id and created_at > now() - interval '1 hour';
  if report_count >= 10 then raise exception 'REPORT_RATE_LIMIT: too many reports in one hour.'; end if;
  new.created_at := now();
  return new;
end;
$$;
drop trigger if exists player_reports_rate_limit on public.player_reports;
create trigger player_reports_rate_limit before insert on public.player_reports for each row execute function public.limit_player_reports();
