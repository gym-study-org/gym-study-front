export interface League {
  id: string;
  tier: number;
  name: string;
  name_pt: string;
  icon: string;
  color: string;
  promotion_slots: number;
  demotion_slots: number;
}

export interface LeagueMemberRanking {
  user_id: string;
  username: string;
  avatar_url: string | null;
  weekly_xp: number;
  position: number;
  level: number;
}

export interface CurrentLeagueResponse {
  league: League;
  season_week: string;
  my_position: number | null;
  my_weekly_xp: number;
  members: LeagueMemberRanking[];
  promotion_zone: number;
  demotion_zone: number;
  total_members: number;
}

export interface LeagueHistoryEntry {
  season_week: string;
  league_name_pt: string;
  league_tier: number;
  league_color: string;
  final_position: number;
  final_xp: number;
  promoted: boolean;
  demoted: boolean;
}

export interface LeagueHistoryResponse {
  history: LeagueHistoryEntry[];
  next_cursor: string | null;
}

export const LEAGUE_NAMES: Record<number, string> = {
  1: 'Bronze',
  2: 'Prata',
  3: 'Ouro',
  4: 'Safira',
  5: 'Rubi',
  6: 'Esmeralda',
  7: 'Ametista',
  8: 'Pérola',
  9: 'Obsidiana',
  10: 'Diamante',
};
