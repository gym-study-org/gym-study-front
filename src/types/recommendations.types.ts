export type RelationshipType = 'study_partner' | 'mentor' | 'colleague';

export interface Recommendation {
  id: string;
  author_id: string;
  recipient_id: string;
  relationship: RelationshipType;
  content: string;
  is_visible: boolean;
  author_username: string;
  author_avatar_url: string | null;
  author_level: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRecommendationInput {
  recipient_id: string;
  relationship: RelationshipType;
  content: string;
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  study_partner: 'Parceiro de Estudos',
  mentor: 'Mentor',
  colleague: 'Colega',
};
