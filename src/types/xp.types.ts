export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  source_id: string | null;
  multiplier: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface XPRule {
  id: string;
  source: string;
  base_amount: number;
  description_pt: string;
  is_active: boolean;
}

export interface XPSummary {
  total_xp: number;
  weekly_xp: number;
  level: number;
  next_level_xp: number;
  xp_to_next_level: number;
  level_progress_percent: number;
}

export const XP_SOURCE_LABELS: Record<string, string> = {
  study_session: 'Sessão de Estudo',
  first_session_of_day: 'Primeira Sessão do Dia',
  streak_bonus_7: 'Ofensiva de 7 dias',
  streak_bonus_30: 'Ofensiva de 30 dias',
  streak_bonus_50: 'Ofensiva de 50 dias',
  streak_bonus_100: 'Ofensiva de 100 dias',
  streak_bonus_200: 'Ofensiva de 200 dias',
  streak_bonus_365: 'Ofensiva de 365 dias',
  challenge_complete: 'Desafio Completo',
  challenge_win: 'Vitória em Desafio',
  badge_earned: 'Badge Conquistado',
  achievement_unlocked: 'Conquista Desbloqueada',
  daily_quest_bronze: 'Missão Diária Bronze',
  daily_quest_silver: 'Missão Diária Prata',
  daily_quest_gold: 'Missão Diária Ouro',
  friend_quest_complete: 'Missão com Amigo',
  certification_pass: 'Certificação Aprovada',
  goal_complete: 'Meta Completa',
  endorsement_received: 'Endorsement Recebido',
};
