import apiClient from './client';
import { GemsBalance, GemTransaction, ShopItem } from '@/types/gems.types';

interface GemHistoryResponse {
  transactions: GemTransaction[];
  next_cursor: string | null;
}

export const gemsApi = {
  getBalance: async (): Promise<GemsBalance> => {
    const response = await apiClient.get<{ data: GemsBalance }>('/gems/balance');
    return response.data.data;
  },

  getHistory: async (limit = 20, cursor?: string): Promise<GemHistoryResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: GemHistoryResponse }>(
      `/gems/history?${params.toString()}`
    );
    return response.data.data;
  },

  getShop: async (): Promise<ShopItem[]> => {
    const response = await apiClient.get<{ data: ShopItem[] }>('/gems/shop');
    return response.data.data;
  },

  purchase: async (itemCode: string): Promise<{ item: ShopItem; new_balance: number }> => {
    const response = await apiClient.post<{ data: { item: ShopItem; new_balance: number } }>(
      `/gems/shop/${itemCode}/purchase`
    );
    return response.data.data;
  },
};
