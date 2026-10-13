export type Faction = 'A' | 'B';
export type Choice = 'X' | 'Y';

export interface Season {
  id: string;
  title: string;
  diversion_point: string;
  faction_a_name: string;
  faction_a_desc: string;
  faction_a_color: string;
  faction_b_name: string;
  faction_b_desc: string;
  faction_b_color: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  is_active: boolean;
}

export interface NewsArticle {
  id: string;
  season_id: string;
  day_number: number;
  faction: Faction;
  headline: string;
  body: string;
  morale_delta: number;
  prosperity_delta: number;
  conflict_delta: number;
  created_at: string;
}

export interface DailyDecision {
  id: string;
  season_id: string;
  day_number: number;
  faction: Faction;
  question: string;
  option_x: string;
  option_y: string;
}

export interface Vote {
  id: string;
  user_id: string;
  decision_id: string;
  choice: Choice;
  created_at: string;
}

export interface WorldState {
  season_id: string;
  day_number: number;
  faction: Faction;
  morale: number;
  prosperity: number;
  conflict: number;
}

export interface Verdict {
  id: string;
  season_id: string;
  content: string;
  winner: Faction | 'tie';
  created_at: string;
}

// API response types
export interface GameState {
  season: Season;
  dayNumber: number;
  totalDays: number;
  worldStateA: WorldState;
  worldStateB: WorldState;
}

export interface DayNews {
  articles: NewsArticle[];
  decisions: DailyDecision[];
  myVotes: Record<string, Choice>; // decision_id -> choice
  voteCounts: Record<string, { X: number; Y: number }>; // decision_id -> counts
}

export interface GeneratedNewsItem {
  headline: string;
  body: string;
  morale_delta: number;
  prosperity_delta: number;
  conflict_delta: number;
  decision: {
    question: string;
    option_x: string;
    option_y: string;
  };
}
