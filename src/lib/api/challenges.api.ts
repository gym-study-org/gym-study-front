import apiClient from './client';

export type ChallengeType = 'hours' | 'sessions' | 'streak' | 'certifications';
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  challenge_type: ChallengeType;
  target_value: number;
  status: ChallengeStatus;
  start_date: string;
  end_date: string;
  winner_id: string | null;
  creator_name: string;
  creator_avatar_url: string | null;
  participants_count: number;
  my_progress: number;
  my_status: string;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar_url: string | null;
  current_value: number;
  position: number;
  invitation_status: string;
}

export interface CreateChallengeInput {
  title: string;
  description?: string;
  challenge_type: ChallengeType;
  target_value: number;
  start_date: string;
  end_date: string;
  invited_friends: string[];
}

export const challengesApi = {
  getMyChallenges: async () => {
    const response = await apiClient.get<{ data: Challenge[] }>('/challenges');
    return response.data.data;
  },

  getPendingInvitations: async () => {
    const response = await apiClient.get<{ data: Challenge[] }>('/challenges/invitations');
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Challenge }>(`/challenges/${id}`);
    return response.data.data;
  },

  getParticipants: async (id: string) => {
    const response = await apiClient.get<{ data: ChallengeParticipant[] }>(`/challenges/${id}/participants`);
    return response.data.data;
  },

  getLeaderboard: async (id: string) => {
    const response = await apiClient.get<{ data: ChallengeParticipant[] }>(`/challenges/${id}/leaderboard`);
    return response.data.data;
  },

  create: async (data: CreateChallengeInput) => {
    const response = await apiClient.post<{ data: Challenge }>('/challenges', data);
    return response.data.data;
  },

  respondToInvitation: async (id: string, status: 'accepted' | 'rejected') => {
    const response = await apiClient.patch(`/challenges/${id}/respond`, { status });
    return response.data;
  },

  startChallenge: async (id: string) => {
    const response = await apiClient.patch<{ data: Challenge }>(`/challenges/${id}/start`);
    return response.data.data;
  },

  cancelChallenge: async (id: string) => {
    const response = await apiClient.delete(`/challenges/${id}`);
    return response.data;
  },
};
