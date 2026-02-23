import apiClient from './client';
import { XPSummary, XPTransaction, XPRule } from '@/types/xp.types';

interface XPHistoryResponse {
  transactions: XPTransaction[];
  next_cursor: string | null;
}

export const xpApi = {
  getSummary: async (): Promise<XPSummary> => {
    const response = await apiClient.get<{ data: XPSummary }>('/xp/me');
    return response.data.data;
  },

  getHistory: async (
    limit = 20,
    cursor?: string,
    source?: string
  ): Promise<XPHistoryResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    if (source) params.set('source', source);
    const response = await apiClient.get<{ data: XPHistoryResponse }>(
      `/xp/history?${params.toString()}`
    );
    return response.data.data;
  },

  getRules: async (): Promise<XPRule[]> => {
    const response = await apiClient.get<{ data: XPRule[] }>('/xp/rules');
    return response.data.data;
  },
};
