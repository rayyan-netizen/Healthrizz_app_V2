/**
 * TypeScript types for Health Rizz lesson content
 * These types match the Supabase schema for lessons
 */

// Base types matching Supabase schema
export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  type: LessonType;
  content_type: ContentType;
  persona_tags: string[];
  goal_tags: string[];
  world_id: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  /** When set, the whole lesson uses this zone name (e.g. "Splash Springs") and matching mascot only */
  primaryZoneLabel?: string | null;
  /** When set, the whole lesson uses this mascot image (e.g. Hydro Rizzler) for every slide */
  primaryMascotImage?: string | null;
}

export type LessonInsert = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
export type LessonUpdate = Partial<Omit<Lesson, 'id' | 'created_at'>>;

/** Optional ungraded 1-tap check (e.g. "Which has more water: kids or adults?") */
export interface SlideMicroCheck {
  prompt: string;
  options: string[];
  correct_index: number;
}

export interface LessonSlide {
  id: string;
  lesson_id: string;
  order: number;
  image_url: string | null;
  alt_text: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  has_interaction: boolean;
  interaction_type: InteractionType;
  created_at: string;
  updated_at: string;
  /** Optional ungraded micro-check for engagement (1-tap, instant feedback) */
  micro_check?: SlideMicroCheck | null;
  /** Optional mascot coach line (e.g. "Hydro Rizzler says: Kids have more water than adults!") */
  coach_line?: string | null;
  /** Optional mascot image path (e.g. /brand/mascots/Hydro Rizzler_1.png) */
  mascotImage?: string | null;
  /** Optional speech bubble tip near mascot (e.g. "Did you know?") */
  mascotTip?: string | null;
  /** Optional accent color for card border (e.g. #3b82f6 for blue) */
  accentColor?: string | null;
  /** Optional zone label for section header (e.g. "Splash Springs") */
  zoneLabel?: string | null;
}

export type LessonSlideInsert = Omit<LessonSlide, 'id' | 'created_at' | 'updated_at'>;
export type LessonSlideUpdate = Partial<Omit<LessonSlide, 'id' | 'created_at'>>;

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank';

export interface LessonQuizQuestion {
  id: string;
  lesson_id: string;
  slide_id: string | null;
  question_text: string;
  question_image_url: string | null;
  /** Defaults to 'multiple-choice' when omitted. */
  questionType?: QuizQuestionType;
  options: QuizOption[];
  /** Accepted answers for fill-in-the-blank (case-insensitive). */
  acceptedAnswers?: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export type LessonQuizQuestionInsert = Omit<LessonQuizQuestion, 'id' | 'created_at' | 'updated_at'>;
export type LessonQuizQuestionUpdate = Partial<Omit<LessonQuizQuestion, 'id' | 'created_at'>>;

// Enums
export type LessonType = 'presentation' | 'video' | 'interactive' | 'story';
export type ContentType = 'slides' | 'video' | 'cards' | 'quiz';
export type InteractionType = 'tap_continue' | 'quiz' | 'drag_drop' | null;

// Quiz option structure
export interface QuizOption {
  id: string;
  text: string;
  image_url?: string | null;
  is_correct: boolean;
}

// Extended types with relationships
export interface LessonWithSlides extends Lesson {
  slides: LessonSlide[];
}

export interface LessonWithQuiz extends Lesson {
  quiz_questions: LessonQuizQuestion[];
}

export interface LessonComplete extends Lesson {
  slides: LessonSlide[];
  quiz_questions: LessonQuizQuestion[];
}

export interface LessonSlideWithQuiz extends LessonSlide {
  quiz_question?: LessonQuizQuestion | null;
}

// Helper types for creating lessons
export interface CreateLessonInput {
  slug: string;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
  type: LessonType;
  content_type: ContentType;
  persona_tags?: string[];
  goal_tags?: string[];
  world_id?: string | null;
  order?: number;
  is_active?: boolean;
  slides?: CreateLessonSlideInput[];
  quiz_questions?: CreateQuizQuestionInput[];
}

export interface CreateLessonSlideInput {
  order: number;
  image_url: string;
  alt_text?: string | null;
  audio_url?: string | null;
  duration_seconds?: number | null;
  has_interaction?: boolean;
  interaction_type?: InteractionType;
}

export interface CreateQuizQuestionInput {
  question_text: string;
  question_image_url?: string | null;
  options: QuizOption[];
  order: number;
  slide_id?: string | null;
}

// Filter and query types
export interface LessonFilters {
  type?: LessonType;
  content_type?: ContentType;
  persona_tags?: string[];
  goal_tags?: string[];
  world_id?: string | null;
  is_active?: boolean;
}

export interface LessonQueryOptions {
  filters?: LessonFilters;
  orderBy?: 'order' | 'created_at' | 'title';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Response types
export interface LessonListResponse {
  lessons: Lesson[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LessonDetailResponse {
  lesson: LessonComplete;
}

