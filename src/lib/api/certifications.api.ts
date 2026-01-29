import apiClient from './client';
import {
  Certification,
  CreateCertificationInput,
  CertificationStats,
} from '@/types/certifications.types';

export const certificationsApi = {
  create: async (data: CreateCertificationInput) => {
    const response = await apiClient.post<{ data: Certification }>('/certifications', data);
    return response.data.data;
  },

  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get<{
      data: Certification[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/certifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Certification }>(`/certifications/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateCertificationInput>) => {
    const response = await apiClient.put<{ data: Certification }>(`/certifications/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/certifications/${id}`);
  },

  getStats: async () => {
    const response = await apiClient.get<{ data: CertificationStats }>('/certifications/stats');
    return response.data.data;
  },

  getByCategory: async (category: string) => {
    const response = await apiClient.get<{ data: Certification[] }>(
      `/certifications/category/${category}`
    );
    return response.data.data;
  },
};
