import apiClient from './client';

export interface Friend {
  id: string;
  friend_id: string;
  friend_name: string;
  friend_email: string;
  friend_avatar_url: string | null;
  friend_total_study_hours: number;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  requester_avatar_url: string | null;
  created_at: string;
}

export interface SearchedUser {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  total_study_hours: number;
  friendship_status: string | null;
  request_direction: 'sent' | 'received' | null;
}

export const friendshipsApi = {
  getFriends: async () => {
    const response = await apiClient.get<{ data: Friend[] }>('/friendships');
    return response.data.data;
  },

  getPendingRequests: async () => {
    const response = await apiClient.get<{ data: FriendRequest[] }>('/friendships/requests/pending');
    return response.data.data;
  },

  getSentRequests: async () => {
    const response = await apiClient.get<{ data: any[] }>('/friendships/requests/sent');
    return response.data.data;
  },

  sendRequest: async (addresseeId: string) => {
    const response = await apiClient.post('/friendships/request', { addressee_id: addresseeId });
    return response.data;
  },

  respondToRequest: async (requestId: string, status: 'accepted' | 'rejected') => {
    const response = await apiClient.patch(`/friendships/request/${requestId}`, { status });
    return response.data;
  },

  cancelRequest: async (requestId: string) => {
    const response = await apiClient.delete(`/friendships/request/${requestId}`);
    return response.data;
  },

  removeFriend: async (friendId: string) => {
    const response = await apiClient.delete(`/friendships/${friendId}`);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await apiClient.get<{ data: SearchedUser[] }>(`/friendships/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};
