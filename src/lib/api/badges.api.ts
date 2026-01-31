import apiClient from './client';

// Types
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type BadgeCategory =
  | 'study_hours'
  | 'streak'
  | 'social'
  | 'certifications'
  | 'goals'
  | 'sessions'
  | 'special';

export interface BadgeLevel {
  level: number;
  requirement: number;
  points: number;
  name: string;
  tier: BadgeTier;
}

export interface BadgeDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  stat_key: string;
  max_level: number;
  levels: BadgeLevel[];
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  current_level: number;
  current_value: number;
  total_points_earned: number;
  first_unlocked_at: string | null;
  last_level_up_at: string | null;
  created_at: string;
  updated_at: string;
  badge: BadgeDefinition;
  next_level: BadgeLevel | null;
  progress_percentage: number;
  is_max_level: boolean;
  current_level_info: BadgeLevel | null;
}

export interface UserBadgesResponse {
  badges: UserBadge[];
  total_points: number;
  total_levels_unlocked: number;
  max_possible_levels: number;
}

export interface BadgeCategoryStats {
  category: BadgeCategory;
  label: string;
  icon: string;
  badges: UserBadge[];
  total_levels: number;
  unlocked_levels: number;
  points_earned: number;
  max_points: number;
}

export interface BadgeLevelUpEvent {
  badge: {
    id: string;
    code: string;
    name: string;
    icon: string;
    category: BadgeCategory;
  };
  from_level: number;
  to_level: number;
  level_info: BadgeLevel;
  points_earned: number;
  new_total_points: number;
  timestamp: string;
}

// Constants
export const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

export const TIER_BG_COLORS: Record<BadgeTier, string> = {
  bronze: 'bg-amber-900/20 border-amber-700',
  silver: 'bg-slate-400/20 border-slate-400',
  gold: 'bg-yellow-500/20 border-yellow-500',
  platinum: 'bg-slate-200/20 border-slate-200',
  diamond: 'bg-cyan-400/20 border-cyan-400',
};

export const TIER_TEXT_COLORS: Record<BadgeTier, string> = {
  bronze: 'text-amber-700',
  silver: 'text-slate-400',
  gold: 'text-yellow-500',
  platinum: 'text-slate-200',
  diamond: 'text-cyan-400',
};

export const TIER_GLOW_COLORS: Record<BadgeTier, string> = {
  bronze: 'shadow-amber-700/50',
  silver: 'shadow-slate-400/50',
  gold: 'shadow-yellow-500/50',
  platinum: 'shadow-slate-200/50',
  diamond: 'shadow-cyan-400/50',
};

export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  study_hours: 'Horas de Estudo',
  streak: 'Sequência',
  social: 'Social',
  certifications: 'Certificações',
  goals: 'Metas',
  sessions: 'Sessões',
  special: 'Especiais',
};

export const CATEGORY_ICONS: Record<BadgeCategory, string> = {
  study_hours: 'GraduationCap',
  streak: 'Flame',
  social: 'Users',
  certifications: 'Award',
  goals: 'Target',
  sessions: 'Swords',
  special: 'Sparkles',
};

// API Functions
export const badgesApi = {
  /**
   * Get all badge definitions
   */
  getAll: async (): Promise<BadgeDefinition[]> => {
    const response = await apiClient.get('/badges');
    return response.data.data;
  },

  /**
   * Get current user's badges with progress
   */
  getMine: async (): Promise<UserBadgesResponse> => {
    const response = await apiClient.get('/badges/me');
    return response.data.data;
  },

  /**
   * Get current user's category stats
   */
  getCategoryStats: async (): Promise<BadgeCategoryStats[]> => {
    const response = await apiClient.get('/badges/me/stats');
    return response.data.data;
  },

  /**
   * Get current user's recent level-ups
   */
  getRecentLevelUps: async (limit: number = 10): Promise<BadgeLevelUpEvent[]> => {
    const response = await apiClient.get(`/badges/me/recent?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get current user's total points
   */
  getTotalPoints: async (): Promise<number> => {
    const response = await apiClient.get('/badges/me/points');
    return response.data.data.total_points;
  },

  /**
   * Force check badges for current user
   */
  checkBadges: async (category?: BadgeCategory): Promise<{ level_ups: BadgeLevelUpEvent[]; count: number }> => {
    const response = await apiClient.post('/badges/check', { category });
    return response.data.data;
  },

  /**
   * Get another user's badges
   */
  getUserBadges: async (userId: string): Promise<UserBadgesResponse> => {
    const response = await apiClient.get(`/badges/user/${userId}`);
    return response.data.data;
  },
};

// Helper function to get tier from level
export function getTierFromLevel(badge: UserBadge): BadgeTier {
  if (badge.current_level === 0) return 'bronze';
  return badge.current_level_info?.tier || 'bronze';
}

// Helper function to format requirement value
export function formatRequirement(value: number, category: BadgeCategory): string {
  switch (category) {
    case 'study_hours':
      return `${value}h`;
    case 'streak':
      return `${value} dias`;
    case 'sessions':
      return `${value} sessões`;
    case 'social':
      return `${value} amigos`;
    case 'certifications':
      return `${value} certs`;
    case 'goals':
      return `${value} metas`;
    default:
      return `${value}`;
  }
}
