import apiClient from './client';
import {
  StoryWithAuthor,
  UserStoriesGroup,
  CreateStoryInput,
  ProfileViewStats,
  ProgressCardData,
} from '@/types/stories.types';

export const storiesApi = {
  create: async (data: CreateStoryInput): Promise<StoryWithAuthor> => {
    const response = await apiClient.post<{ data: StoryWithAuthor }>('/stories', data);
    return response.data.data;
  },

  getFeed: async (): Promise<UserStoriesGroup[]> => {
    const response = await apiClient.get<{ data: UserStoriesGroup[] }>('/stories/feed');
    return response.data.data;
  },

  getMine: async (): Promise<StoryWithAuthor[]> => {
    const response = await apiClient.get<{ data: StoryWithAuthor[] }>('/stories/mine');
    return response.data.data;
  },

  viewStory: async (storyId: string): Promise<void> => {
    await apiClient.post(`/stories/${storyId}/view`);
  },

  getViewers: async (storyId: string): Promise<{ user_id: string; username: string; avatar_url: string | null; viewed_at: string }[]> => {
    const response = await apiClient.get<{ data: { user_id: string; username: string; avatar_url: string | null; viewed_at: string }[] }>(
      `/stories/${storyId}/viewers`
    );
    return response.data.data;
  },

  deleteStory: async (storyId: string): Promise<void> => {
    await apiClient.delete(`/stories/${storyId}`);
  },

  getProfileViews: async (): Promise<ProfileViewStats> => {
    const response = await apiClient.get<{ data: ProfileViewStats }>('/stories/profile-views');
    return response.data.data;
  },

  recordProfileView: async (userId: string): Promise<void> => {
    await apiClient.post(`/stories/profile-views/${userId}`);
  },

  getProgressCard: async (type: 'weekly' | 'monthly' | 'streak' | 'overview'): Promise<ProgressCardData> => {
    const response = await apiClient.get<{ data: ProgressCardData }>(`/stories/progress-card/${type}`);
    return response.data.data;
  },
};
