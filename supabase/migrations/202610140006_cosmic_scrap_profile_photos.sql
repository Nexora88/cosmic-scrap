-- Optional public profile photos for free player accounts.
alter table public.player_profiles add column if not exists avatar_path text;
create or replace function public.validate_player_avatar_path()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
 if new.avatar_path is not null and new.avatar_path not like new.user_id::text || '/%' then
  raise exception 'Avatar path must be inside the signed-in player folder';
 end if;
 return new;
end; $$;
drop trigger if exists validate_player_avatar_path on public.player_profiles;
create trigger validate_player_avatar_path before insert or update of avatar_path,user_id
 on public.player_profiles for each row execute function public.validate_player_avatar_path();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('player-avatars','player-avatars',true,1048576,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=true,file_size_limit=1048576,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Public can view Cosmic Scrap avatars" on storage.objects;
create policy "Public can view Cosmic Scrap avatars" on storage.objects for select using(bucket_id='player-avatars');
drop policy if exists "Players upload own Cosmic Scrap avatar" on storage.objects;
create policy "Players upload own Cosmic Scrap avatar" on storage.objects for insert to authenticated
 with check(bucket_id='player-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Players update own Cosmic Scrap avatar" on storage.objects;
create policy "Players update own Cosmic Scrap avatar" on storage.objects for update to authenticated
 using(bucket_id='player-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check(bucket_id='player-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Players delete own Cosmic Scrap avatar" on storage.objects;
create policy "Players delete own Cosmic Scrap avatar" on storage.objects for delete to authenticated
 using(bucket_id='player-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
