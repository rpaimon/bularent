-- BulaRent v0.2: trustworthy listings beta
create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('tenant', 'landlord', 'agent', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.listing_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'rented', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text,
  role public.user_role not null default 'tenant',
  verified boolean not null default false,
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 10 and 120),
  description text not null check (char_length(description) between 30 and 3000),
  property_type text not null,
  address text not null,
  city text not null,
  bedrooms smallint not null check (bedrooms between 0 and 20),
  bathrooms smallint not null check (bathrooms between 1 and 20),
  rent_amount numeric(10,2) not null check (rent_amount > 0 and rent_amount <= 100000),
  available_from date,
  furnished boolean not null default false,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  contact_phone text not null,
  whatsapp_phone text,
  status public.listing_status not null default 'pending_review',
  featured boolean not null default false,
  verified boolean not null default false,
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('suspected_scam', 'duplicate', 'incorrect_information', 'already_rented')),
  details text check (char_length(details) <= 1000),
  status public.report_status not null default 'open',
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(property_id, reporter_id, reason)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  kind text not null default 'system',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists properties_public_search_idx on public.properties(status, city, property_type, rent_amount);
create index if not exists properties_owner_idx on public.properties(owner_id, created_at desc);
create index if not exists reports_status_idx on public.reports(status, created_at);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role public.user_role;
begin
  requested_role := case when new.raw_user_meta_data->>'role' in ('tenant', 'landlord', 'agent')
    then (new.raw_user_meta_data->>'role')::public.user_role else 'tenant'::public.user_role end;
  insert into public.profiles (id, email, full_name, role)
  values (new.id, coalesce(new.email, ''), coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'BulaRent user'), requested_role)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and not banned) $$;

create or replace function public.notify_listing_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status in ('approved', 'rejected') then
    insert into public.notifications(user_id, title, message, kind)
    values (new.owner_id,
      case when new.status = 'approved' then 'Listing approved' else 'Listing needs changes' end,
      case when new.status = 'approved' then 'Your listing "' || new.title || '" is now public.' else 'Your listing "' || new.title || '" was not approved. ' || coalesce(new.rejection_reason, '') end,
      'listing_review');
  end if;
  return new;
end; $$;
drop trigger if exists properties_notify_status on public.properties;
create trigger properties_notify_status after update of status on public.properties for each row execute function public.notify_listing_status();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "approved properties are public" on public.properties;
create policy "approved properties are public" on public.properties for select using (status = 'approved');
drop policy if exists "owners read own properties" on public.properties;
create policy "owners read own properties" on public.properties for select to authenticated using (owner_id = auth.uid());
drop policy if exists "admins read all properties" on public.properties;
create policy "admins read all properties" on public.properties for select to authenticated using (public.is_admin());
drop policy if exists "owners create properties" on public.properties;
create policy "owners create properties" on public.properties for insert to authenticated with check (
  owner_id = auth.uid() and status in ('draft', 'pending_review') and exists (
    select 1 from public.profiles where id = auth.uid() and role in ('landlord', 'agent', 'admin') and not banned));
drop policy if exists "owners update properties" on public.properties;
create policy "owners update properties" on public.properties for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and status in ('draft', 'pending_review', 'rented', 'archived'));
drop policy if exists "admins manage properties" on public.properties;
create policy "admins manage properties" on public.properties for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reporters create reports" on public.reports;
create policy "reporters create reports" on public.reports for insert to authenticated with check (
  reporter_id = auth.uid() and exists(select 1 from public.properties where id = property_id and status = 'approved'));
drop policy if exists "reporters read reports" on public.reports;
create policy "reporters read reports" on public.reports for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists "admins manage reports" on public.reports;
create policy "admins manage reports" on public.reports for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read notifications" on public.notifications;
create policy "users read notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "users mark notifications" on public.notifications;
create policy "users mark notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Ordinary users may edit contact fields but cannot promote or verify themselves.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public listing images" on storage.objects;
create policy "public listing images" on storage.objects for select using (bucket_id = 'listing-images');
drop policy if exists "owners upload listing images" on storage.objects;
create policy "owners upload listing images" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners update listing images" on storage.objects;
create policy "owners update listing images" on storage.objects for update to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners delete listing images" on storage.objects;
create policy "owners delete listing images" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
