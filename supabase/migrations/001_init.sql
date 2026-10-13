-- Diverge game schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/nqfbpyzuczjqurxcjxiy/sql/new

create extension if not exists "uuid-ossp";

create table if not exists seasons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  diversion_point text not null,
  faction_a_name text not null,
  faction_a_desc text not null,
  faction_a_color text not null default '#4A90D9',
  faction_b_name text not null,
  faction_b_desc text not null,
  faction_b_color text not null default '#E8823A',
  start_date date not null,
  end_date date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists news_articles (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id),
  day_number integer not null,
  faction text check (faction in ('A', 'B')) not null,
  headline text not null,
  body text not null,
  morale_delta integer default 0,
  prosperity_delta integer default 0,
  conflict_delta integer default 0,
  created_at timestamptz default now()
);

create table if not exists daily_decisions (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id),
  day_number integer not null,
  faction text check (faction in ('A', 'B')) not null,
  question text not null,
  option_x text not null,
  option_y text not null,
  created_at timestamptz default now()
);

create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  decision_id uuid references daily_decisions(id),
  choice text check (choice in ('X', 'Y')) not null,
  created_at timestamptz default now(),
  unique(user_id, decision_id)
);

create table if not exists world_states (
  season_id uuid references seasons(id),
  day_number integer not null,
  faction text check (faction in ('A', 'B')) not null,
  morale integer default 50,
  prosperity integer default 50,
  conflict integer default 50,
  primary key (season_id, day_number, faction)
);

create table if not exists verdicts (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id),
  content text not null,
  winner text check (winner in ('A', 'B', 'tie')) not null,
  created_at timestamptz default now()
);

-- Disable RLS (anonymous play, no auth)
alter table seasons disable row level security;
alter table news_articles disable row level security;
alter table daily_decisions disable row level security;
alter table votes disable row level security;
alter table world_states disable row level security;
alter table verdicts disable row level security;
