import apiClient from './client';
import {
  PostWithAuthor,
  PostWithComments,
  CommentWithAuthor,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  FeedQuery,
} from '@/types/feed.types';

export interface FeedResponse {
  posts: PostWithAuthor[];
  next_cursor: string | null;
  has_more: boolean;
}

export const feedApi = {
  getFeed: async (query?: FeedQuery): Promise<FeedResponse> => {
    const params = new URLSearchParams();
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.cursor) params.set('cursor', query.cursor);
    if (query?.filter) params.set('filter', query.filter);
    const response = await apiClient.get<{ data: FeedResponse }>(
      `/feed?${params.toString()}`
    );
    return response.data.data;
  },

  getExploreFeed: async (query?: FeedQuery): Promise<FeedResponse> => {
    const params = new URLSearchParams();
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.cursor) params.set('cursor', query.cursor);
    const response = await apiClient.get<{ data: FeedResponse }>(
      `/feed/explore?${params.toString()}`
    );
    return response.data.data;
  },

  getUserFeed: async (
    userId: string,
    limit?: number,
    cursor?: string
  ): Promise<FeedResponse> => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: FeedResponse }>(
      `/feed/user/${userId}?${params.toString()}`
    );
    return response.data.data;
  },

  createPost: async (data: CreatePostInput): Promise<PostWithAuthor> => {
    const response = await apiClient.post<{ data: PostWithAuthor }>('/feed/posts', data);
    return response.data.data;
  },

  getPost: async (postId: string): Promise<PostWithComments> => {
    const response = await apiClient.get<{ data: PostWithComments }>(`/feed/posts/${postId}`);
    return response.data.data;
  },

  updatePost: async (postId: string, data: UpdatePostInput): Promise<PostWithAuthor> => {
    const response = await apiClient.put<{ data: PostWithAuthor }>(`/feed/posts/${postId}`, data);
    return response.data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/feed/posts/${postId}`);
  },

  toggleLike: async (postId: string): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await apiClient.post<{ data: { liked: boolean; likes_count: number } }>(
      `/feed/posts/${postId}/like`
    );
    return response.data.data;
  },

  addComment: async (postId: string, data: CreateCommentInput): Promise<CommentWithAuthor> => {
    const response = await apiClient.post<{ data: CommentWithAuthor }>(
      `/feed/posts/${postId}/comments`,
      data
    );
    return response.data.data;
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/feed/posts/${postId}/comments/${commentId}`);
  },

  toggleCommentLike: async (
    postId: string,
    commentId: string
  ): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await apiClient.post<{ data: { liked: boolean; likes_count: number } }>(
      `/feed/posts/${postId}/comments/${commentId}/like`
    );
    return response.data.data;
  },

  reactToPost: async (
    postId: string,
    reactionType: string
  ): Promise<{ added: boolean; reactions: Record<string, number> }> => {
    const response = await apiClient.post<{ data: { added: boolean; reactions: Record<string, number> } }>(
      `/feed/posts/${postId}/react`,
      { reaction_type: reactionType }
    );
    return response.data.data;
  },

  getPostReactions: async (
    postId: string
  ): Promise<{ reactions: Record<string, number>; my_reactions: string[] }> => {
    const response = await apiClient.get<{ data: { reactions: Record<string, number>; my_reactions: string[] } }>(
      `/feed/posts/${postId}/reactions`
    );
    return response.data.data;
  },

  votePoll: async (
    postId: string,
    optionIndex: number
  ): Promise<{ votes: Record<number, number>; total_votes: number; my_vote: number }> => {
    const response = await apiClient.post<{ data: { votes: Record<number, number>; total_votes: number; my_vote: number } }>(
      `/feed/posts/${postId}/vote`,
      { option_index: optionIndex }
    );
    return response.data.data;
  },

  getPollResults: async (
    postId: string
  ): Promise<{ votes: Record<number, number>; total_votes: number; my_vote: number | null }> => {
    const response = await apiClient.get<{ data: { votes: Record<number, number>; total_votes: number; my_vote: number | null } }>(
      `/feed/posts/${postId}/poll-results`
    );
    return response.data.data;
  },

  searchUsersForMention: async (
    q: string,
    limit = 10
  ): Promise<{ id: string; username: string; full_name: string | null; avatar_url: string | null }[]> => {
    const response = await apiClient.get<{ data: { id: string; username: string; full_name: string | null; avatar_url: string | null }[] }>(
      `/feed/search-users?q=${encodeURIComponent(q)}&limit=${limit}`
    );
    return response.data.data;
  },
};
