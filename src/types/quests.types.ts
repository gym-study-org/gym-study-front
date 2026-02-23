export interface UserDailyQuest {
  id: string;
  user_id: string;
  quest_template_id: string;
  quest_date: string;
  current_progress: number;
  target_value: number;
  is_completed: boolean;
  completed_at: string | null;
  xp_claimed: boolean;
  claimed_at: string | null;
  quest_type: string;
  tier: 'bronze' | 'silver' | 'gold';
  title_pt: string;
  description_pt: string;
  xp_reward: number;
}

export const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
};

export const TIER_COLORS: Record<string, string> = {
  bronze: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  silver: 'text-gray-600 bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300',
  gold: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
};
