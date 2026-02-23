import apiClient from './client';
import { StreakStatus } from '@/types/streak.types';

export const streakApi = {
  getStatus: async (): Promise<StreakStatus> => {
    const response = await apiClient.get<{ data: StreakStatus }>('/streak/status');
    return response.data.data;
  },

  buyFreeze: async (): Promise<{ freezes_available: number }> => {
    const response = await apiClient.post<{ data: { freezes_available: number } }>('/streak/buy-freeze');
    return response.data.data;
  },
};
