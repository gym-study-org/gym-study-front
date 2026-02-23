export type NotificationType =
  | 'friendship_request'
  | 'friendship_accepted'
  | 'post_liked'
  | 'post_commented'
  | 'badge_level_up'
  | 'achievement_unlocked'
  | 'challenge_invite'
  | 'challenge_completed'
  | 'endorsement_received'
  | 'streak_warning'
  | 'weekly_summary';

export interface NotificationWithActor {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
  actor_username: string | null;
  actor_avatar_url: string | null;
}

export interface NotificationQuery {
  limit?: number;
  cursor?: string;
  unread_only?: boolean;
}
