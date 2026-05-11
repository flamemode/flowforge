-- Origo Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'team', 'agency')),
  credits integer not null default 2,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── GENERATED PROJECTS ───────────────────────────────────────────────────────
create table if not exists public.generated_projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  questionnaire jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'generating', 'complete', 'failed')),
  file_count integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.generated_projects enable row level security;

create policy "Users can manage own projects"
  on public.generated_projects for all using (auth.uid() = user_id);

-- ─── GENERATED FILES ──────────────────────────────────────────────────────────
create table if not exists public.generated_files (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.generated_projects(id) on delete cascade not null,
  path text not null,
  content text not null,
  language text not null default 'text',
  created_at timestamptz not null default now(),
  unique (project_id, path)
);

alter table public.generated_files enable row level security;

create policy "Users can manage own files"
  on public.generated_files for all
  using (
    exists (
      select 1 from public.generated_projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create index idx_generated_files_project_id
  on public.generated_files(project_id);

-- ─── CREDIT PURCHASES ─────────────────────────────────────────────────────────
create table if not exists public.credit_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_payment_intent_id text unique,
  pack_id text not null,
  credits integer not null,
  amount_paid integer not null,
  created_at timestamptz not null default now()
);

alter table public.credit_purchases enable row level security;

create policy "Users can view own purchases"
  on public.credit_purchases for select using (auth.uid() = user_id);

-- ─── STRIPE EVENTS (idempotency) ──────────────────────────────────────────────
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ─── FUNCTIONS ────────────────────────────────────────────────────────────────

create or replace function public.spend_credit(user_uuid uuid)
returns boolean as $$
declare
  current_credits integer;
begin
  select credits into current_credits from public.profiles where id = user_uuid;
  if current_credits <= 0 then return false; end if;
  update public.profiles set credits = credits - 1 where id = user_uuid;
  return true;
end;
$$ language plpgsql security definer;

create or replace function public.add_credits(user_uuid uuid, amount integer)
returns void as $$
begin
  update public.profiles set credits = credits + amount where id = user_uuid;
end;
$$ language plpgsql security definer;

-- ─── GRANTS ───────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;
grant all on public.generated_projects to authenticated;
grant all on public.generated_files to authenticated;
grant all on public.credit_purchases to authenticated;
grant execute on function public.spend_credit(uuid) to authenticated;
grant execute on function public.add_credits(uuid, integer) to authenticated;

-- Give existing users 2 free credits if they have none
update public.profiles set credits = 2 where credits = 0;
