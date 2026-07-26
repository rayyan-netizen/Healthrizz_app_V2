export const PASS_THRESHOLD = 0.9;

export interface QuizResult {
  accuracy: number;
  passed: boolean;
  stars: number;
}

export function computeQuizResult(
  correctCount: number,
  totalQuestions: number
): QuizResult {
  const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  const passed = accuracy >= PASS_THRESHOLD;
  const stars = accuracy >= 1 ? 3 : accuracy >= 0.9 ? 2 : accuracy >= 0.8 ? 1 : 0;
  return { accuracy, passed, stars };
}
