-- ==============================================================================
-- DOCTALK TELEMEDICINE - SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create PROFILES table linked to Supabase Auth users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  role text not null default 'patient' check (role in ('patient', 'doctor')),
  phone text,
  avatar_url text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Doctors can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile (excluding role)" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Policy A: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy B: Certified Doctors can view patient profiles
create policy "Doctors can view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- Policy C: Users can update their own profile, but CANNOT change their role to doctor
create policy "Users can update own profile (excluding role)"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and
    role = (select role from public.profiles where id = auth.uid())
  );

-- Policy D: Users can insert their own profile with strict default patient role
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (
    auth.uid() = id and
    role = 'patient'
  );

-- 3. Automatic Trigger to create a profile row upon Supabase Auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Patient User'),
    'patient' -- Enforce patient role on signup; doctors must be elevated by admin
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 4. Clinical Case Records Table (Telemetry & Triage)
-- ==============================================================================
create table if not exists public.cases (
  id text primary key,
  patient_id uuid references auth.users(id) on delete cascade not null,
  patient_name text not null,
  patient_age integer,
  patient_gender text,
  title text not null,
  reason text not null,
  symptoms jsonb default '[]'::jsonb,
  duration text,
  notes text,
  language text default 'en',
  channel text default 'chat' check (channel in ('video', 'audio', 'chat', 'sms')),
  status text default 'submitted' check (status in ('draft', 'pending_sync', 'submitted', 'in_review', 'responded', 'closed')),
  urgency text default 'moderate' check (urgency in ('low', 'moderate', 'high', 'critical')),
  messages jsonb default '[]'::jsonb,
  doctor_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on cases
alter table public.cases enable row level security;

drop policy if exists "Patients can view own cases" on public.cases;
drop policy if exists "Patients can insert own cases" on public.cases;
drop policy if exists "Patients can update own draft cases" on public.cases;
drop policy if exists "Doctors can view all submitted cases" on public.cases;
drop policy if exists "Doctors can update and reply to cases" on public.cases;

-- Patients can only view cases they own
create policy "Patients can view own cases"
  on public.cases
  for select
  using (auth.uid() = patient_id);

-- Patients can only create cases where patient_id matches their authenticated UID
create policy "Patients can insert own cases"
  on public.cases
  for insert
  with check (auth.uid() = patient_id);

-- Patients can update their own draft cases
create policy "Patients can update own draft cases"
  on public.cases
  for update
  using (auth.uid() = patient_id and status in ('draft', 'pending_sync'));

-- Accredited Doctors can view all clinical cases
create policy "Doctors can view all submitted cases"
  on public.cases
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- Doctors can review, triage, and update case notes/status
create policy "Doctors can update and reply to cases"
  on public.cases
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- ==============================================================================
-- 5. Helper Function for Admins to Elevate a User to Doctor
-- Run this in SQL Editor when accrediting a doctor:
--   select public.elevate_to_doctor('user-uuid-here');
-- ==============================================================================
create or replace function public.elevate_to_doctor(target_user_id uuid)
returns void as $$
begin
  update public.profiles
  set role = 'doctor'
  where id = target_user_id;
end;
$$ language plpgsql security definer;
