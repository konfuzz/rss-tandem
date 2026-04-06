import type { QuizResultSummary, QuizRound, QuizSummaryCategory } from '../stores/quiz';

export interface FinishQuizPayload {
  answers: QuizRound[];
  complexity: string;
  totalDuration: number;
  totalScore: number;
}

export interface QuizStats {
  answeredQuestions: number;
  averageScore: number;
  categories: QuizSummaryCategory[];
  perfectAnswers: number;
  totalDuration: number;
  totalScore: number;
}

interface BuildQuizSummaryOptions {
  completedAt?: string;
  resultId?: null | number;
  stats: QuizStats;
  totalQuestions: number;
}

export function buildFinishQuizPayload(
  answers: QuizRound[],
  complexity: string,
  stats: Pick<QuizStats, 'totalDuration' | 'totalScore'>,
): FinishQuizPayload {
  return {
    answers,
    complexity,
    totalDuration: stats.totalDuration,
    totalScore: stats.totalScore,
  };
}

export function buildQuizSummary({
  completedAt = new Date().toISOString(),
  resultId = null,
  stats,
  totalQuestions,
}: BuildQuizSummaryOptions): QuizResultSummary {
  return {
    ...stats,
    completedAt,
    resultId,
    totalQuestions,
  };
}

export function calculateQuizStats(answers: QuizRound[]): QuizStats {
  const answeredQuestions = answers.length;
  const totalDuration = answers.reduce((acc, curr) => acc + curr.time, 0);
  const totalScore = Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) * 10) / 10;
  const categoriesMap = new Map<string, { count: number; totalScore: number }>();

  answers.forEach((answer) => {
    const current = categoriesMap.get(answer.category);

    if (current) {
      current.count += 1;
      current.totalScore += answer.score;
      return;
    }

    categoriesMap.set(answer.category, { count: 1, totalScore: answer.score });
  });

  return {
    answeredQuestions,
    averageScore: answeredQuestions > 0 ? Number((totalScore / answeredQuestions).toFixed(1)) : 0,
    categories: Array.from(categoriesMap, ([name, categoryStats]) => ({
      averageScore: Number((categoryStats.totalScore / categoryStats.count).toFixed(1)),
      name,
    })),
    perfectAnswers: answers.filter((answer) => answer.score === 10).length,
    totalDuration,
    totalScore,
  };
}
