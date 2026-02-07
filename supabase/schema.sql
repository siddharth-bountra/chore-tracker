-- Run this in Supabase Dashboard → SQL Editor → New query
-- Chores Tracker: tasks and status (replaces Google Sheets for sync)

-- Tasks (same structure as TASKS sheet)
create table if not exists public.tasks (
  task_id text primary key,
  text text not null default '',
  schedule_type text not null default 'DAILY',
  days text not null default '',
  rule text not null default '',
  active boolean not null default true
);

-- Status: one row per (date, task_id)
create table if not exists public.status (
  date text not null,
  task_id text not null,
  completed boolean not null default false,
  timestamp timestamptz,
  primary key (date, task_id)
);

-- Allow service role / anon to read and write (no auth in this app)
alter table public.tasks enable row level security;
alter table public.status enable row level security;

create policy "Allow all on tasks" on public.tasks for all using (true) with check (true);
create policy "Allow all on status" on public.status for all using (true) with check (true);

-- Optional: settings table (e.g. report_recipients) or use env vars
create table if not exists public.settings (
  key text primary key,
  value text not null default ''
);
create policy "Allow all on settings" on public.settings for all using (true) with check (true);
