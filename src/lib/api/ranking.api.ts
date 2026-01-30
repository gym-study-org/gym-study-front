import apiClient from './client';

export interface RankingEntry {
  position: number;
  user_id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  total_study_hours: number;
  total_sessions: number;
  total_certifications: number;
  current_streak: number;
  is_friend: boolean;
  is_current_user: boolean;
}

export interface UserPosition {
  global_position: number;
  total_users: number;
  friends_position: number;
  total_friends: number;
}

export const rankingApi = {
  getGlobalRanking: async (limit = 50, offset = 0) => {
    const response = await apiClient.get<{ data: RankingEntry[] }>(
      `/ranking/global?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  },

  getFriendsRanking: async () => {
    const response = await apiClient.get<{ data: RankingEntry[] }>('/ranking/friends');
    return response.data.data;
  },

  getMonthlyRanking: async (limit = 50) => {
    const response = await apiClient.get<{ data: RankingEntry[] }>(`/ranking/monthly?limit=${limit}`);
    return response.data.data;
  },

  getWeeklyRanking: async (limit = 50) => {
    const response = await apiClient.get<{ data: RankingEntry[] }>(`/ranking/weekly?limit=${limit}`);
    return response.data.data;
  },

  getUserPosition: async () => {
    const response = await apiClient.get<{ data: UserPosition }>('/ranking/position');
    return response.data.data;
  },
};
