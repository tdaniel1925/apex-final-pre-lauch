// =============================================
// Training System Type Definitions
// =============================================

export type ContentType = 'audio' | 'video' | 'article' | 'pdf';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type DeliveryFrequency = 'daily' | 'weekly' | 'on_demand';
export type BadgeTier = 'common' | 'rare' | 'epic' | 'legendary';

export interface TrainingContent {
  id: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  difficulty_level: DifficultyLevel;

  // Media URLs
  audio_url: string | null;
  video_url: string | null;
  article_body: string | null;
  pdf_url: string | null;

  // Metadata
  duration_seconds: number | null;
  transcript: string | null;
  key_takeaways: string[] | null;
  tags: string[] | null;

  // Scheduling
  scheduled_for: string | null;
  is_published: boolean;

  // Tracking
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TrainingSubscription {
  id: string;
  user_id: string;

  // Delivery preferences
  delivery_frequency: DeliveryFrequency;
  delivery_email: boolean;
  delivery_sms: boolean;
  delivery_in_app: boolean;

  // Timing
  preferred_time: string | null; // HH:MM:SS format
  timezone: string;

  // Status
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface TrainingProgress {
  id: string;
  user_id: string;
  content_id: string;

  // Progress
  completed: boolean;
  completed_at: string | null;
  watch_time_seconds: number;
  progress_percentage: number;

  // Engagement
  liked: boolean;
  rating: number | null;

  // Tracking
  started_at: string;
  last_accessed_at: string;
}

export interface TrainingStreak {
  id: string;
  user_id: string;

  // Streak data
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;

  // Points
  total_points: number;
  daily_points: number;
  weekly_points: number;

  // Stats
  total_lessons_completed: number;
  total_watch_time_seconds: number;

  // Tracking
  created_at: string;
  updated_at: string;
}

export interface TrainingBadge {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  icon_url: string | null;

  // Unlock criteria
  criteria_type: string;
  criteria_value: number;

  // Display
  color: string | null;
  is_active: boolean;

  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;

  earned_at: string;

  // For joined queries
  badge?: TrainingBadge;
}

export interface TrainingNotification {
  id: string;
  user_id: string;
  content_id: string;

  // Delivery tracking
  scheduled_for: string;
  sent_at: string | null;
  opened_at: string | null;
  completed_at: string | null;

  // Channels
  sent_via_email: boolean;
  sent_via_sms: boolean;

  // Status
  status: string; // pending, sent, failed, cancelled
  error_message: string | null;

  created_at: string;
}

// =============================================
// API Response Types
// =============================================

export interface TrainingDashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  totalLessons: number;
  badgesEarned: number;
  leaderboardRank: number | null;
  badges: UserBadge[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  currentStreak: number;
  totalLessons: number;
  rank: number;
}

export interface BadgeWithEarned extends TrainingBadge {
  earned: boolean;
  earnedAt: string | null;
}

// =============================================
// Form/Input Types
// =============================================

export interface CreateContentInput {
  title: string;
  description?: string;
  content_type: ContentType;
  difficulty_level?: DifficultyLevel;
  audio_url?: string;
  video_url?: string;
  article_body?: string;
  pdf_url?: string;
  duration_seconds?: number;
  transcript?: string;
  key_takeaways?: string[];
  tags?: string[];
  scheduled_for?: string;
  is_published?: boolean;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  id: string;
}

export interface UpdateSubscriptionInput {
  delivery_frequency?: DeliveryFrequency;
  delivery_email?: boolean;
  delivery_sms?: boolean;
  delivery_in_app?: boolean;
  preferred_time?: string;
  timezone?: string;
  is_active?: boolean;
}

export interface UpdateProgressInput {
  content_id: string;
  completed?: boolean;
  watch_time_seconds?: number;
  progress_percentage?: number;
  liked?: boolean;
  rating?: number;
}
