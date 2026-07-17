-- Run after the chosen administrator has created a normal BulaRent account.
-- Replace the example email before executing in Supabase SQL Editor.
update public.profiles
set role = 'admin'
where email = 'replace-with-admin-email@example.com';
