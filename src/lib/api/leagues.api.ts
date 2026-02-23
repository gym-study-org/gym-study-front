import apiClient from './client';
import { CurrentLeagueResponse, League, LeagueHistoryResponse } from '@/types/leagues.types';

export const leaguesApi = {
  getCurrent: async (): Promise<CurrentLeagueResponse> => {
    const response = await apiClient.get<{ data: CurrentLeagueResponse }>('/leagues/current');
    return response.data.data;
  },

  getHistory: async (limit = 20, cursor?: string): Promise<LeagueHistoryResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: LeagueHistoryResponse }>(
      `/leagues/history?${params.toString()}`
    );
    return response.data.data;
  },

  getInfo: async (): Promise<League[]> => {
    const response = await apiClient.get<{ data: League[] }>('/leagues/info');
    return response.data.data;
  },
};
