export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  owner_id: string;
  avatar_url: string | null;
  max_members: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members_count: number;
  owner_username: string;
  owner_avatar_url: string | null;
  my_role: string | null;
}

export interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface StudyGroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'system' | 'study_share';
  metadata: Record<string, unknown>;
  created_at: string;
  author_username: string;
  author_avatar_url: string | null;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  subject?: string;
  is_public?: boolean;
  max_members?: number;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  subject?: string;
  is_public?: boolean;
  max_members?: number;
}

export type ReactionType = 'like' | 'love' | 'clap' | 'fire' | 'mind_blown' | 'rocket';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  clap: '👏',
  fire: '🔥',
  mind_blown: '🤯',
  rocket: '🚀',
};
