/**
 * Learning data fetchers — lessons, slides, quiz questions.
 * Lessons + slides + quiz questions are served from local-lessons.ts
 * fixtures (same pattern as web's `lessons.ts` — DB may hold stale seeds).
 * Node completion is recorded by core/map/progress.ts, writing to the
 * real Supabase child_map_progress table.
 */
import { getLessonById } from './fixtures';

export interface LessonRow {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  type: string | null;
  world_id: string | null;
}

export interface SlideRow {
  id: string;
  lesson_id: string;
  slide_order: number;
  image_url?: string | null;
  alt_text?: string | null;
  content?: string | null;
  coach_line?: string | null;
  zone_label?: string | null;
  accent_color?: string | null;
  mascot_image?: string | null;
  mascot_tip?: string | null;
  micro_check?: {
    prompt: string;
    options: string[];
    correct_index: number;
  } | null;
  audio_url?: string | null;
}

export interface QuizQuestionRow {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string | null;
}

export async function fetchLesson(lessonId: string): Promise<{
  lesson: LessonRow;
  slides: SlideRow[];
}> {
  const got = getLessonById(lessonId);
  if (got) return { lesson: got.lesson, slides: got.slides };
  throw new Error(`Lesson "${lessonId}" not found in fixtures`);
}

export async function fetchQuizQuestions(
  lessonId: string
): Promise<QuizQuestionRow[]> {
  const got = getLessonById(lessonId);
  return got?.questions ?? [];
}
