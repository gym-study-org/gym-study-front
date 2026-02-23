export type PostType =
  | 'text'
  | 'study_output'
  | 'certification_share'
  | 'achievement_share'
  | 'challenge_complete'
  | 'milestone'
  | 'code_snippet'
  | 'poll'
  | 'shared_post';

export type PostVisibility = 'public' | 'friends' | 'private';
export type PostAudience = 'global' | 'personal';

export interface PostWithAuthor {
  id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  media_urls: string[];
  study_session_id: string | null;
  certification_id: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  visibility: PostVisibility;
  audience: PostAudience;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_full_name: string | null;
  author_avatar_url: string | null;
  is_liked_by_me: boolean;
}

export interface CommentWithAuthor {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_avatar_url: string | null;
  is_liked_by_me: boolean;
  replies?: CommentWithAuthor[];
}

export interface PostWithComments extends PostWithAuthor {
  comments: CommentWithAuthor[];
}

export interface CreatePostInput {
  content: string;
  post_type?: PostType;
  media_urls?: string[];
  study_session_id?: string;
  certification_id?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  visibility?: PostVisibility;
  audience?: PostAudience;
}

export interface UpdatePostInput {
  content?: string;
  media_urls?: string[];
  tags?: string[];
  visibility?: PostVisibility;
}

export interface CreateCommentInput {
  content: string;
  parent_id?: string;
}

export interface FeedQuery {
  limit?: number;
  cursor?: string;
  filter?: PostType;
}
