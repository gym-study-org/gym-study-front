import apiClient from './client';
import { Recommendation, CreateRecommendationInput } from '@/types/recommendations.types';

export const recommendationsApi = {
  create: async (data: CreateRecommendationInput): Promise<Recommendation> => {
    const response = await apiClient.post<{ data: Recommendation }>('/recommendations', data);
    return response.data.data;
  },

  getForUser: async (userId: string): Promise<Recommendation[]> => {
    const response = await apiClient.get<{ data: { recommendations: Recommendation[] } }>(
      `/recommendations/user/${userId}`
    );
    return response.data.data.recommendations;
  },

  getReceived: async (): Promise<Recommendation[]> => {
    const response = await apiClient.get<{ data: { recommendations: Recommendation[] } }>(
      '/recommendations/received'
    );
    return response.data.data.recommendations;
  },

  getWritten: async (): Promise<Recommendation[]> => {
    const response = await apiClient.get<{ data: { recommendations: Recommendation[] } }>(
      '/recommendations/written'
    );
    return response.data.data.recommendations;
  },

  update: async (id: string, data: { content?: string; is_visible?: boolean }): Promise<Recommendation> => {
    const response = await apiClient.put<{ data: Recommendation }>(`/recommendations/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/recommendations/${id}`);
  },
};
