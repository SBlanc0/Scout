create table if not exists teams (
  id text primary key,
  name text not null,
  fifa_code text,
  confederation text,
  group_code text,
  flag text,
  elo integer not null default 1500,
  fifa_rank integer,
  goals_for numeric(5, 2) not null default 1.30,
  goals_against numeric(5, 2) not null default 1.20,
  form text[] not null default '{}'
);

create table if not exists matches (
  id text primary key,
  match_date timestamptz not null,
  stage text not null,
  group_code text,
  venue text,
  home_team_id text not null references teams(id),
  away_team_id text not null references teams(id),
  home_goals integer,
  away_goals integer,
  status text not null default 'SCHEDULED'
);

create table if not exists predictions (
  id bigserial primary key,
  match_id text not null references matches(id),
  prob_home numeric(6, 5) not null,
  prob_draw numeric(6, 5) not null,
  prob_away numeric(6, 5) not null,
  prob_btts numeric(6, 5) not null,
  prob_over25 numeric(6, 5) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_matches_date on matches(match_date);
create index if not exists idx_predictions_match_id on predictions(match_id);
