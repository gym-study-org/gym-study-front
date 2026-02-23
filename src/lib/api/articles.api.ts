import apiClient from './client';
import { Article, ArticleListResponse, CreateArticleInput, UpdateArticleInput } from '@/types/articles.types';

export const articlesApi = {
  listPublished: async (limit = 20, cursor?: string, tag?: string): Promise<ArticleListResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    if (tag) params.set('tag', tag);
    const response = await apiClient.get<{ data: ArticleListResponse }>(`/articles?${params.toString()}`);
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const response = await apiClient.get<{ data: Article }>(`/articles/slug/${slug}`);
    return response.data.data;
  },

  getDrafts: async (limit = 20, cursor?: string): Promise<ArticleListResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: ArticleListResponse }>(`/articles/drafts?${params.toString()}`);
    return response.data.data;
  },

  create: async (data: CreateArticleInput): Promise<Article> => {
    const response = await apiClient.post<{ data: Article }>('/articles', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateArticleInput): Promise<Article> => {
    const response = await apiClient.put<{ data: Article }>(`/articles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  },

  publish: async (id: string): Promise<Article> => {
    const response = await apiClient.post<{ data: Article }>(`/articles/${id}/publish`);
    return response.data.data;
  },

  unpublish: async (id: string): Promise<Article> => {
    const response = await apiClient.post<{ data: Article }>(`/articles/${id}/unpublish`);
    return response.data.data;
  },

  toggleLike: async (id: string): Promise<{ liked: boolean; likes_count: number }> => {
    const response = await apiClient.post<{ data: { liked: boolean; likes_count: number } }>(
      `/articles/${id}/like`
    );
    return response.data.data;
  },

  listByUser: async (userId: string, limit = 20, cursor?: string): Promise<ArticleListResponse> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<{ data: ArticleListResponse }>(
      `/articles/user/${userId}?${params.toString()}`
    );
    return response.data.data;
  },
};
