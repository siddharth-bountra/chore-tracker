-- Run in Neon Dashboard → SQL Editor (or psql). Chore Tracker: tasks + status.

create table if not exists tasks (
  task_id text primary key,
  text text not null default '',
  schedule_type text not null default 'DAILY',
  days text not null default '',
  rule text not null default '',
  active boolean not null default true
);

create table if not exists status (
  date text not null,
  task_id text not null,
  completed boolean not null default false,
  timestamp timestamptz,
  primary key (date, task_id)
);

create table if not exists settings (
  key text primary key,
  value text not null default ''
);
