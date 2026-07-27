/**
 * Adapter from local-lessons.ts (web verbatim) to the LessonRow + SlideRow
 * shape expected by the lesson player. In demo mode we serve real content.
 */
import { getLocalLessonBySlug } from './content/local-lessons';
import type { LessonRow, SlideRow, QuizQuestionRow } from './api';
import type { LessonSlide as LessonSlideType, LessonQuizQuestion as LQQ, QuizOption } from './types-lessons';

function adapt(local: ReturnType<typeof getLocalLessonBySlug>) {
  if (!local) return null;
  const lesson: LessonRow = {
    id: local.id,
    slug: local.slug,
    title: local.title,
    description: local.description ?? null,
    duration_minutes: local.duration_minutes ?? null,
    type: local.type ?? null,
    world_id: local.world_id ?? null,
  };
  const slides: SlideRow[] = local.slides.map((s: LessonSlideType) => ({
    id: s.id,
    lesson_id: s.lesson_id,
    slide_order: s.order,
    image_url: s.image_url,
    alt_text: s.alt_text,
    content: s.alt_text ?? '',
    coach_line: s.coach_line ?? null,
    zone_label: s.zoneLabel ?? null,
    accent_color: s.accentColor ?? null,
    mascot_image: s.mascotImage ?? null,
    mascot_tip: s.mascotTip ?? null,
    micro_check: s.micro_check ?? null,
    audio_url: s.audio_url ?? null,
  }));
  const questions: QuizQuestionRow[] = (local.quiz_questions ?? []).map((q: LQQ) => {
    const correctIdx = q.options.findIndex((o: QuizOption) => o.is_correct);
    return {
      id: q.id,
      lesson_id: q.lesson_id,
      question: q.question_text,
      options: q.options.map((o: QuizOption) => o.text),
      correct_answer: correctIdx >= 0 ? correctIdx : 0,
      explanation: null,
    };
  });
  return { lesson, slides, questions };
}

export function getLessonById(
  lessonId: string
): { lesson: LessonRow; slides: SlideRow[]; questions: QuizQuestionRow[] } | null {
  const direct = adapt(getLocalLessonBySlug(lessonId));
  if (direct) return direct;
  const key = lessonId.replace(/-lesson$/, '');
  return adapt(getLocalLessonBySlug(`${key}-lesson`));
}
