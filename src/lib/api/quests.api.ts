import apiClient from './client';
import { UserDailyQuest } from '@/types/quests.types';

export const questsApi = {
  getDaily: async (): Promise<UserDailyQuest[]> => {
    const response = await apiClient.get<{ data: UserDailyQuest[] }>('/quests/daily');
    return response.data.data;
  },

  claim: async (questId: string): Promise<{ xp_awarded: number }> => {
    const response = await apiClient.post<{ data: { xp_awarded: number } }>(
      `/quests/${questId}/claim`
    );
    return response.data.data;
  },
};
