export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  status: ArticleStatus;
  published_at: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_full_name: string | null;
  author_avatar_url: string | null;
  author_level: number;
  is_liked_by_me?: boolean;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image_url?: string | null;
  tags?: string[];
}

export interface ArticleListResponse {
  articles: Article[];
  next_cursor: string | null;
  has_more: boolean;
}
