import apiClient from './client';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type AchievementCategory =
  | 'study_hours'
  | 'streak'
  | 'social'
  | 'certifications'
  | 'goals'
  | 'sessions'
  | 'special';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  requirement_value: number;
  points: number;
  created_at: string;
}

export interface AchievementWithUnlockStatus extends Achievement {
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface AchievementListResponse {
  achievements: AchievementWithUnlockStatus[];
  total_points: number;
  unlocked_count: number;
  total_count: number;
}

export interface AchievementCategoryStats {
  category: AchievementCategory;
  label: string;
  unlocked: number;
  total: number;
  points_earned: number;
  max_points: number;
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

export const TIER_BG_COLORS: Record<AchievementTier, string> = {
  bronze: 'bg-amber-900/20 border-amber-700',
  silver: 'bg-gray-400/20 border-gray-400',
  gold: 'bg-yellow-500/20 border-yellow-500',
  platinum: 'bg-slate-300/20 border-slate-300',
  diamond: 'bg-cyan-300/20 border-cyan-300',
};

export const TIER_TEXT_COLORS: Record<AchievementTier, string> = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-slate-300',
  diamond: 'text-cyan-300',
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  study_hours: 'Horas de Estudo',
  streak: 'Sequencia',
  social: 'Social',
  certifications: 'Certificacoes',
  goals: 'Metas',
  sessions: 'Sessoes',
  special: 'Especiais',
};

export const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  study_hours: 'Clock',
  streak: 'Flame',
  social: 'Users',
  certifications: 'Award',
  goals: 'Target',
  sessions: 'Play',
  special: 'Star',
};

export const achievementsApi = {
  getAll: async (): Promise<Achievement[]> => {
    const response = await apiClient.get<{ data: Achievement[] }>('/achievements');
    return response.data.data;
  },

  getMine: async (): Promise<AchievementListResponse> => {
    const response = await apiClient.get<{ data: AchievementListResponse }>('/achievements/me');
    return response.data.data;
  },

  getCategoryStats: async (): Promise<AchievementCategoryStats[]> => {
    const response = await apiClient.get<{ data: AchievementCategoryStats[] }>('/achievements/me/stats');
    return response.data.data;
  },

  getRecent: async (limit: number = 5): Promise<Achievement[]> => {
    const response = await apiClient.get<{ data: Achievement[] }>(`/achievements/me/recent?limit=${limit}`);
    return response.data.data;
  },

  getTotalPoints: async (): Promise<number> => {
    const response = await apiClient.get<{ data: { total_points: number } }>('/achievements/me/points');
    return response.data.data.total_points;
  },

  checkAchievements: async (category?: AchievementCategory): Promise<{ unlocked: Achievement[]; count: number }> => {
    const response = await apiClient.post<{ data: { unlocked: Achievement[]; count: number } }>('/achievements/check', {
      category,
    });
    return response.data.data;
  },

  getUserAchievements: async (userId: string): Promise<AchievementListResponse> => {
    const response = await apiClient.get<{ data: AchievementListResponse }>(`/achievements/user/${userId}`);
    return response.data.data;
  },
};
