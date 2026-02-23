export interface StreakMilestoneInfo {
  days: number;
  days_remaining: number;
  xp_reward: number;
}

export interface StreakStatus {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  streak_freezes_available: number;
  streak_freeze_used_today: boolean;
  next_milestone: StreakMilestoneInfo | null;
  milestones_achieved: number[];
}

export const STREAK_MILESTONES = [7, 30, 50, 100, 200, 365, 500, 1000];
