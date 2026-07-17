-- BulaRent v0.4: admin controls, report follow-up, user messaging and settings

alter table public.notifications add column if not exists link text;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and not banned) $$;

create or replace function public.protect_profile_admin_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and (new.role is distinct from old.role or new.verified is distinct from old.verified or new.banned is distinct from old.banned or new.email is distinct from old.email) then
    raise exception 'Only an administrator can change protected account fields';
  end if;
  return new;
end; $$;
drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields before update on public.profiles for each row execute function public.protect_profile_admin_fields();

drop policy if exists "owners read own properties" on public.properties;
create policy "owners read own properties" on public.properties for select to authenticated using (public.is_active_user() and owner_id = auth.uid());
drop policy if exists "owners update properties" on public.properties;
create policy "owners update properties" on public.properties for update to authenticated
  using (public.is_active_user() and owner_id = auth.uid())
  with check (public.is_active_user() and owner_id = auth.uid() and status in ('draft', 'pending_review', 'rented', 'archived'));
drop policy if exists "reporters create reports" on public.reports;
create policy "reporters create reports" on public.reports for insert to authenticated with check (
  public.is_active_user() and reporter_id = auth.uid() and exists(select 1 from public.properties where id = property_id and status = 'approved'));
drop policy if exists "users read notifications" on public.notifications;
create policy "users read notifications" on public.notifications for select to authenticated using (public.is_active_user() and user_id = auth.uid());
drop policy if exists "users mark notifications" on public.notifications;
create policy "users mark notifications" on public.notifications for update to authenticated
  using (public.is_active_user() and user_id = auth.uid()) with check (public.is_active_user() and user_id = auth.uid());

drop policy if exists "owners upload listing images" on storage.objects;
create policy "owners upload listing images" on storage.objects for insert to authenticated
  with check (public.is_active_user() and bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners update listing images" on storage.objects;
create policy "owners update listing images" on storage.objects for update to authenticated
  using (public.is_active_user() and bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners delete listing images" on storage.objects;
create policy "owners delete listing images" on storage.objects for delete to authenticated
  using (public.is_active_user() and bucket_id = 'listing-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(property_id, renter_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  id boolean primary key default true check (id),
  allow_submissions boolean not null default true,
  announcement text not null default '',
  support_email text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);
insert into public.platform_settings(id) values (true) on conflict (id) do nothing;

create index if not exists conversations_renter_idx on public.conversations(renter_id, last_message_at desc);
create index if not exists conversations_owner_idx on public.conversations(owner_id, last_message_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.platform_settings enable row level security;

drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations" on public.conversations for select to authenticated
  using (public.is_active_user() and (renter_id = auth.uid() or owner_id = auth.uid() or public.is_admin()));
drop policy if exists "participants update conversations" on public.conversations;
create policy "participants update conversations" on public.conversations for update to authenticated
  using (public.is_active_user() and (renter_id = auth.uid() or owner_id = auth.uid() or public.is_admin()));

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages for select to authenticated using (
  public.is_active_user() and exists(select 1 from public.conversations c where c.id = conversation_id and (c.renter_id = auth.uid() or c.owner_id = auth.uid() or public.is_admin())));
drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages for insert to authenticated with check (
  public.is_active_user() and sender_id = auth.uid() and exists(select 1 from public.conversations c where c.id = conversation_id and (c.renter_id = auth.uid() or c.owner_id = auth.uid() or public.is_admin())));
drop policy if exists "recipients mark messages read" on public.messages;
create policy "recipients mark messages read" on public.messages for update to authenticated using (
  public.is_active_user() and sender_id <> auth.uid() and exists(select 1 from public.conversations c where c.id = conversation_id and (c.renter_id = auth.uid() or c.owner_id = auth.uid() or public.is_admin())));

drop policy if exists "settings public read" on public.platform_settings;
create policy "settings public read" on public.platform_settings for select using (true);
drop policy if exists "admins manage settings" on public.platform_settings;
create policy "admins manage settings" on public.platform_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.start_conversation(p_property_id uuid, p_body text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_conversation uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if not public.is_active_user() then raise exception 'This account is not active'; end if;
  if char_length(trim(p_body)) < 1 or char_length(p_body) > 2000 then raise exception 'Message must be between 1 and 2000 characters'; end if;
  select owner_id into v_owner from public.properties where id = p_property_id and status = 'approved';
  if v_owner is null then raise exception 'Listing is not available'; end if;
  if v_owner = auth.uid() then raise exception 'You cannot message yourself'; end if;
  insert into public.conversations(property_id, renter_id, owner_id)
  values (p_property_id, auth.uid(), v_owner)
  on conflict(property_id, renter_id) do update set last_message_at = now()
  returning id into v_conversation;
  insert into public.messages(conversation_id, sender_id, body) values (v_conversation, auth.uid(), trim(p_body));
  return v_conversation;
end; $$;

create or replace function public.admin_update_user(
  p_user_id uuid, p_role public.user_role, p_verified boolean, p_banned boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if p_user_id = auth.uid() and p_banned then raise exception 'You cannot ban your own account'; end if;
  update public.profiles set role = p_role, verified = p_verified, banned = p_banned where id = p_user_id;
end; $$;

create or replace function public.admin_action_report(
  p_report_id uuid, p_status public.report_status, p_message text)
returns void language plpgsql security definer set search_path = public as $$
declare v_reporter uuid; v_property uuid; v_title text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if p_status not in ('reviewing', 'resolved', 'dismissed') then raise exception 'Invalid report status'; end if;
  select r.reporter_id, r.property_id, p.title into v_reporter, v_property, v_title
  from public.reports r join public.properties p on p.id = r.property_id where r.id = p_report_id;
  if v_reporter is null then raise exception 'Report not found'; end if;
  update public.reports set status = p_status,
    resolved_by = case when p_status in ('resolved','dismissed') then auth.uid() else null end,
    resolved_at = case when p_status in ('resolved','dismissed') then now() else null end
  where id = p_report_id;
  insert into public.notifications(user_id, title, message, kind, link)
  values (v_reporter, 'Report update: ' || replace(p_status::text, '_', ' '),
    coalesce(nullif(trim(p_message), ''), 'Your report about "' || v_title || '" is now ' || p_status::text || '.'),
    'report_update', '/properties/' || v_property::text);
end; $$;

create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_recipient uuid;
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  select case when renter_id = new.sender_id then owner_id else renter_id end into v_recipient
  from public.conversations where id = new.conversation_id;
  insert into public.notifications(user_id, title, message, kind, link)
  values(v_recipient, 'New message', left(new.body, 140), 'message', '/messages?conversation=' || new.conversation_id::text);
  return new;
end; $$;
drop trigger if exists messages_notify_recipient on public.messages;
create trigger messages_notify_recipient after insert on public.messages for each row execute function public.notify_new_message();

grant execute on function public.start_conversation(uuid, text) to authenticated;
grant execute on function public.admin_update_user(uuid, public.user_role, boolean, boolean) to authenticated;
grant execute on function public.admin_action_report(uuid, public.report_status, text) to authenticated;
