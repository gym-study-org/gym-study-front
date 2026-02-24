export type StoryContentType = 'text' | 'image' | 'video' | 'study_update' | 'achievement';

export interface TextOverlay {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  x: number; // percent 0-100
  y: number; // percent 0-100
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number; // percent 0-100
  y: number; // percent 0-100
  size: number; // px
}

export interface StoryMetadata {
  filter?: string;
  text_overlays?: TextOverlay[];
  stickers?: StickerOverlay[];
  trim_start?: number;
  trim_end?: number;
}

export interface StoryWithAuthor {
  id: string;
  user_id: string;
  content_type: StoryContentType;
  content: string | null;
  media_url: string | null;
  metadata: Record<string, unknown>;
  background_color: string;
  views_count: number;
  expires_at: string;
  created_at: string;
  author_username: string;
  author_avatar_url: string | null;
  is_viewed_by_me: boolean;
}

export interface UserStoriesGroup {
  user_id: string;
  username: string;
  avatar_url: string | null;
  stories: StoryWithAuthor[];
  has_unviewed: boolean;
}

export interface CreateStoryInput {
  content_type?: StoryContentType;
  content?: string;
  media_url?: string;
  metadata?: Record<string, unknown>;
  background_color?: string;
}

export interface ProfileViewStats {
  total_views_7d: number;
  total_views_30d: number;
  recent_viewers: {
    user_id: string;
    username: string;
    avatar_url: string | null;
    viewed_at: string;
  }[];
}

export interface ProgressCardData {
  type: string;
  username: string;
  avatar_url: string | null;
  [key: string]: unknown;
}

export const STORY_BG_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#2d6a4f', '#d4a373', '#264653',
];
