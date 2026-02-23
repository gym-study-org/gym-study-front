import apiClient from './client';
import {
  StudyGroup,
  StudyGroupMember,
  StudyGroupMessage,
  CreateGroupInput,
  UpdateGroupInput,
} from '@/types/groups.types';

interface GroupListResponse {
  groups: StudyGroup[];
  next_cursor: string | null;
  has_more: boolean;
}

interface MessagesResponse {
  messages: StudyGroupMessage[];
  next_cursor: string | null;
  has_more: boolean;
}

export const groupsApi = {
  list: async (filter: 'my' | 'public' | 'all' = 'all', limit = 20, cursor?: string): Promise<GroupListResponse> => {
    const params = new URLSearchParams();
    params.set('filter', filter);
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: GroupListResponse }>(`/groups?${params.toString()}`);
    return response.data.data;
  },

  get: async (groupId: string): Promise<StudyGroup> => {
    const response = await apiClient.get<{ data: StudyGroup }>(`/groups/${groupId}`);
    return response.data.data;
  },

  create: async (data: CreateGroupInput): Promise<StudyGroup> => {
    const response = await apiClient.post<{ data: StudyGroup }>('/groups', data);
    return response.data.data;
  },

  update: async (groupId: string, data: UpdateGroupInput): Promise<StudyGroup> => {
    const response = await apiClient.put<{ data: StudyGroup }>(`/groups/${groupId}`, data);
    return response.data.data;
  },

  delete: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}`);
  },

  join: async (groupId: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/join`);
  },

  leave: async (groupId: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/leave`);
  },

  getMembers: async (groupId: string): Promise<StudyGroupMember[]> => {
    const response = await apiClient.get<{ data: StudyGroupMember[] }>(`/groups/${groupId}/members`);
    return response.data.data;
  },

  kickMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },

  sendMessage: async (groupId: string, content: string, messageType = 'text'): Promise<StudyGroupMessage> => {
    const response = await apiClient.post<{ data: StudyGroupMessage }>(`/groups/${groupId}/messages`, {
      content,
      message_type: messageType,
    });
    return response.data.data;
  },

  getMessages: async (groupId: string, limit = 30, cursor?: string): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: MessagesResponse }>(
      `/groups/${groupId}/messages?${params.toString()}`
    );
    return response.data.data;
  },
};
