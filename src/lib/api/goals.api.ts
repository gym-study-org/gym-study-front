import apiClient from './client';
import { Goal, CreateGoalInput, GoalStats, GoalStatus } from '@/types/goals.types';

export const goalsApi = {
  create: async (data: CreateGoalInput) => {
    const response = await apiClient.post<{ data: Goal }>('/goals', data);
    return response.data.data;
  },

  getAll: async (page = 1, limit = 20, status?: GoalStatus) => {
    let url = `/goals?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get<{
      data: Goal[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Goal }>(`/goals/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateGoalInput> & { status?: GoalStatus }) => {
    const response = await apiClient.put<{ data: Goal }>(`/goals/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/goals/${id}`);
  },

  updateProgress: async (id: string, increment: number) => {
    const response = await apiClient.patch<{ data: Goal }>(`/goals/${id}/progress`, {
      increment,
    });
    return response.data.data;
  },

  getStats: async () => {
    const response = await apiClient.get<{ data: GoalStats }>('/goals/stats');
    return response.data.data;
  },
};
