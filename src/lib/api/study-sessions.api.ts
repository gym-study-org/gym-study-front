import apiClient from './client';
import { StudySession, CreateStudySessionInput, StudySessionStats } from '@/types/study.types';

export const studySessionsApi = {
  create: async (data: CreateStudySessionInput) => {
    const response = await apiClient.post<{ data: StudySession }>('/study-sessions', data);
    return response.data.data;
  },

  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get<{
      data: StudySession[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/study-sessions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: StudySession }>(`/study-sessions/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateStudySessionInput>) => {
    const response = await apiClient.put<{ data: StudySession }>(`/study-sessions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/study-sessions/${id}`);
  },

  getStats: async () => {
    const response = await apiClient.get<{ data: StudySessionStats }>('/study-sessions/stats');
    return response.data.data;
  },
};
