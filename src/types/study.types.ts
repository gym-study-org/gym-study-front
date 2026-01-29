export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  description: string | null;
  duration_minutes: number;
  is_for_certification: boolean;
  certification_name: string | null;
  tags: string[] | null;
  started_at: string;
  finished_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudySessionInput {
  title: string;
  subject: string;
  description?: string;
  duration_minutes: number;
  is_for_certification?: boolean;
  certification_name?: string;
  tags?: string[];
  started_at: string;
  finished_at: string;
}

export interface StudySessionStats {
  total_sessions: number;
  total_hours: number;
  total_minutes: number;
  subjects: {
    subject: string;
    count: number;
    total_minutes: number;
  }[];
  recent_sessions: StudySession[];
}
