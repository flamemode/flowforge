-- Security Migration: Fix credit system vulnerabilities
-- Run this in your Supabase SQL Editor

-- 1. Add is_admin column to profiles
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2. Set yourself as admin (replace with your actual user email)
-- update public.profiles set is_admin = true where email = 'your-email@example.com';

-- 3. Gate add_credits behind admin check (prevents non-admins from self-granting credits)
create or replace function public.add_credits(user_uuid uuid, amount integer)
returns void as $$
begin
  if current_setting('role', true) = 'authenticated' then
    if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
      raise exception 'Only admins can add credits';
    end if;
  end if;
  update public.profiles set credits = credits + amount where id = user_uuid;
end;
$$ language plpgsql security definer;

-- 4. Fix spend_credit race condition (atomic UPDATE instead of SELECT-then-UPDATE)
create or replace function public.spend_credit(user_uuid uuid)
returns boolean as $$
declare
  remaining integer;
begin
  update public.profiles
    set credits = credits - 1
    where id = user_uuid and credits > 0
    returning credits into remaining;
  return found;
end;
$$ language plpgsql security definer;

-- 5. Add refund_credit function (for failed generations)
create or replace function public.refund_credit(user_uuid uuid)
returns void as $$
begin
  update public.profiles set credits = credits + 1 where id = user_uuid;
end;
$$ language plpgsql security definer;

-- refund_credit is service-role only (not granted to authenticated)
