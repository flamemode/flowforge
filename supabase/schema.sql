-- FlowForge Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  agency_name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'team', 'agency')),
  simulations_used_this_month integer not null default 0,
  simulations_reset_at timestamptz not null default now(),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── PROJECTS ─────────────────────────────────────────────────────────────────
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  client_type text not null,
  project_type text not null check (project_type in (
    'brand_identity', 'website_design', 'web_development', 'ui_ux_design',
    'digital_marketing', 'content_strategy', 'full_service'
  )),
  budget numeric not null,
  timeline_weeks integer not null,
  team_size integer not null default 3,
  client_personality text not null check (client_personality in (
    'collaborative', 'indecisive_founder', 'micromanager_cmo',
    'visionary_vague', 'budget_hawk', 'scope_creeper'
  )),
  scope_description text not null,
  special_requirements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can manage own projects"
  on public.projects for all using (auth.uid() = user_id);

-- ─── SIMULATIONS ──────────────────────────────────────────────────────────────
create table public.simulations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in (
    'pending', 'running', 'paused', 'completed', 'failed'
  )),
  current_round integer not null default 0,
  total_rounds integer not null default 7,
  risk_score numeric not null default 0,
  success_probability numeric not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.simulations enable row level security;

create policy "Users can manage own simulations"
  on public.simulations for all using (auth.uid() = user_id);

-- ─── SIMULATION MESSAGES ──────────────────────────────────────────────────────
create table public.simulation_messages (
  id uuid default uuid_generate_v4() primary key,
  simulation_id uuid references public.simulations(id) on delete cascade not null,
  round integer not null,
  agent_role text not null check (agent_role in (
    'client_liaison', 'project_manager', 'creative_director',
    'copywriter', 'developer', 'qa_tester', 'account_manager'
  )),
  content text not null,
  message_type text not null default 'statement' check (message_type in (
    'statement', 'question', 'concern', 'decision', 'conflict'
  )),
  created_at timestamptz not null default now()
);

alter table public.simulation_messages enable row level security;

create policy "Users can read messages from own simulations"
  on public.simulation_messages for select
  using (
    exists (
      select 1 from public.simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  );

create policy "Service role can insert messages"
  on public.simulation_messages for insert
  with check (true);

create index idx_simulation_messages_simulation_id
  on public.simulation_messages(simulation_id);

create index idx_simulation_messages_round
  on public.simulation_messages(simulation_id, round);

-- ─── SIMULATION CONFLICTS ─────────────────────────────────────────────────────
create table public.simulation_conflicts (
  id uuid default uuid_generate_v4() primary key,
  simulation_id uuid references public.simulations(id) on delete cascade not null,
  round integer not null,
  involved_roles text[] not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  resolution text,
  created_at timestamptz not null default now()
);

alter table public.simulation_conflicts enable row level security;

create policy "Users can read conflicts from own simulations"
  on public.simulation_conflicts for select
  using (
    exists (
      select 1 from public.simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  );

-- ─── SIMULATION REPORTS ───────────────────────────────────────────────────────
create table public.simulation_reports (
  id uuid default uuid_generate_v4() primary key,
  simulation_id uuid references public.simulations(id) on delete cascade not null unique,
  project_id uuid references public.projects(id) on delete cascade not null,
  overall_risk_level text not null check (overall_risk_level in ('low', 'medium', 'high', 'critical')),
  success_probability numeric not null,
  executive_summary text not null,
  risks jsonb not null default '[]',
  recommendations jsonb not null default '[]',
  revised_timeline_weeks numeric not null,
  revised_budget_multiplier numeric not null default 1.0,
  process_improvements jsonb not null default '[]',
  agent_performance jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.simulation_reports enable row level security;

create policy "Users can read own reports"
  on public.simulation_reports for select
  using (
    exists (
      select 1 from public.simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  );

-- ─── STRIPE EVENTS (for idempotency) ─────────────────────────────────────────
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

-- Increment simulation counter
create or replace function public.increment_simulation_count(user_uuid uuid)
returns void as $$
begin
  update public.profiles
  set simulations_used_this_month = simulations_used_this_month + 1
  where id = user_uuid;
end;
$$ language plpgsql security definer;

-- Reset monthly simulation count
create or replace function public.reset_monthly_simulations()
returns void as $$
begin
  update public.profiles
  set simulations_used_this_month = 0,
      simulations_reset_at = now()
  where simulations_reset_at < date_trunc('month', now());
end;
$$ language plpgsql security definer;

-- Check if user can run simulation
create or replace function public.can_run_simulation(user_uuid uuid)
returns boolean as $$
declare
  profile public.profiles%rowtype;
  limit_map jsonb := '{"free": 3, "pro": null, "team": null, "agency": null}';
  sim_limit integer;
begin
  select * into profile from public.profiles where id = user_uuid;

  if not found then return false; end if;

  -- Reset if new month
  if profile.simulations_reset_at < date_trunc('month', now()) then
    update public.profiles
    set simulations_used_this_month = 0, simulations_reset_at = now()
    where id = user_uuid;
    return true;
  end if;

  sim_limit := (limit_map ->> profile.subscription_tier)::integer;

  if sim_limit is null then return true; end if;

  return profile.simulations_used_this_month < sim_limit;
end;
$$ language plpgsql security definer;

-- ─── DELIVERABLES ─────────────────────────────────────────────────────────────
create table public.deliverables (
  id text primary key,
  simulation_id uuid references public.simulations(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  type text not null check (type in (
    'logo_svg', 'brand_guidelines', 'website_html',
    'marketing_strategy', 'social_media_pack', 'ad_copy'
  )),
  title text not null,
  content text not null,
  status text not null default 'complete',
  iteration integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.deliverables enable row level security;

create policy "Users can manage own deliverables"
  on public.deliverables for all
  using (
    exists (
      select 1 from public.simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  );

-- Grant permissions
grant all on public.deliverables to authenticated;
