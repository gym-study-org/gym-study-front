import apiClient from './client';

export interface UserCertification {
  id: string;
  name: string;
  provider: string | null;
  category: string | null;
  passed: boolean;
  obtained_at: string;
  credential_url: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  total_study_hours: number;
  current_streak: number;
  longest_streak: number;
  member_since: string;
  certifications: UserCertification[];
  is_friend: boolean;
  friendship_status: 'accepted' | 'pending' | 'none';
}

export interface UpdateUserInput {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_study_hours: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
}

export const usersApi = {
  getMe: async () => {
    const response = await apiClient.get<{ data: CurrentUser }>('/users/me');
    return response.data.data;
  },

  updateMe: async (data: UpdateUserInput) => {
    const response = await apiClient.put<{ data: CurrentUser }>('/users/me', data);
    return response.data.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<{ data: CurrentUser }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getPublicProfile: async (userId: string) => {
    const response = await apiClient.get<{ data: UserProfile }>(`/users/${userId}/profile`);
    return response.data.data;
  },

  getProfileByUsername: async (username: string) => {
    const response = await apiClient.get<{ data: UserProfile }>(`/users/by-username/${username}/profile`);
    return response.data.data;
  },
};
